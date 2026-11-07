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
const { buildPanel, buildV2JoinWelcome, titleOfPanel } = require('./v2');
const { loadShifts, saveShifts } = require('./store');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const claimed = new Map();
const pendingCloses = new Map();
const queueCards = new Map();

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

function ticketCategoryRefs(cfg) {
  const refs = new Set(['cat-tickets']);
  for (const ticket of cfg.TICKETS ?? []) {
    if (ticket.categoryKey) refs.add(ticket.categoryKey);
  }
  return refs;
}

function findTicketCategory(guild, cfg, ticketCfg) {
  const ref = ticketCfg?.categoryKey ?? 'cat-tickets';
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === cfg.CATEGORY_REFS[ref],
  );
}

function isTicketChannel(channel, cfg) {
  const parentName = channel?.parent?.name;
  if (!parentName) return false;
  for (const ref of ticketCategoryRefs(cfg)) {
    if (cfg.CATEGORY_REFS[ref] === parentName) return true;
  }
  return false;
}

function ticketFromTopic(cfg, channel) {
  const key = (channel.topic?.match(/^ticket:([a-z0-9]+)/) ?? [])[1];
  return { key, ticketCfg: cfg.TICKETS.find((ticket) => ticket.key === key) ?? null };
}

function canAttendTicket(member, cfg, ticketCfg) {
  if (isTicketStaff(member, cfg)) return true;
  if (!ticketCfg?.staffKey) return false;
  return member.roles.cache.some((role) => role.name === roleNameFor(cfg, ticketCfg.staffKey));
}

async function openTicket(interaction, key) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  const ticketCfg = cfg.TICKETS.find((ticket) => ticket.key === key) ?? cfg.TICKETS[0];
  const { guild, user } = interaction;

  const category = findTicketCategory(guild, cfg, ticketCfg);
  if (!category) {
    await replyEphemeral(interaction, 'O sistema de tickets ainda não está disponível. Rode o setup do bot.');
    return;
  }

  const ticketCats = [];
  for (const ref of ticketCategoryRefs(cfg)) {
    const cat = findTicketCategory(guild, cfg, { categoryKey: ref });
    if (cat) ticketCats.push(cat.id);
  }

  const existing = guild.channels.cache.find(
    (channel) => ticketCats.includes(channel.parentId) && channel.topic?.includes(`(${user.id})`),
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

  const sectorName = ticketCfg.staffKey ? roleNameFor(cfg, ticketCfg.staffKey) : null;
  const sectorRole = sectorName ? guild.roles.cache.find((role) => role.name === sectorName) : null;
  const grantIds = [...new Set([...staffIds, ...(sectorRole ? [sectorRole.id] : [])])];

  const channel = await guild.channels.create({
    name: `ticket-${slug(ticketCfg.label)}-${slug(user.username)}`.slice(0, 100),
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `ticket:${ticketCfg.key} | autor: ${user.username} (${user.id})`,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [P.ViewChannel] },
      { id: user.id, allow },
      { id: interaction.client.user.id, allow: [...allow, P.ManageMessages] },
      ...grantIds.map((id) => ({ id, allow })),
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

  const pingRole = sectorRole ?? suporte;
  await channel.send({
    content: `<@${user.id}> seu atendimento de **${ticketCfg.label}** foi aberto.${pingRole ? `\n<@&${pingRole.id}>` : ''}`,
    embeds: [embed],
    components: [controls],
  });

  await postTicketCard(guild, cfg, 'fila', channel, ticketCfg).catch(() => {});

  await replyEphemeral(interaction, `Ticket aberto: <#${channel.id}>.`);
}

function findTicketReportChannel(guild, cfg) {
  return guild.channels.cache.find((channel) => channel.name === cfg.channelName('ticket-reports'));
}

function staffIdFromTopic(channel) {
  return (channel.topic?.match(/\|\s*staff:(\d{17,20})/) ?? [])[1];
}

async function postTicketReport(guild, cfg, embed) {
  const channel = findTicketReportChannel(guild, cfg);
  if (!channel) return;
  await channel.send({ embeds: [embed], allowedMentions: { parse: [] } }).catch(() => {});
}

function ticketQueueChannel(guild, cfg, ref) {
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && channel.name === cfg.channelName?.(ref),
  );
}

