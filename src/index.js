require('dotenv').config();
const http = require('node:http');
const { Client, GatewayIntentBits } = require('discord.js');
const setupGuild = require('./setup');
const { CONFIGS, getConfig, getConfigByKey } = require('./config');
const { handleInteraction, handleMessage, handleGuildMemberAdd } = require('./components');
const { registerCommands, handleCommand } = require('./commands');
const { syncGuildTags, syncMemberTag } = require('./team');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !GUILD_ID) {
  console.error('[erro] Defina DISCORD_TOKEN e GUILD_ID no arquivo .env (use o .env.example como base).');
  process.exit(1);
}

const setupOnly = process.argv.includes('--setup-only');
const BASE_INTENTS = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages];

function targetFor(key) {
  const direct = getConfig(key);
  if (direct) return { id: key, cfg: direct };

  const cfg = getConfigByKey(key);
  if (!cfg) return null;

  const entry = [...CONFIGS.entries()].find(([, value]) => value === cfg);
  return entry ? { id: entry[0], cfg } : null;
}

function resolveTargets() {
  const key = process.env.SETUP_GUILD;
  if (setupOnly && key) {
    const target = targetFor(key);
    if (!target) {
      console.error(`[erro] Nenhuma configuração encontrada para SETUP_GUILD="${key}".`);
      process.exit(1);
    }
    return [target];
  }
  if (setupOnly) return [{ id: GUILD_ID, cfg: getConfig(GUILD_ID) }].filter((target) => target.cfg);
  return [...CONFIGS.entries()].map(([id, cfg]) => ({ id, cfg }));
}

function attach(client) {
  client.once('ready', async () => {
    console.log(`[info] Conectado como ${client.user.tag}`);

    const targets = resolveTargets();

    try {
      for (const { id, cfg } of targets) {
        const guild = await client.guilds.fetch(id);
        await setupGuild(client, guild, cfg);
      }

      if (setupOnly) {
        console.log('[ok] Estrutura concluída.');
        client.destroy();
        process.exit(0);
      }

      for (const { id } of targets) {
        const guild = await client.guilds.fetch(id);
        await registerCommands(guild);
      }
    } catch (error) {
      console.error(`[erro] ${error.message ?? error}`);
      process.exit(1);
    }

    console.log('[ok] Bot online. Mantenha este terminal aberto para botões, tickets e comandos funcionarem.');

    const syncTags = async () => {
      for (const { id, cfg } of targets) {
        const guild = await client.guilds.fetch(id).catch(() => null);
        if (guild) await syncGuildTags(guild, cfg).catch(() => {});
      }
    };
    setInterval(() => syncTags().catch(() => {}), 10 * 60 * 1000);
  });

  client.on('interactionCreate', (interaction) => {
    if (!interaction.guild || !getConfig(interaction.guildId)) return;
    if (interaction.isChatInputCommand()) handleCommand(interaction);
    else handleInteraction(interaction);
  });

  client.on('messageCreate', (message) => handleMessage(message));
  client.on('guildMemberAdd', (member) => handleGuildMemberAdd(member));
  client.on('guildMemberUpdate', (oldMember, newMember) => {
    const cfg = getConfig(newMember.guild.id);
    if (cfg) syncMemberTag(newMember, cfg).catch(() => {});
  });
}

function launch(intents, allowFallback) {
  const client = new Client({ intents });
  attach(client);

  client.login(TOKEN).catch((error) => {
    const message = String(error?.message ?? error);
    if (allowFallback && /disallowed intents/i.test(message)) {
      console.warn('[aviso] Ative "Server Members Intent" no portal do bot para o autorole funcionar. Conectando sem autorole...');
      launch(BASE_INTENTS, false);
      return;
    }
    console.error(`[erro] Falha ao conectar: ${message}`);
    process.exit(1);
  });
}

function startKeepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) return;

  const port = Number(process.env.PORT) || 3000;
  http
    .createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('RP Bot online');
    })
    .listen(port, () => console.log(`[ok] Servidor HTTP na porta ${port} (keep-alive do Render).`));

  setInterval(() => fetch(url).catch(() => {}), 10 * 60 * 1000);
  console.log('[ok] Auto-ping ativado: o Render não vai dormir.');
}

startKeepAlive();
launch([...BASE_INTENTS, GatewayIntentBits.GuildMembers], true);
