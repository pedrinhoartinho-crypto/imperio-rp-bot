const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  PermissionFlagsBits: P,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { getConfig } = require('./config');
const { buildJoinWelcome } = require('./embeds');
const { buildV2JoinWelcome } = require('./v2');
const { loadShifts, saveShifts, loadOrgs, saveOrgs } = require('./store');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const claimed = new Map();

function namesFor(cfg, keys) {
  return keys.map((key) => cfg.ROLES.find((role) => role.key === key)?.name).filter(Boolean);
}

function roleNameFor(cfg, key) {
  return cfg.ROLES.find((role) => role.key === key)?.name;
}

function isStaffMember(member, cfg) {
  if (!cfg) return false;
  const names = namesFor(cfg, cfg.STAFF_KEYS);
  return member.roles.cache.some((role) => names.includes(role.name));
}

function isTicketStaff(member, cfg) {
  if (!cfg) return false;
  const keys = cfg.STAFF_KEYS.filter((key) => !cfg.TICKET_JUNIOR_KEYS.includes(key));
  const names = namesFor(cfg, keys);
  return member.roles.cache.some((role) => names.includes(role.name));
}

function slug(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours) return `${hours}h ${String(minutes).padStart(2, '0')}min`;
  return `${minutes}min`;
}

async function replyEphemeral(interaction, content) {
  if (interaction.replied || interaction.deferred) return;
  await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => {});
}

async function handleRoleButton(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  const key = interaction.customId.slice('cargo:'.length);
  const roleCfg = cfg.ROLES.find((role) => role.key === key);
  if (!roleCfg) return;

  const role = interaction.guild.roles.cache.find((r) => r.name === roleCfg.name);
  if (!role) {
    await replyEphemeral(interaction, 'Cargo indisponível no momento. Avise a administração.');
    return;
  }

  const { member } = interaction;
  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
    await replyEphemeral(interaction, `Cargo ${role.name} removido.`);
  } else {
    await member.roles.add(role);
    await replyEphemeral(interaction, `Cargo ${role.name} adicionado.`);
  }
}

async function assumeOrg(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  const key = interaction.customId.slice('org:assumir:'.length);
  const roleCfg = cfg.ROLES.find((role) => role.key === key);
  if (!roleCfg) return;

  const role =
    interaction.guild.roles.cache.find((r) => r.name === roleCfg.name) ??
    (await interaction.guild.roles.fetch().then((roles) => roles.find((r) => r.name === roleCfg.name)).catch(() => null));
  if (!role) {
    await replyEphemeral(interaction, 'Cargo indisponível no momento. Avise a administração.');
    return;
  }

  if (interaction.member.roles.cache.has(role.id)) {
    await replyEphemeral(interaction, `Você já é ${role.name}.`);
    return;
  }

  const claims = loadOrgs(interaction.guildId);
  const currentId = claims[key];
  if (currentId && currentId !== interaction.user.id) {
    const current = await interaction.guild.members.fetch(currentId).catch(() => null);
    if (current?.roles.cache.has(role.id)) {
      await replyEphemeral(
        interaction,
        `**${role.name}** já tem líder: ${current}. A staff precisa remover o cargo para liberar.`,
      );
      return;
    }
  }

  const other = role.members.find((member) => member.id !== interaction.user.id);
  if (other) {
    claims[key] = other.id;
    saveOrgs(interaction.guildId, claims);
    await replyEphemeral(
      interaction,
      `**${role.name}** já tem líder: ${other}. A staff precisa remover o cargo para liberar.`,
    );
    return;
  }

  await interaction.member.roles.add(role, 'Assumiu organização');
  claims[key] = interaction.user.id;
  saveOrgs(interaction.guildId, claims);
  await interaction.reply({
    content: `✋ ${interaction.member} assumiu **${role.name}**!\nAgora é só publicar o recrutamento aqui no canal.`,
  });
}

function findTicketCategory(guild, cfg) {
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === cfg.CATEGORY_REFS['cat-tickets'],
  );
}