async function postTicketCard(guild, cfg, kind, ticketChannel, ticketCfg) {
  const ref = kind === 'fila' ? 'fila-tickets' : 'atendendo-tickets';
  const channel = ticketQueueChannel(guild, cfg, ref);
  if (!channel) return;

  const authorId = (ticketChannel.topic?.match(/\((\d{17,20})\)/) ?? [])[1];
  const staffId = staffIdFromTopic(ticketChannel);
  const embed = new EmbedBuilder().setColor(ticketCfg?.color ?? cfg.ACCENT ?? 0xd4af37);

  if (kind === 'fila') {
    embed.setTitle('🆕 Aguardando atendimento').setDescription('Ninguém assumiu ainda. Puxe o atendimento quando puder.');
  } else {
    embed.setTitle('🎫 Em atendimento').setDescription('Converse, resolva e feche o ticket no canal.');
  }

  embed.addFields(
    { name: 'Setor', value: ticketCfg?.label ?? 'Atendimento', inline: true },
    { name: 'Solicitante', value: authorId ? `<@${authorId}>` : 'Desconhecido', inline: true },
    ...(kind === 'curso' && staffId ? [{ name: 'Atendente', value: `<@${staffId}>`, inline: true }] : []),
  );
  embed.setFooter({ text: `ticket:${ticketChannel.id}` }).setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel('Abrir ticket')
      .setURL(`https://discord.com/channels/${guild.id}/${ticketChannel.id}`),
    ...(kind === 'fila'
      ? [
          new ButtonBuilder()
            .setCustomId(`ticket:assumir:fila:${ticketChannel.id}`)
            .setLabel('Puxar atendimento')
            .setStyle(ButtonStyle.Success),
        ]
      : []),
  );

  const message = await channel.send({ embeds: [embed], components: [row] }).catch(() => null);
  if (message) {
    const entry = queueCards.get(ticketChannel.id) ?? {};
    entry[kind === 'fila' ? 'fila' : 'curso'] = { ch: channel.id, id: message.id };
    queueCards.set(ticketChannel.id, entry);
  }
}

async function deleteTicketCard(guild, cfg, kind, ticketId) {
  const ref = kind === 'fila' ? 'fila-tickets' : 'atendendo-tickets';
  const channel = ticketQueueChannel(guild, cfg, ref);
  if (!channel) return;

  const stored = queueCards.get(ticketId)?.[kind];
  if (stored && stored.ch === channel.id) {
    const message = channel.messages.cache.get(stored.id) ?? (await channel.messages.fetch(stored.id).catch(() => null));
    if (message) await message.delete().catch(() => {});
    const entry = queueCards.get(ticketId);
    if (entry) delete entry[kind];
    return;
  }

  let message = channel.messages.cache.find(
    (item) => item.author.id === channel.client.user.id && item.embeds.some((embed) => embed.footer?.text === `ticket:${ticketId}`),
  );
  if (!message) {
    const recent = await channel.messages.fetch({ limit: 50 }).catch(() => null);
    message = recent?.find(
      (item) => item.author.id === channel.client.user.id && item.embeds.some((embed) => embed.footer?.text === `ticket:${ticketId}`),
    ) ?? null;
  }
  if (message) await message.delete().catch(() => {});
}

async function clearTicketCards(guild, cfg, ticketId) {
  await deleteTicketCard(guild, cfg, 'fila', ticketId).catch(() => {});
  await deleteTicketCard(guild, cfg, 'curso', ticketId).catch(() => {});
  queueCards.delete(ticketId);
}

