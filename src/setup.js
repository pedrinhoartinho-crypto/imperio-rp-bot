const {
  ChannelType,
  MessageFlags,
  Routes,
  PermissionFlagsBits: P,
  GuildVerificationLevel,
  GuildExplicitContentFilter,
  GuildDefaultMessageNotifications,
  AutoModerationRuleTriggerType: Trigger,
  AutoModerationRuleKeywordPresetType: Preset,
  AutoModerationActionType: Action,
  AutoModerationRuleEventType: Event,
} = require('discord.js');
const { buildMessage, stylize, LEGACY_TITLES } = require('./embeds');
const { buildPanel, titleOfPanel, titleOfPayload, panelFingerprint } = require('./v2');
const { getConfig } = require('./config');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TYPE_BY_NAME = {
  text: ChannelType.GuildText,
  announcement: ChannelType.GuildAnnouncement,
  voice: ChannelType.GuildVoice,
  stage: ChannelType.GuildStageVoice,
  forum: ChannelType.GuildForum,
};

function buildOverwrites(preset, ctx, chCfg = {}) {
  const { cfg } = ctx;
  const everyone = ctx.guild.roles.everyone.id;
  const roleId = (key) => ctx.roles[key]?.id;
  const staff = cfg.STAFF_KEYS.map(roleId).filter(Boolean);
  const senior = cfg.STAFF_SENIOR_KEYS.map(roleId).filter(Boolean);
  const junior = cfg.STAFF_KEYS.filter((key) => !cfg.STAFF_SENIOR_KEYS.includes(key))
    .map(roleId)
    .filter(Boolean);
  const leaders = cfg.LEADER_KEYS.map(roleId).filter(Boolean);
  const org = (chCfg.orgKeys ?? []).map(roleId).filter(Boolean);
  const muted = roleId('mutado');
  const allowAll = [
    P.ViewChannel,
    P.SendMessages,
    P.SendMessagesInThreads,
    P.EmbedLinks,
    P.AttachFiles,
    P.ReadMessageHistory,
    P.AddReactions,
  ];
  const botAllow = [
    P.ViewChannel,
    P.SendMessages,
    P.SendMessagesInThreads,
    P.EmbedLinks,
    P.AttachFiles,
    P.ReadMessageHistory,
    P.ManageMessages,
  ];
  const denyWrite = [P.SendMessages, P.SendMessagesInThreads, P.CreatePublicThreads, P.CreatePrivateThreads];
  const mutedDeny = [...denyWrite, P.AddReactions, P.Speak, P.Stream];
  const staffThreads = [...allowAll, P.ManageThreads, P.ManageMessages];

  const overwrites = [];
  const push = (id, allow = [], deny = []) => {
    if (id) overwrites.push({ id, allow, deny });
  };

  switch (preset) {
    case 'readonly':
      push(everyone, [P.ViewChannel, P.ReadMessageHistory, P.AddReactions], denyWrite);
      staff.forEach((id) => push(id, allowAll));
      break;
    case 'leaders':
      push(everyone, [P.ViewChannel, P.ReadMessageHistory, P.AddReactions], denyWrite);
      staff.forEach((id) => push(id, allowAll));
      (chCfg.orgKeys ? org : leaders).forEach((id) => push(id, allowAll));
      break;
    case 'staff':
      push(everyone, [], [P.ViewChannel]);
      staff.forEach((id) => push(id, allowAll));
      break;
    case 'staff-high':
      push(everyone, [], [P.ViewChannel]);
      senior.forEach((id) => push(id, allowAll));
      junior.forEach((id) => push(id, [], [P.ViewChannel]));
      break;
    case 'apply':
      push(
        everyone,
        [
          P.ViewChannel,
          P.ReadMessageHistory,
          P.SendMessages,
          P.SendMessagesInThreads,
          P.CreatePublicThreads,
          P.AddReactions,
          P.AttachFiles,
          P.EmbedLinks,
        ],
        [P.CreatePrivateThreads],
      );
      staff.forEach((id) => push(id, staffThreads));
      break;
    case 'report':
      push(
        everyone,
        [P.ViewChannel, P.SendMessages, P.SendMessagesInThreads, P.EmbedLinks, P.AttachFiles, P.AddReactions],
        [P.ReadMessageHistory],
      );
      staff.forEach((id) => push(id, allowAll));
      break;
    case 'org':
      push(everyone, [], [P.ViewChannel]);
      staff.forEach((id) => push(id, allowAll));
      org.forEach((id) => push(id, allowAll));
      break;
    case 'recruit':
      push(
        everyone,
        [P.ViewChannel, P.ReadMessageHistory, P.SendMessagesInThreads, P.AddReactions],
        [P.SendMessages, P.CreatePublicThreads, P.CreatePrivateThreads],
      );
      staff.forEach((id) => push(id, staffThreads));
      org.forEach((id) => push(id, [...allowAll, P.CreatePublicThreads]));
      break;
    case 'public':
    default:
      break;
  }

  push(ctx.botId, botAllow);
  if (muted && preset !== 'staff-high') push(muted, [], mutedDeny);

  return overwrites;
}