async function openTicket(interaction, key) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  const ticketCfg = cfg.TICKETS.find((ticket) => ticket.key === key) ?? cfg.TICKETS[0];
  const { guild, user } = interaction;

  const category = findTicketCategory(guild, cfg);
  if (!category) {
    await replyEphemeral(interaction, 'O sistema de tickets ainda não está disponível. Rode o setup do bot.');
    return;
  }

  const existing = guild.channels.cache.find(
    (channel) => channel.parentId === category.id && channel.topic?.includes(`(${user.id})`),
  );
  if (existing) {
    await replyEphemeral(interaction, `Você já possui um atendimento aberto: <#${existing.id}>.`);
    return;
  }

  const allow = [
    P.ViewChannel,
    P.SendMessages,
    P.SendMessagesInThreads,
    P.EmbedLinks,
    P.AttachFiles,
    P.ReadMessageHistory,
    P.AddReactions,
  ];

  const keys = cfg.STAFF_KEYS.filter((entry) => !cfg.TICKET_JUNIOR_KEYS.includes(entry));
  const staffNames = namesFor(cfg, keys);
  const staffIds = guild.roles.cache
    .filter((role) => staffNames.includes(role.name))
    .map((role) => role.id);

  const suporteName = roleNameFor(cfg, 'suporte');
  const suporte = guild.roles.cache.find((role) => role.name === suporteName);

  const channel = await guild.channels.create({
    name: `ticket-${slug(ticketCfg.label)}-${slug(user.username)}`.slice(0, 100),
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `ticket:${ticketCfg.key} | autor: ${user.username} (${user.id})`,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [P.ViewChannel] },
      { id: user.id, allow },
      { id: interaction.client.user.id, allow: [...allow, P.ManageMessages] },
      ...staffIds.map((id) => ({ id, allow })),
    ],
    reason: `Abertura de ticket (${ticketCfg.label})`,
  });

  const embed = new EmbedBuilder()
    .setColor(ticketCfg.color)
    .setTitle(ticketCfg.title)
    .setDescription(ticketCfg.instructions)
    .setFooter({ text: 'Atendimento privado · aguarde a equipe' });

  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket:assumir').setLabel('Assumir atendimento').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket:fechar').setLabel('Fechar ticket').setStyle(ButtonStyle.Danger),
  );

  await channel.send({
    content: `<@${user.id}> seu atendimento de **${ticketCfg.label}** foi aberto.${suporte ? `\n<@&${suporte.id}>` : ''}`,
    embeds: [embed],
    components: [controls],
  });

  await replyEphemeral(interaction, `Ticket aberto: <#${channel.id}>.`);
}

async function assumeTicket(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  const channel = interaction.channel;
  if (!channel || channel.parent?.name !== cfg.CATEGORY_REFS['cat-tickets']) {
    await replyEphemeral(interaction, 'Este botão só funciona dentro de um ticket.');
    return;
  }

  if (!isTicketStaff(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'Somente a equipe pode assumir atendimentos.');
    return;
  }

  const current = claimed.get(channel.id);
  if (current && current !== interaction.user.id) {
    await replyEphemeral(interaction, `Este atendimento já está com <@${current}>.`);
    return;
  }

  claimed.set(channel.id, interaction.user.id);

  const label = `Atendendo: ${interaction.member.displayName}`.slice(0, 80);
  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket:assumir').setLabel(label).setStyle(ButtonStyle.Success).setDisabled(true),
    new ButtonBuilder().setCustomId('ticket:fechar').setLabel('Fechar ticket').setStyle(ButtonStyle.Danger),
  );

  await interaction.message.edit({ components: [controls] });
  await interaction.reply({ content: `Atendimento assumido por <@${interaction.user.id}>.` });
}

