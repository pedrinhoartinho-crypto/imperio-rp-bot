const {
  ChannelType,
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
const {
  SERVIDOR,
  ROLES,
  CATEGORIES,
  AUTO_ROLE_KEY,
  STAFF_KEYS,
  STAFF_SENIOR_KEYS,
  LEADER_KEYS,
  LEGACY_CATEGORIES,
  LEGACY_CHANNELS,
  LEGACY_ROLES,
} = require('./config');
const { buildMessage, stylize, LEGACY_TITLES } = require('./embeds');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TYPE_BY_NAME = {
  text: ChannelType.GuildText,
  announcement: ChannelType.GuildAnnouncement,
  voice: ChannelType.GuildVoice,
  stage: ChannelType.GuildStageVoice,
};

function buildOverwrites(preset, ctx) {
  const everyone = ctx.guild.roles.everyone.id;
  const roleId = (key) => ctx.roles[key]?.id;
  const staff = STAFF_KEYS.map(roleId).filter(Boolean);
  const senior = STAFF_SENIOR_KEYS.map(roleId).filter(Boolean);
  const junior = STAFF_KEYS.filter((key) => !STAFF_SENIOR_KEYS.includes(key)).map(roleId).filter(Boolean);
  const leaders = LEADER_KEYS.map(roleId).filter(Boolean);
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
      leaders.forEach((id) => push(id, allowAll));
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
    case 'public':
    default:
      break;
  }

  push(ctx.botId, botAllow);
  if (muted && preset !== 'staff-high') push(muted, [], mutedDeny);

  return overwrites;
}

async function ensureRoles(ctx) {
  const { guild } = ctx;
  let created = 0;
  let reused = 0;

  for (const cfg of ROLES) {
    let role = guild.roles.cache.find((r) => r.name === cfg.name);

    if (!role && LEGACY_ROLES[cfg.name]) {
      for (const legacyName of LEGACY_ROLES[cfg.name]) {
        const legacy = guild.roles.cache.find((r) => r.name.toLowerCase() === legacyName.toLowerCase());
        if (!legacy) continue;
        role = await legacy.setName(cfg.name).catch(() => legacy);
        console.log(`[ok] Cargo renomeado: ${legacyName} → ${cfg.name}`);
        break;
      }
    }

    if (role) {
      reused += 1;
    } else {
      const permissions = (cfg.perms ?? []).reduce((acc, name) => acc | P[name], 0n);
      role = await guild.roles.create({
        name: cfg.name,
        color: cfg.color,
        hoist: cfg.hoist ?? false,
        mentionable: cfg.mentionable ?? false,
        permissions,
        reason: `${SERVIDOR} · configuração automática`,
      });
      created += 1;
      console.log(`[ok] Cargo criado: ${role.name}`);
      await wait(400);
    }

    ctx.roles[cfg.key] = role;
  }

  const me = await guild.members.fetchMe();
  const botRole = me.roles.highest;
  const ordered = [botRole, ...ROLES.map((cfg) => ctx.roles[cfg.key])].filter(Boolean);
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
  const cfg = ROLES.find((role) => role.key === AUTO_ROLE_KEY);
  const role = cfg ? ctx.roles[cfg.key] : null;
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
  const { guild } = ctx;
  const pendingMessages = [];
  let created = 0;
  let reused = 0;

  for (const catCfg of CATEGORIES) {
    let category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === catCfg.name,
    );

    if (!category && LEGACY_CATEGORIES[catCfg.name]) {
      for (const legacyName of LEGACY_CATEGORIES[catCfg.name]) {
        const legacy = guild.channels.cache.find(
          (c) =>
            c.type === ChannelType.GuildCategory && c.name.toLowerCase() === legacyName.toLowerCase(),
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
        permissionOverwrites: buildOverwrites(catCfg.preset, ctx),
        reason: `${SERVIDOR} · configuração automática`,
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

      if (!channel && LEGACY_CHANNELS[chCfg.name]) {
        const typeMatches = (c) =>
          type === ChannelType.GuildText || type === ChannelType.GuildAnnouncement
            ? c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement
            : c.type === type;

        for (const legacyName of LEGACY_CHANNELS[chCfg.name]) {
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
            reason: `${SERVIDOR} · configuração automática`,
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
          reason: `${SERVIDOR} · configuração automática`,
        };
        if (type === ChannelType.GuildText || type === ChannelType.GuildAnnouncement) options.topic = chCfg.topic;
        if (chCfg.userLimit) options.userLimit = chCfg.userLimit;
        if (preset !== catCfg.preset) options.permissionOverwrites = buildOverwrites(preset, ctx);

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
      }

      if (chCfg.ref) ctx.channels[chCfg.ref] = channel.id;
      if (chCfg.message) {
        pendingMessages.push({ channel, key: chCfg.message, isNew });
      }
    }
  }

  for (const { channel, key, isNew } of pendingMessages) {
    const payload = buildMessage(key, ctx);
    if (!payload) continue;

    try {
      if (!isNew) {
        const recent = await channel.messages.fetch({ limit: 30 }).catch(() => null);
        if (!recent) continue;

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
        const mine = recent.filter((message) => message.author.id === ctx.botId);

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

      await channel.send(payload);
      await wait(300);
    } catch (error) {
      console.warn(`[aviso] Não foi possível enviar a mensagem em ${channel.name}: ${error.message}`);
    }
  }

  return { created, reused };
}

async function applyGuildSettings(ctx) {
  const { guild } = ctx;

  try {
    const base = {
      verificationLevel: GuildVerificationLevel.Low,
      explicitContentFilter: GuildExplicitContentFilter.AllMembers,
      defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
    };
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
  const { guild } = ctx;

  try {
    const existing = await guild.autoModerationRules.fetch();
    const staffIds = STAFF_KEYS.map((key) => ctx.roles[key]?.id).filter(Boolean);
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
        exemptChannels: ctx.channels.parcerias ? [ctx.channels.parcerias] : [],
      },
    ];

    for (const rule of rules) {
      if (existing.some((r) => r.name === rule.name)) {
        console.log(`[skip] Regra de AutoMod já existe: ${rule.name}`);
        continue;
      }

      const actions = [{ type: Action.BlockMessage }];
      if (alertChannel) actions.push({ type: Action.SendAlertMessage, metadata: { channel: alertChannel } });

      const options = {
        name: rule.name,
        eventType: Event.MessageSend,
        triggerType: rule.triggerType,
        triggerMetadata: rule.triggerMetadata,
        actions,
        enabled: true,
        exemptRoles: staffIds,
        reason: `${SERVIDOR} · configuração automática`,
      };
      if (rule.exemptChannels?.length) options.exemptChannels = rule.exemptChannels;

      await guild.autoModerationRules.create(options);
      console.log(`[ok] AutoMod ativo: ${rule.name}`);
      await wait(400);
    }
  } catch (error) {
    console.warn(`[aviso] Não foi possível configurar o AutoMod: ${error.message}`);
  }
}

async function setupGuild(client, guild) {
  await guild.roles.fetch();
  await guild.channels.fetch();

  const me = await guild.members.fetchMe();
  if (!me.permissions.has(P.ManageRoles) || !me.permissions.has(P.ManageChannels)) {
    throw new Error('O bot precisa das permissões "Gerenciar Cargos" e "Gerenciar Canais" (ou Administrador).');
  }

  const ctx = { guild, botId: client.user.id, roles: {}, channels: {} };
  console.log(`[info] Preparando "${SERVIDOR}" em: ${guild.name}`);

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