const bitsOf = (arr) => arr.reduce((acc, p) => acc | p, 0n);

function overwritesMatch(channel, expected) {
  const actual = channel.permissionOverwrites.cache;
  if (actual.size !== expected.length) return false;
  return expected.every((o) => {
    const cur = actual.get(o.id);
    return cur && cur.allow.bitfield === bitsOf(o.allow) && cur.deny.bitfield === bitsOf(o.deny);
  });
}

async function ensureRoles(ctx) {
  const { guild, cfg } = ctx;
  let created = 0;
  let reused = 0;

  for (const roleCfg of cfg.ROLES) {
    let role = guild.roles.cache.find((r) => r.name === roleCfg.name);

    if (!role && cfg.LEGACY_ROLES[roleCfg.name]) {
      for (const legacyName of cfg.LEGACY_ROLES[roleCfg.name]) {
        const legacy = guild.roles.cache.find((r) => r.name.toLowerCase() === legacyName.toLowerCase());
        if (!legacy) continue;
        role = await legacy.setName(roleCfg.name).catch(() => legacy);
        console.log(`[ok] Cargo renomeado: ${legacyName} → ${roleCfg.name}`);
        break;
      }
    }

    if (role) {
      reused += 1;
      const patch = {};
      const color = parseInt(roleCfg.color.slice(1), 16);
      if (role.color !== color) patch.color = roleCfg.color;
      if (role.hoist !== (roleCfg.hoist ?? false)) patch.hoist = roleCfg.hoist ?? false;
      if (role.mentionable !== (roleCfg.mentionable ?? false)) patch.mentionable = roleCfg.mentionable ?? false;
      if (Object.keys(patch).length) {
        try {
          await role.edit(patch);
          console.log(`[ok] Cargo ajustado: ${role.name}`);
        } catch (error) {
          console.warn(`[aviso] Não foi possível ajustar o cargo ${role.name}: ${error.message}`);
        }
      }
    } else {
      const permissions = (roleCfg.perms ?? []).reduce((acc, name) => acc | P[name], 0n);
      role = await guild.roles.create({
        name: roleCfg.name,
        color: roleCfg.color,
        hoist: roleCfg.hoist ?? false,
        mentionable: roleCfg.mentionable ?? false,
        permissions,
        reason: `${cfg.SERVIDOR} · configuração automática`,
      });
      created += 1;
      console.log(`[ok] Cargo criado: ${role.name}`);
      await wait(400);
    }

    ctx.roles[roleCfg.key] = role;
  }

  const me = await guild.members.fetchMe();
  const botRole = me.roles.highest;
  const ordered = [botRole, ...cfg.ROLES.map((roleCfg) => ctx.roles[roleCfg.key])].filter(Boolean);
  const known = new Set(ordered.map((role) => role.id));
  const extras = guild.roles.cache.filter((role) => role.id !== guild.id && !known.has(role.id));
  const all = [...ordered, ...extras.values()];

  let top = guild.roles.cache.size - 1;
  const positions = [];
  for (const role of all) {
    if (role.position !== top) positions.push({ role, position: top });
    top -= 1;
  }

  if (positions.length) {
    try {
      await guild.roles.setPositions(positions);
      console.log(`[ok] Hierarquia de cargos aplicada (${positions.length} ajuste(s)).`);
    } catch (error) {
      console.warn(`[aviso] Não foi possível ajustar a hierarquia de cargos: ${error.message}`);
    }
  }

  return { created, reused };
}

async function applyAutorole(ctx) {
  const { cfg } = ctx;
  const roleCfg = cfg.ROLES.find((role) => role.key === cfg.AUTO_ROLE_KEY);
  const role = roleCfg ? ctx.roles[roleCfg.key] : null;
  if (!role) return;

  let members;
  try {
    members = await ctx.guild.members.fetch();
  } catch (error) {
    console.warn(`[aviso] Autorole em massa indisponível (ative a Server Members Intent): ${error.message}`);
    return;
  }

  let applied = 0;
  for (const member of members.values()) {
    if (member.user.bot || member.roles.cache.has(role.id)) continue;
    await member.roles.add(role, 'Autorole: aplicação em massa').catch(() => {});
    applied += 1;
    await wait(200);
  }

  if (applied) console.log(`[ok] Autorole ${role.name} aplicado a ${applied} membro(s) existente(s).`);
}

