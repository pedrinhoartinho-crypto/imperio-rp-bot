const http = require('node:http');
const crypto = require('node:crypto');
const { EmbedBuilder } = require('discord.js');
const { CONFIGS, getConfig, getConfigByKey } = require('./config');

// Cada categoria do jogo cai em um canal separado da categoria 「📊」LOGS.
const CATEGORY_MAP = {
  anticheat: { ref: 'logs-anticheat', label: 'Anticheat', color: 0x8b0000 },
  veiculos: { ref: 'logs-veiculos', label: 'Veículos', color: 0xa04000 },
  armas: { ref: 'logs-armas', label: 'Armas', color: 0x8b0000 },
  fabricacao: { ref: 'logs-fabricacao', label: 'Fabricação', color: 0x1e8449 },
  drops: { ref: 'logs-drops', label: 'Drops', color: 0x2e86c1 },
  transferencias: { ref: 'logs-transferencias', label: 'Transferências', color: 0x2e86c1 },
  mortes: { ref: 'logs-mortes', label: 'Mortes', color: 0x4f545c },
  comandos: { ref: 'logs-comandos', label: 'Comandos', color: 0xd4af37 },
  economia: { ref: 'logs-economia', label: 'Economia', color: 0x1e8449 },
  entradas: { ref: 'logs-entradas', label: 'Entradas/Saídas', color: 0x2e86c1 },
  sistema: { ref: 'logs-sistema', label: 'Sistema', color: 0x4f545c },
};

const queues = new Map();
const channelCache = new Map();
const rateHits = new Map();
let serverStarted = false;
let clientRef = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function truncate(value, limit) {
  const text = String(value ?? '').replace(/\r/g, '');
  return text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 1))}…`;
}

function sendJson(res, status, payload) {
  if (res.writableEnded) return;
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        reject(new Error('payload muito grande'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function tokenOk(req) {
  const expected = process.env.LOG_TOKEN;
  if (!expected) return false;

  const header =
    req.headers['x-log-token'] ||
    String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i)?.[1] ||
    '';

  const a = Buffer.from(String(header));
  const b = Buffer.from(String(expected));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function rateLimited(ip) {
  const now = Date.now();
  const entry = rateHits.get(ip);

  if (!entry || now - entry.start > 60_000) {
    rateHits.set(ip, { start: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > 180;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateHits) {
    if (now - entry.start > 120_000) rateHits.delete(ip);
  }
}, 60_000).unref?.();

function resolveGuild(client, body) {
  if (!client?.isReady()) return null;

  const candidates = [];
  const push = (value) => {
    if (!value) return;
    const id = String(value);
    if (id && !candidates.includes(id)) candidates.push(id);
  };

  push(body.guildId);
  push(body.guild);
  push(process.env.LOG_GUILD_ID);
  push(process.env.GUILD_ID);

  for (const key of [body.guild, body.guildId]) {
    const cfg = getConfigByKey(key);
    if (cfg) push(cfg.GUILD_ID);
  }

  for (const id of candidates) {
    const guild = client.guilds.cache.get(id);
    if (guild) return guild;
  }

  for (const [id] of CONFIGS) {
    const guild = client.guilds.cache.get(id);
    if (guild) return guild;
  }

  return client.guilds.cache.size === 1 ? client.guilds.cache.first() : null;
}

async function resolveChannel(guild, ref) {
  const cfg = getConfig(guild.id);
  if (!cfg) return null;

  const name = cfg.CHANNEL_REFS?.[ref] || ref;
  const cacheKey = `${guild.id}:${name}`;
  const cachedId = channelCache.get(cacheKey);

  if (cachedId) {
    const cached = guild.channels.cache.get(cachedId);
    if (cached) return cached;
    channelCache.delete(cacheKey);
  }

  const matches = (channel) =>
    channel.name === name && (typeof channel.isTextBased !== 'function' || channel.isTextBased());

  let channel = guild.channels.cache.find(matches);

  if (!channel) {
    await guild.channels.fetch().catch(() => {});
    channel = guild.channels.cache.find(matches);
  }

  if (channel) channelCache.set(cacheKey, channel.id);
  return channel || null;
}

function buildFields(body) {
  const fields = [];
  const push = (name, value, inline = true) => {
    if (value === undefined || value === null || value === '') return;
    fields.push({
      name: truncate(name || '—', 256),
      value: truncate(value, 1024),
      inline: Boolean(inline),
    });
  };

  if (Array.isArray(body.fields) && body.fields.length) {
    for (const field of body.fields) {
      if (!field || typeof field !== 'object') continue;
      push(field.name ?? field.label ?? '—', field.value ?? field.val ?? '—', field.inline !== false);
      if (fields.length >= 25) break;
    }
  } else if (body.player && typeof body.player === 'object') {
    push('Jogador', body.player.name ?? body.player.Name ?? '—', true);
    push('User ID', body.player.userId ?? body.player.UserId ?? '—', true);
  }

  return fields.slice(0, 25);
}

function buildEmbed(body, category) {
  const date = body.timestamp ? new Date(body.timestamp) : new Date();
  const timestamp = Number.isNaN(date.getTime()) ? new Date() : date;

  const embed = new EmbedBuilder()
    .setColor(Number.isInteger(body.color) ? body.color : category.color)
    .setTimestamp(timestamp)
    .setTitle(truncate(body.title || category.label, 256));

  const description = body.description ?? body.message;
  if (description) embed.setDescription(truncate(description, 4096));
  if (body.url && /^https?:\/\//i.test(String(body.url))) embed.setURL(String(body.url));

  const fields = buildFields(body);
  if (fields.length) embed.addFields(fields);

  const footer = [];
  if (body.server) footer.push(truncate(body.server, 100));
  if (body.jobId) footer.push(truncate(`Job ${body.jobId}`, 100));
  if (body.placeId) footer.push(truncate(`Place ${body.placeId}`, 100));
  if (footer.length) embed.setFooter({ text: truncate(footer.join(' • '), 2048) });

  return embed;
}

async function pump(queue) {
  if (queue.sending) return;
  queue.sending = true;

  while (queue.items.length) {
    const embed = queue.items.shift();

    try {
      await queue.channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    } catch (error) {
      if (error?.code === 10003) {
        queue.items.length = 0;
        break;
      }

      console.warn(`[logs] Falha ao enviar em #${queue.channel.name}: ${error.message}`);

      if (error?.httpStatus === 429 || error?.status === 429) {
        queue.items.unshift(embed);
        await sleep(Number(error.retryAfter ?? error.retry_after ?? 5) * 1000);
      }
    }

    await sleep(1100);
  }

  queue.sending = false;
  if (!queue.items.length) queues.delete(queue.channel.id);
}