async function sendTranscript(channel, meta) {
  const cfg = getConfig(channel.guild.id);
  if (!cfg) return;

  const logs = channel.guild.channels.cache.find((c) => c.name === cfg.channelName('ticket-logs'));
  if (!logs) return;

  let messages = [];
  try {
    const fetched = await channel.messages.fetch({ limit: 100 });
    messages = [...fetched.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  } catch {
    messages = [];
  }

  const lines = messages.map((message) => {
    const time = new Date(message.createdTimestamp).toISOString().replace('T', ' ').slice(0, 19);
    const attachments = message.attachments.size
      ? ` [anexos: ${[...message.attachments.values()].map((file) => file.url).join(', ')}]`
      : '';
    const content = message.content || (message.embeds.length ? '[embed]' : '[sem texto]');
    return `[${time}] ${message.author.tag}: ${content}${attachments}`;
  });

  const header = [
    `Ticket: ${channel.name}`,
    `Setor: ${meta.label}`,
    `Autor: ${meta.authorId ?? 'desconhecido'}`,
    `Fechado por: ${meta.closedBy.tag} (${meta.closedBy.id})`,
    `Mensagens: ${messages.length}`,
    '-'.repeat(50),
  ].join('\n');

  const file = new AttachmentBuilder(Buffer.from(`${header}\n${lines.join('\n')}`, 'utf8'), {
    name: `${channel.name}.txt`,
  });

  await logs
    .send({ content: `**Ticket fechado** — \`${channel.name}\` (${meta.label})`, files: [file] })
    .catch(() => {});
}

async function closeTicket(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  const channel = interaction.channel;
  if (!channel || channel.parent?.name !== cfg.CATEGORY_REFS['cat-tickets']) return;

  const authorId = (channel.topic?.match(/\((\d{17,20})\)/) ?? [])[1];
  const isAuthor = authorId === interaction.user.id;
  if (!isAuthor && !isTicketStaff(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'Apenas a equipe ou o autor podem fechar este ticket.');
    return;
  }

  const key = (channel.topic?.match(/^ticket:([a-z]+)/) ?? [])[1];
  const label = cfg.TICKETS.find((ticket) => ticket.key === key)?.label ?? 'Atendimento';

  await interaction.reply({ content: 'Encerrando o atendimento e gerando o registro...', flags: MessageFlags.Ephemeral });
  await sendTranscript(channel, { authorId, label, closedBy: interaction.user });

  claimed.delete(channel.id);
  await wait(1500);
  await channel.delete(`Ticket fechado por ${interaction.user.tag}`).catch(() => {});
}

async function handlePonto(interaction, action) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  if (!isStaffMember(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'O bate-ponto é exclusivo da equipe.');
    return;
  }

  const guildId = interaction.guildId;
  const shifts = loadShifts(guildId);
  const record = shifts[interaction.user.id] ?? { totalMs: 0 };
  record.name = interaction.member.displayName ?? interaction.user.username;
  const now = Date.now();

  if (action === 'entrada') {
    if (record.startedAt) {
      await replyEphemeral(interaction, `Você já está em serviço desde <t:${Math.floor(record.startedAt / 1000)}:t>.`);
      return;
    }

    record.startedAt = now;
    shifts[interaction.user.id] = record;
    saveShifts(guildId, shifts);
    await replyEphemeral(interaction, `Entrada registrada às <t:${Math.floor(now / 1000)}:t>. Bom serviço!`);
    return;
  }

  if (!record.startedAt) {
    await replyEphemeral(interaction, 'Nenhuma entrada em aberto. Registre a entrada antes da saída.');
    return;
  }

  const session = now - record.startedAt;
  record.totalMs += session;
  delete record.startedAt;
  shifts[interaction.user.id] = record;
  saveShifts(guildId, shifts);

  await replyEphemeral(
    interaction,
    `Saída registrada. Sessão: **${formatDuration(session)}** · Total acumulado: **${formatDuration(record.totalMs)}**.`,
  );
}

async function openAusenciaModal(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg || !isStaffMember(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'O registro de ausências é exclusivo da equipe.');
    return;
  }

  const modal = new ModalBuilder().setCustomId('ausencia:registrar').setTitle('Registrar ausência');

  modal.addLabelComponents(
    new LabelBuilder()
      .setLabel('Início (dd/mm)')
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId('inicio')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(10)
          .setRequired(true)
          .setPlaceholder('01/11'),
      ),
    new LabelBuilder()
      .setLabel('Retorno previsto (dd/mm)')
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId('fim')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(10)
          .setRequired(true)
          .setPlaceholder('10/11'),
      ),
    new LabelBuilder()
      .setLabel('Motivo')
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId('motivo')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(500)
          .setRequired(true),
      ),
  );

  await interaction.showModal(modal);
}