async function ensureChannels(ctx) {
  const { guild, cfg } = ctx;
  const pendingMessages = [];
  let created = 0;
  let reused = 0;

  for (const catCfg of cfg.CATEGORIES) {
    let category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === catCfg.name,
    );

    if (!category && cfg.LEGACY_CATEGORIES[catCfg.name]) {
      for (const legacyName of cfg.LEGACY_CATEGORIES[catCfg.name]) {
        const legacy = guild.channels.cache.find(
          (c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === legacyName.toLowerCase(),
        );
        if (!legacy) continue;
        category = await legacy.setName(catCfg.name).catch(() => legacy);
        console.log(`[ok] Categoria renomeada: ${legacyName} → ${catCfg.name}`);
        break;
      }
    }

    if (category) {
      reused += 1;
    } else {
      category = await guild.channels.create({
        name: catCfg.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: buildOverwrites(catCfg.preset, ctx, catCfg),
        reason: `${cfg.SERVIDOR} · configuração automática`,
      });
      created += 1;
      console.log(`[ok] Categoria criada: ${category.name}`);
      await wait(400);
    }

    for (const chCfg of catCfg.channels) {
      const preset = chCfg.preset ?? catCfg.preset;
      const type = TYPE_BY_NAME[chCfg.type ?? 'text'];
      let channel = guild.channels.cache.find(
        (c) => c.name === chCfg.name && c.parentId === category.id,
      );

      if (!channel && cfg.LEGACY_CHANNELS[chCfg.name]) {
        const typeMatches = (c) =>
          type === ChannelType.GuildText || type === ChannelType.GuildAnnouncement
            ? c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement
            : c.type === type;

        for (const legacyName of cfg.LEGACY_CHANNELS[chCfg.name]) {
          const legacy = guild.channels.cache.find(
            (c) => c.name.toLowerCase() === legacyName.toLowerCase() && typeMatches(c),
          );
          if (!legacy) continue;
          try {
            await legacy.setParent(category.id, { lockPermissions: false });
            channel = await legacy.setName(chCfg.name);
          } catch (error) {
            console.warn(`[aviso] Não foi possível renomear ${legacyName}: ${error.message}`);
            channel = legacy;
          }
          console.log(`[ok] Canal renomeado: ${legacyName} → ${chCfg.name}`);
          break;
        }
      }

      const isNew = !channel;

      if (!isNew && type === ChannelType.GuildAnnouncement && channel.type === ChannelType.GuildText) {
        try {
          await guild.client.rest.patch(Routes.channel(channel.id), {
            body: { type: ChannelType.GuildAnnouncement },
            reason: `${cfg.SERVIDOR} · configuração automática`,
          });
          console.log(`[ok] Canal convertido para anúncios: ${chCfg.name}`);
        } catch (error) {
          console.warn(`[aviso] Não foi possível converter ${chCfg.name} em canal de anúncios: ${error.message}`);
        }
      }

      if (isNew) {
        const options = {
          name: chCfg.name,
          type,
          parent: category.id,
          reason: `${cfg.SERVIDOR} · configuração automática`,
        };
        if (
          type === ChannelType.GuildText ||
          type === ChannelType.GuildAnnouncement ||
          type === ChannelType.GuildForum
        ) {
          options.topic = chCfg.topic;
        }
        if (chCfg.userLimit) options.userLimit = chCfg.userLimit;
        if (chCfg.rateLimit) options.rateLimitPerUser = chCfg.rateLimit;
        if (type === ChannelType.GuildForum && chCfg.tags?.length) {
          options.availableTags = chCfg.tags.map((name) => ({ name, moderated: false }));
        }
        if (preset !== catCfg.preset) options.permissionOverwrites = buildOverwrites(preset, ctx, chCfg);

        try {
          channel = await guild.channels.create(options);
          created += 1;
          console.log(`[ok] Canal criado: ${channel.name}`);
          await wait(400);
        } catch (error) {
          const dica =
            type === ChannelType.GuildStageVoice
              ? ' (canais de palco exigem o recurso "Comunidade" ativado no servidor)'
              : '';
          console.warn(`[aviso] Não foi possível criar o canal ${chCfg.name}: ${error.message}${dica}`);
          continue;
        }
      } else {
        reused += 1;
        if (type === ChannelType.GuildForum && chCfg.tags?.length) {
          const current = channel.availableTags.map((tag) => tag.name);
          const changed =
            current.length !== chCfg.tags.length || chCfg.tags.some((name, index) => name !== current[index]);
          if (changed) {
            try {
              await channel.edit({ availableTags: chCfg.tags.map((name) => ({ name })) });
              console.log(`[ok] Tags do fórum ajustadas: ${chCfg.name}`);
            } catch (error) {
              console.warn(`[aviso] Não foi possível ajustar as tags de ${chCfg.name}: ${error.message}`);
            }
          }
        }
        if (preset !== catCfg.preset) {
          const expected = buildOverwrites(preset, ctx, chCfg);
          if (!overwritesMatch(channel, expected)) {
            try {
              await channel.permissionOverwrites.set(expected);
              console.log(`[ok] Permissões ajustadas: ${chCfg.name}`);
            } catch (error) {
              console.warn(`[aviso] Não foi possível ajustar as permissões de ${chCfg.name}: ${error.message}`);
            }
          }
        } else if (channel.permissionOverwrites.cache.size) {
          const expected = buildOverwrites(catCfg.preset, ctx, catCfg);
          if (overwritesMatch(channel, expected)) {
            try {
              await channel.permissionOverwrites.set([]);
              console.log(`[ok] Permissões herdadas: ${chCfg.name}`);
            } catch (error) {
              console.warn(`[aviso] Não foi possível limpar as permissões de ${chCfg.name}: ${error.message}`);
            }
          }
        }
      }

      if (chCfg.ref) ctx.channels[chCfg.ref] = channel.id;
      if (!isNew && channel.type === ChannelType.GuildForum) continue;
      if (chCfg.panel && cfg.LAYOUT === 'v2') {
        const icon = chCfg.name.includes('・') ? chCfg.name.split('・')[0] : undefined;
        pendingMessages.push({ channel, panel: chCfg.panel, icon, isNew });
      } else if (chCfg.message) {
        pendingMessages.push({ channel, key: chCfg.message, isNew });
      }
    }
  }

  for (const { channel, key, panel: panelDef, icon, isNew } of pendingMessages) {
    const payload = panelDef ? buildPanel(panelDef, { ...ctx, channelIcon: icon }) : buildMessage(key, ctx);
    if (!payload) continue;

    try {
      if (!isNew) {
        const recent = await channel.messages.fetch({ limit: 30 }).catch(() => null);
        if (!recent) continue;

        const mine = recent.filter((message) => message.author.id === ctx.botId);

        if (panelDef) {
          const expected = titleOfPayload(payload);
          const fingerprint = panelFingerprint(payload);
          const current = mine.find(
            (message) =>
              message.flags.has(MessageFlags.IsComponentsV2) && titleOfPanel(message) === expected,
          );
          if (current && panelFingerprint(current) === fingerprint) continue;

          const outdated = mine.find(
            (message) => message.flags.has(MessageFlags.IsComponentsV2) && titleOfPanel(message),
          );
          const target = current ?? outdated;
          if (target) {
            await target.edit({ components: payload.components });
            console.log(`[ok] Painel atualizado em ${channel.name}.`);
            await wait(300);
            continue;
          }
        } else {
          const styledTitle = payload.embeds[0]?.data?.title;
          const footer = payload.embeds[0]?.data?.footer?.text;
          const author = payload.embeds[0]?.data?.author?.name;
          const plainTitle = buildMessage(key, ctx, { plain: true })?.embeds[0]?.data?.title;
          const accepted = new Set([styledTitle, plainTitle].filter(Boolean));
          for (const title of [...accepted]) accepted.add(stylize(title));
          for (const title of LEGACY_TITLES[key] ?? []) {
            accepted.add(title);
            accepted.add(stylize(title));
          }

          const current = mine.find((message) =>
            message.embeds.some(
              (embed) =>
                embed.title === styledTitle && embed.footer?.text === footer && embed.author?.name === author,
            ),
          );
          if (current) continue;

          const outdated = mine.find((message) => message.embeds.some((embed) => accepted.has(embed.title)));
          if (outdated) {
            await outdated.edit(payload);
            console.log(`[ok] Painel atualizado em ${channel.name}.`);
            await wait(300);
            continue;
          }
        }
      }

      await channel.send(payload);
      await wait(300);
    } catch (error) {
      console.warn(`[aviso] Não foi possível enviar a mensagem em ${channel.name}: ${error.message}`);
    }
  }

  return { created, reused };
}