async function refreshPontoPanel(guild, cfg) {
  const channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && item.name === cfg.channelName?.('ponto-geral'),
  );
  if (!channel) return;

  const shifts = loadShifts(guild.id);
  const entries = Object.entries(shifts).map(([id, rec]) => ({ id, rec }));
  entries.sort(
    (a, b) => (b.rec.startedAt ?? 0) - (a.rec.startedAt ?? 0) || (b.rec.totalMs ?? 0) - (a.rec.totalMs ?? 0),
  );

  const lines = entries.map(({ id, rec }) =>
    rec.startedAt
      ? `🟢 Em serviço — **<@${id}>** · desde <t:${Math.floor(rec.startedAt / 1000)}:t> · total **${formatDuration(rec.totalMs ?? 0)}**`
      : `⚪ Fora de serviço — **<@${id}>** · total **${formatDuration(rec.totalMs ?? 0)}**`,
  );

  const payload = buildPanel(
    {
      title: 'Ponto geral',
      intro: lines.length
        ? 'Monitor em tempo real da escala: quem está de plantão, quem já saiu e o total de horas de cada membro da equipe.'
        : 'Monitor em tempo real da escala. Ninguém bateu ponto ainda — os registros aparecem aqui na primeira entrada.',
      sections: [{ label: 'Escala atual', lines }],
      note: 'Este painel atualiza sozinho a cada entrada, saída ou ausência registrada.',
      accent: 0x1e8449,
    },
    { cfg, guild, channels: {}, channelIcon: '📈' },
  );

  const recent = (await channel.messages.fetch({ limit: 50 }).catch(() => null)) ?? null;
  const current = recent?.find(
    (message) =>
      message.author.id === guild.client.user.id &&
      message.flags.has(MessageFlags.IsComponentsV2) &&
      titleOfPanel(message) === 'ponto geral',
  );

  if (current) await current.edit({ components: payload.components }).catch(() => {});
  else await channel.send({ ...payload, allowedMentions: { parse: [] } }).catch(() => {});
}

async function assumeTicket(interaction, filaChannelId) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  const ticketChannel = filaChannelId
    ? interaction.guild.channels.cache.get(filaChannelId)
    : interaction.channel;
  if (!ticketChannel || !isTicketChannel(ticketChannel, cfg)) {
    await replyEphemeral(interaction, 'Este botão só funciona em um ticket aberto.');
    return;
  }

  const ticketCfg = ticketFromTopic(cfg, ticketChannel).ticketCfg;
  if (!canAttendTicket(interaction.member, cfg, ticketCfg)) {
    await replyEphemeral(interaction, 'Somente a equipe responsável pode assumir este atendimento.');
    return;
  }

  const current = claimed.get(ticketChannel.id);
  if (current && current !== interaction.user.id) {
    await replyEphemeral(interaction, `Este atendimento já está com <@${current}>.`);
    return;
  }
  claimed.set(ticketChannel.id, interaction.user.id);

  const baseTopic = (ticketChannel.topic ?? '').replace(/\s*\|\s*staff:\d{17,20}/, '');
  await ticketChannel.setTopic(`${baseTopic} | staff:${interaction.user.id}`.slice(0, 1024), 'Ticket assumido').catch(() => {});

  const authorId = (ticketChannel.topic?.match(/\((\d{17,20})\)/) ?? [])[1];
  const sector = ticketCfg?.label ?? 'Atendimento';

  const report = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🎫 Ticket assumido')
    .addFields(
      { name: 'Atendente', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Setor', value: sector, inline: true },
      { name: 'Solicitante', value: authorId ? `<@${authorId}>` : 'Desconhecido', inline: true },
      {
        name: 'Ticket',
        value: `[#${ticketChannel.name}](https://discord.com/channels/${ticketChannel.guild.id}/${ticketChannel.id})`,
      },
    )
    .setFooter({ text: `Ticket ${ticketChannel.id}` })
    .setTimestamp();

  await postTicketReport(ticketChannel.guild, cfg, report);

  const label = `Atendendo: ${interaction.member.displayName}`.slice(0, 80);
  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket:assumir').setLabel(label).setStyle(ButtonStyle.Success).setDisabled(true),
    new ButtonBuilder().setCustomId('ticket:fechar').setLabel('Fechar ticket').setStyle(ButtonStyle.Danger),
  );

  if (filaChannelId) {
    const recent = await ticketChannel.messages.fetch({ limit: 25 }).catch(() => null);
    const origin = recent?.find(
      (message) =>
        message.author.id === interaction.client.user.id &&
        message.components.some((row) => row.components.some((button) => button.customId === 'ticket:assumir')),
    );
    if (origin) await origin.edit({ components: [controls] }).catch(() => {});
    await replyEphemeral(interaction, `Você assumiu <#${ticketChannel.id}>.`);
  } else {
    await interaction.message.edit({ components: [controls] }).catch(() => {});
    await interaction.reply({ content: `Atendimento assumido por <@${interaction.user.id}>.` });
  }

  await deleteTicketCard(ticketChannel.guild, cfg, 'fila', ticketChannel.id).catch(() => {});
  await postTicketCard(ticketChannel.guild, cfg, 'curso', ticketChannel, ticketCfg).catch(() => {});
}