async function handleAusenciaSubmit(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg || !isStaffMember(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'O registro de ausências é exclusivo da equipe.');
    return;
  }

  const inicio = interaction.fields.getTextInputValue('inicio');
  const fim = interaction.fields.getTextInputValue('fim');
  const motivo = interaction.fields.getTextInputValue('motivo');

  const embed = new EmbedBuilder()
    .setColor(0xa04000)
    .setTitle('Ausência registrada')
    .addFields(
      { name: 'Membro', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Período', value: `${inicio} até ${fim}`, inline: true },
      { name: 'Motivo', value: motivo },
    )
    .setTimestamp();

  if (interaction.channel) await interaction.channel.send({ embeds: [embed] }).catch(() => {});
  await interaction.reply({ content: 'Ausência registrada. A direção foi informada.', flags: MessageFlags.Ephemeral });
}

async function handleGuildMemberAdd(member) {
  if (!member?.guild || member.user?.bot) return;

  const cfg = getConfig(member.guild.id);
  if (!cfg) return;

  const roleCfg = cfg.ROLES.find((role) => role.key === cfg.AUTO_ROLE_KEY);
  if (roleCfg) {
    const role = member.guild.roles.cache.find((r) => r.name === roleCfg.name);
    if (role) await member.roles.add(role, 'Autorole: entrada no servidor').catch(() => {});
  }

  const welcomeChannel = member.guild.channels.cache.find((c) => c.name === cfg.channelName('bem-vindo'));
  if (!welcomeChannel) return;

  const ctx = { guild: member.guild, cfg, channels: {} };
  const refs = ['regras', 'cargos', 'tickets', 'anuncios', 'como-jogar', 'whitelist'];
  for (const ref of refs) {
    const channel = member.guild.channels.cache.find((c) => c.name === cfg.channelName(ref));
    if (channel) ctx.channels[ref] = channel.id;
  }

  if (cfg.LAYOUT === 'v2') {
    await welcomeChannel.send(buildV2JoinWelcome(member, ctx)).catch(() => {});
    return;
  }

  await welcomeChannel.send({ content: `<@${member.id}>`, embeds: [buildJoinWelcome(member, ctx)] }).catch(() => {});
}

async function handleMessage(message) {
  if (!message.guild || message.author.bot) return;

  const cfg = getConfig(message.guild.id);
  if (!cfg) return;
  if (message.channel.name !== cfg.channelName('sugestoes')) return;

  await message.react('👍').catch(() => {});
  await message.react('👎').catch(() => {});
}

async function handleInteraction(interaction) {
  if (!interaction.guild) return;
  if (!getConfig(interaction.guildId)) return;

  try {
    if (interaction.isButton()) {
      const { customId } = interaction;
      if (customId.startsWith('cargo:')) await handleRoleButton(interaction);
      else if (customId === 'ticket:abrir') await openTicket(interaction, 'suporte');
      else if (customId.startsWith('ticket:abrir:')) await openTicket(interaction, customId.slice('ticket:abrir:'.length));
      else if (customId === 'ticket:assumir') await assumeTicket(interaction);
      else if (customId.startsWith('org:assumir:')) await assumeOrg(interaction);
      else if (customId === 'ticket:fechar') await closeTicket(interaction);
      else if (customId === 'ponto:entrada') await handlePonto(interaction, 'entrada');
      else if (customId === 'ponto:saida') await handlePonto(interaction, 'saida');
      else if (customId === 'ausencia:abrir') await openAusenciaModal(interaction);
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId === 'ausencia:registrar') {
      await handleAusenciaSubmit(interaction);
    }
  } catch (error) {
    console.error(`[erro] Falha ao processar interação: ${error.message}`);
    await replyEphemeral(interaction, 'Não foi possível concluir a ação. Avise a administração.');
  }
}

module.exports = { handleInteraction, handleMessage, handleGuildMemberAdd, isStaffMember, replyEphemeral };