async function applyGuildSettings(ctx) {
  const { guild, cfg } = ctx;

  try {
    const base = {
      verificationLevel: GuildVerificationLevel.Low,
      explicitContentFilter: GuildExplicitContentFilter.AllMembers,
      defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
    };
    if (cfg.NAME && guild.name !== cfg.NAME) base.name = cfg.NAME;
    if (cfg.DESCRIPTION && guild.description !== cfg.DESCRIPTION) base.description = cfg.DESCRIPTION;
    if (ctx.channels['afk']) {
      base.afkChannel = ctx.channels['afk'];
      base.afkTimeout = 300;
    }
    await guild.edit(base);
    console.log('[ok] Configurações do servidor aplicadas.');
  } catch (error) {
    console.warn(`[aviso] Não foi possível aplicar as configurações do servidor: ${error.message}`);
  }

  if (ctx.channels.regras && (ctx.channels.anuncios || ctx.channels.atualizacoes)) {
    try {
      const update = {
        rulesChannel: ctx.channels.regras,
        publicUpdatesChannel: ctx.channels.anuncios ?? ctx.channels.atualizacoes,
      };
      if (!guild.features.includes('COMMUNITY')) {
        update.features = [...guild.features, 'COMMUNITY'];
        update.verificationLevel = GuildVerificationLevel.Low;
      }
      await guild.edit(update);
      console.log('[ok] Comunidade configurada (regras e atualizações).');
    } catch (error) {
      console.warn(`[aviso] Não foi possível definir os canais de comunidade: ${error.message}`);
    }
  }
}