async function closeTicket(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  const channel = interaction.channel;
  if (!isTicketChannel(channel, cfg)) return;

  const { ticketCfg } = ticketFromTopic(cfg, channel);
  const authorId = (channel.topic?.match(/\((\d{17,20})\)/) ?? [])[1];
  const isAuthor = authorId === interaction.user.id;
  if (!isAuthor && !canAttendTicket(interaction.member, cfg, ticketCfg)) {
    await replyEphemeral(interaction, 'Apenas a equipe ou o autor podem fechar este ticket.');
    return;
  }

  const label = ticketCfg?.label ?? 'Atendimento';

  if (canAttendTicket(interaction.member, cfg, ticketCfg)) {
    pendingCloses.set(channel.id, { authorId, label, closedBy: interaction.user.id });
    const modal = new ModalBuilder().setCustomId('ticket:fechar:relatorio').setTitle('Relatório do atendimento');
    modal.addLabelComponents(
      new LabelBuilder().setLabel('Resumo do atendimento').setTextInputComponent(
        new TextInputBuilder()
          .setCustomId('resumo')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(1000)
          .setRequired(true)
          .setPlaceholder('O que o solicitante precisava?'),
      ),
      new LabelBuilder().setLabel('Resolução').setTextInputComponent(
        new TextInputBuilder()
          .setCustomId('resolucao')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(250)
          .setRequired(true)
          .setPlaceholder('O que foi feito?'),
      ),
      new LabelBuilder().setLabel('Observações (opcional)').setTextInputComponent(
        new TextInputBuilder()
          .setCustomId('observacoes')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(250)
          .setRequired(false),
      ),
    );
    await interaction.showModal(modal);
    return;
  }

  await interaction.reply({ content: 'Encerrando o atendimento e gerando o registro...', flags: MessageFlags.Ephemeral });
  await sendTranscript(channel, { authorId, label, closedBy: interaction.user, staffId: staffIdFromTopic(channel) });

  const report = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🎫 Ticket encerrado')
    .addFields(
      { name: 'Atendente', value: staffIdFromTopic(channel) ? `<@${staffIdFromTopic(channel)}>` : 'Não assumido', inline: true },
      { name: 'Solicitante', value: authorId ? `<@${authorId}>` : 'Desconhecido', inline: true },
      { name: 'Setor', value: label, inline: true },
      { name: 'Fechado por', value: `<@${interaction.user.id}>` },
      { name: 'Ticket', value: `#${channel.name}` },
    )
    .setTimestamp();

  await postTicketReport(channel.guild, cfg, report);

  claimed.delete(channel.id);
  pendingCloses.delete(channel.id);
  await clearTicketCards(channel.guild, cfg, channel.id).catch(() => {});
  await wait(1500);
  await channel.delete(`Ticket fechado por ${interaction.user.tag}`).catch(() => {});
}