function enqueue(channel, embed) {
  let queue = queues.get(channel.id);

  if (!queue) {
    queue = { channel, items: [], sending: false };
    queues.set(channel.id, queue);
  }

  if (queue.items.length >= 200) queue.items.shift();
  queue.items.push(embed);
  void pump(queue);
}

async function processBatch(body, client) {
  const entries = (Array.isArray(body) ? body : [body]).slice(0, 25);
  let queued = 0;

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;

    const categoryKey = String(entry.category ?? entry.type ?? 'sistema').toLowerCase();
    const category = CATEGORY_MAP[categoryKey] || CATEGORY_MAP.sistema;
    const guild = resolveGuild(client, entry);
    if (!guild) continue;

    const channel = await resolveChannel(guild, category.ref);
    if (!channel) continue;

    enqueue(channel, buildEmbed(entry, category));
    queued += 1;
  }

  return queued;
}

async function handleRequest(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
    return sendJson(res, 200, {
      ok: true,
      bot: clientRef?.user?.tag ?? null,
      logs: Boolean(process.env.LOG_TOKEN),
      categories: Object.keys(CATEGORY_MAP),
    });
  }

  const logPaths = new Set(['/api/game-log', '/api/logs', '/api/log']);

  if (req.method === 'POST' && logPaths.has(url.pathname)) {
    if (!process.env.LOG_TOKEN) {
      return sendJson(res, 503, { ok: false, error: 'LOG_TOKEN não configurado no bot.' });
    }

    if (!tokenOk(req)) {
      return sendJson(res, 401, { ok: false, error: 'token inválido' });
    }

    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
      .split(',')[0]
      .trim();
    if (rateLimited(ip)) {
      return sendJson(res, 429, { ok: false, error: 'rate limit' });
    }

    if (!clientRef?.isReady()) {
      return sendJson(res, 503, { ok: false, error: 'bot ainda conectando' });
    }

    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      return sendJson(res, 400, { ok: false, error: 'JSON inválido' });
    }

    const queued = await processBatch(body, clientRef);
    if (!queued) {
      return sendJson(res, 503, {
        ok: false,
        error: 'nenhum canal de log encontrado; rode o setup do bot.',
      });
    }

    return sendJson(res, 202, { ok: true, queued });
  }

  return sendJson(res, 404, { ok: false, error: 'not found' });
}

function startHttpServer(client) {
  if (serverStarted) return;
  serverStarted = true;
  clientRef = client;

  const port = Number(process.env.PORT) || 3000;
  const server = http.createServer((req, res) => {
    void handleRequest(req, res).catch((error) => {
      console.error(`[logs] ${error.message}`);
      sendJson(res, 500, { ok: false, error: 'internal error' });
    });
  });

  server.on('error', (error) => {
    console.error(`[erro] Servidor HTTP: ${error.message}`);
  });

  server.listen(port, () => {
    console.log(`[ok] HTTP de logs na porta ${port} (POST /api/game-log).`);
  });

  const publicUrl = process.env.RENDER_EXTERNAL_URL;
  if (publicUrl) {
    setInterval(() => fetch(publicUrl).catch(() => {}), 10 * 60 * 1000);
    console.log('[ok] Auto-ping do Render ativado.');
  }
}

module.exports = { startHttpServer, CATEGORY_MAP };