async function applyAutoMod(ctx) {
  const { guild, cfg } = ctx;

  try {
    const existing = await guild.autoModerationRules.fetch();
    const staffIds = cfg.STAFF_KEYS.map((key) => ctx.roles[key]?.id).filter(Boolean);
    const alertChannel = ctx.channels['automod-logs'];

    const rules = [
      { name: 'Anti-spam', triggerType: Trigger.Spam },
      {
        name: 'Palavras ofensivas',
        triggerType: Trigger.KeywordPreset,
        triggerMetadata: { presets: [Preset.Slurs] },
      },
      {
        name: 'Menções em massa',
        triggerType: Trigger.MentionSpam,
        triggerMetadata: { mentionTotalLimit: 6 },
      },
      {
        name: 'Convites e links',
        triggerType: Trigger.Keyword,
        triggerMetadata: { regexPatterns: ['discord\\.gg/\\S+', 'discord\\.com/invite/\\S+'] },
      },
    ];

    for (const rule of rules) {
      const actions = [{ type: Action.BlockMessage }];
      if (alertChannel) actions.push({ type: Action.SendAlertMessage, metadata: { channel: alertChannel } });

      const options = {
        name: rule.name,
        eventType: Event.MessageSend,
        triggerType: rule.triggerType,
        actions,
        enabled: true,
        exemptRoles: staffIds,
        exemptChannels: [],
        reason: `${cfg.SERVIDOR} · configuração automática`,
      };
      if (rule.triggerMetadata) options.triggerMetadata = rule.triggerMetadata;

      const current = existing.find((r) => r.name === rule.name);
      if (current) {
        await current.edit(options);
        console.log(`[ok] AutoMod atualizado: ${rule.name}`);
      } else {
        await guild.autoModerationRules.create(options);
        console.log(`[ok] AutoMod ativo: ${rule.name}`);
      }
      await wait(400);
    }
  } catch (error) {
    console.warn(`[aviso] Não foi possível configurar o AutoMod: ${error.message}`);
  }
}

async function setupGuild(client, guild, config) {
  const cfg = config ?? getConfig(guild.id);
  if (!cfg) throw new Error(`Nenhuma configuração encontrada para o servidor ${guild.id}.`);

  await guild.roles.fetch();
  await guild.channels.fetch();

  const me = await guild.members.fetchMe();
  if (!me.permissions.has(P.ManageRoles) || !me.permissions.has(P.ManageChannels)) {
    throw new Error('O bot precisa das permissões "Gerenciar Cargos" e "Gerenciar Canais" (ou Administrador).');
  }

  const ctx = { guild, cfg, botId: client.user.id, roles: {}, channels: {} };
  console.log(`[info] Preparando "${cfg.SERVIDOR}" em: ${guild.name}`);

  const roles = await ensureRoles(ctx);
  await applyAutorole(ctx);
  const channels = await ensureChannels(ctx);
  await applyGuildSettings(ctx);
  await applyAutoMod(ctx);

  console.log('----------------------------------------');
  console.log(`[ok] Cargos: ${roles.created} criados, ${roles.reused} reaproveitados.`);
  console.log(`[ok] Canais: ${channels.created} criados, ${channels.reused} reaproveitados.`);

  return ctx;
}

module.exports = setupGuild;