async function handleTicketCloseModal(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  const channel = interaction.channel;
  const pending = channel ? pendingCloses.get(channel.id) : null;
  if (!channel || !pending) {
    await replyEphemeral(interaction, 'Este atendimento não está mais disponível para fechamento.');
    return;
  }

  const resumo = interaction.fields.getTextInputValue('resumo');
  const resolucao = interaction.fields.getTextInputValue('resolucao');
  const observacoes = interaction.fields.getTextInputValue('observacoes');
  const staffId = staffIdFromTopic(channel) ?? pending.closedBy;

  await interaction.reply({ content: 'Relatório registrado. Encerrando o atendimento...', flags: MessageFlags.Ephemeral });

  const report = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('📋 Relatório de atendimento')
    .addFields(
      { name: 'Atendente', value: `<@${staffId}>`, inline: true },
      { name: 'Solicitante', value: pending.authorId ? `<@${pending.authorId}>` : 'Desconhecido', inline: true },
      { name: 'Setor', value: pending.label, inline: true },
      { name: 'Resumo', value: resumo.slice(0, 1024) },
      { name: 'Resolução', value: resolucao.slice(0, 1024) },
      ...(observacoes ? [{ name: 'Observações', value: observacoes.slice(0, 1024) }] : []),
      {
        name: 'Ticket',
        value: `#${channel.name} · \`${channel.id}\``,
      },
    )
    .setTimestamp();

  await postTicketReport(channel.guild, cfg, report);
  await sendTranscript(channel, {
    authorId: pending.authorId,
    label: pending.label,
    closedBy: interaction.user,
    staffId,
  });

  claimed.delete(channel.id);
  pendingCloses.delete(channel.id);
  await clearTicketCards(channel.guild, cfg, channel.id).catch(() => {});
  await wait(1500);
  await channel.delete(`Ticket fechado por ${interaction.user.tag}`).catch(() => {});
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
    `Atendente: ${meta.staffId ?? 'não assumido'}`,
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
    await refreshPontoPanel(interaction.guild, cfg).catch(() => {});
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

  await refreshPontoPanel(interaction.guild, cfg).catch(() => {});
  await replyEphemeral(
    interaction,
    `Saída registrada. Sessão: **${formatDuration(session)}** · Total acumulado: **${formatDuration(record.totalMs)}**.`,
  );
}

async function handlePontoReport(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  if (!isStaffMember(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'O relatório de ponto é exclusivo da equipe.');
    return;
  }

  const shifts = loadShifts(interaction.guildId);
  const record = shifts[interaction.user.id];
  if (!record) {
    await replyEphemeral(interaction, 'Você ainda não tem registros de ponto. Bata a entrada para começar.');
    return;
  }

  const status = record.startedAt
    ? `Em serviço desde <t:${Math.floor(record.startedAt / 1000)}:t>`
    : 'Fora de serviço';
  const total = formatDuration(record.totalMs ?? 0);
  await replyEphemeral(
    interaction,
    `📊 **Seu ponto**\n${status}\nTotal acumulado: **${total}**`,
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
  await refreshPontoPanel(interaction.guild, cfg).catch(() => {});
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

  const joinedChannel = member.guild.channels.cache.find((c) => c.name === cfg.channelName('entrou'));
  if (joinedChannel) {
    const joinedEmbed = new EmbedBuilder()
      .setColor(cfg.ACCENT ?? 0xd4af37)
      .setTitle('📥 Novo membro')
      .setDescription(`<@${member.id}> entrou na cidade. Seja bem-vindo!`)
      .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
      .addFields({
        name: 'Conta criada',
        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
        inline: true,
      })
      .setTimestamp();
    await joinedChannel.send({ embeds: [joinedEmbed], allowedMentions: { parse: [] } }).catch(() => {});
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
      else if (customId.startsWith('ticket:assumir:fila:'))
        await assumeTicket(interaction, customId.slice('ticket:assumir:fila:'.length));
      else if (customId === 'ticket:fechar') await closeTicket(interaction);
      else if (customId === 'ponto:entrada') await handlePonto(interaction, 'entrada');
      else if (customId === 'ponto:saida') await handlePonto(interaction, 'saida');
      else if (customId === 'ponto:relatorio') await handlePontoReport(interaction);
      else if (customId === 'ausencia:abrir') await openAusenciaModal(interaction);
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId === 'ausencia:registrar') {
      await handleAusenciaSubmit(interaction);
    }
    if (interaction.isModalSubmit() && interaction.customId === 'ticket:fechar:relatorio') {
      await handleTicketCloseModal(interaction);
    }
  } catch (error) {
    console.error(`[erro] Falha ao processar interação: ${error.message}`);
    await replyEphemeral(interaction, 'Não foi possível concluir a ação. Avise a administração.');
  }
}

module.exports = { handleInteraction, handleMessage, handleGuildMemberAdd, isStaffMember, replyEphemeral, refreshPontoPanel };
