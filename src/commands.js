const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getConfig } = require('./config');
const { isStaffMember, replyEphemeral } = require('./components');
const { buildPanel, titleOfPanel, titleOfPayload } = require('./v2');
const { loadOrgs, saveOrgs } = require('./store');
const { syncMemberTag } = require('./team');

const ORG_CHOICES = [
  { name: 'Babilônia', value: 'babilonia' },
  { name: 'Prazeres', value: 'prazeres' },
  { name: 'Rodo', value: 'rodo' },
  { name: 'PMERJ', value: 'pmerj' },
  { name: 'PCERJ', value: 'pcerj' },
  { name: 'BOPE', value: 'bope' },
];

const COMMANDS = [
  new SlashCommandBuilder()
    .setName('anunciar')
    .setDescription('Publica um anúncio oficial em #anuncios-gerais')
    .addStringOption((option) =>
      option.setName('titulo').setDescription('Título do anúncio').setRequired(true).setMaxLength(120),
    )
    .addStringOption((option) =>
      option.setName('mensagem').setDescription('Conteúdo do anúncio').setRequired(true).setMaxLength(1800),
    )
    .addBooleanOption((option) =>
      option.setName('ping').setDescription('Marcar o cargo Ping Anúncios (padrão: sim)'),
    ),
  new SlashCommandBuilder()
    .setName('enquete')
    .setDescription('Cria uma enquete oficial em #enquetes')
    .addStringOption((option) =>
      option.setName('pergunta').setDescription('Pergunta da enquete').setRequired(true).setMaxLength(300),
    )
    .addStringOption((option) =>
      option
        .setName('opcoes')
        .setDescription('Opções separadas por ponto e vírgula, de 2 a 10 (máx. 55 caracteres cada)')
        .setRequired(true)
        .setMaxLength(580),
    ),
  new SlashCommandBuilder()
    .setName('assumir')
    .setDescription('Marca uma facção ou corporação como assumida')
    .addStringOption((option) =>
      option
        .setName('organizacao')
        .setDescription('Time que vai ser assumido')
        .setRequired(true)
        .addChoices(...ORG_CHOICES),
    )
    .addUserOption((option) =>
      option.setName('lider').setDescription('Quem vai receber o cargo de líder').setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName('liberar')
    .setDescription('Deixa uma facção ou corporação livre')
    .addStringOption((option) =>
      option
        .setName('organizacao')
        .setDescription('Time que vai ficar livre')
        .setRequired(true)
        .addChoices(...ORG_CHOICES),
    ),
  new SlashCommandBuilder()
    .setName('advertir')
    .setDescription('Aplica uma advertência a um membro')
    .addUserOption((option) =>
      option.setName('membro').setDescription('Membro que receberá a advertência').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('motivo').setDescription('Motivo da advertência').setRequired(true).setMaxLength(500),
    ),
];

async function handleAnunciar(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  if (!isStaffMember(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'Apenas membros da equipe podem publicar anúncios.');
    return;
  }

  const channel = interaction.guild.channels.cache.find((c) => c.name === cfg.channelName('anuncios'));
  if (!channel) {
    await replyEphemeral(interaction, `Canal #${cfg.channelName('anuncios')} não encontrado. Rode o setup para criar a estrutura.`);
    return;
  }

  const titulo = interaction.options.getString('titulo');
  const mensagem = interaction.options.getString('mensagem');
  const ping = interaction.options.getBoolean('ping') ?? true;

  const embed = new EmbedBuilder()
    .setColor(cfg.ACCENT ?? 0x5865f2)
    .setTitle(titulo)
    .setDescription(mensagem)
    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() ?? undefined })
    .setTimestamp();

  const pingName = cfg.ROLES.find((role) => role.key === 'ping_anuncios')?.name;
  const pingRole = interaction.guild.roles.cache.find((role) => role.name === pingName);
  await channel.send({
    content: ping && pingRole ? `<@&${pingRole.id}>` : undefined,
    embeds: [embed],
  });

  await replyEphemeral(interaction, `Anúncio publicado em <#${channel.id}>.`);
}

async function handleEnquete(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  if (!isStaffMember(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'Apenas membros da equipe podem criar enquetes.');
    return;
  }

  const channel = interaction.guild.channels.cache.find((c) => c.name === cfg.channelName('enquetes'));
  if (!channel) {
    await replyEphemeral(interaction, `Canal #${cfg.channelName('enquetes')} não encontrado. Rode o setup para criar a estrutura.`);
    return;
  }

  const pergunta = interaction.options.getString('pergunta');
  const opcoes = interaction.options
    .getString('opcoes')
    .split(';')
    .map((opcao) => opcao.trim())
    .filter(Boolean);

  if (opcoes.length < 2 || opcoes.length > 10) {
    await replyEphemeral(interaction, 'Informe de 2 a 10 opções separadas por ponto e vírgula (;).');
    return;
  }

  if (opcoes.some((opcao) => opcao.length > 55)) {
    await replyEphemeral(interaction, 'Cada opção pode ter no máximo 55 caracteres.');
    return;
  }

  await channel.send({
    poll: {
      question: { text: pergunta },
      answers: opcoes.map((text) => ({ text })),
      duration: 48,
      allowMultiselect: false,
    },
  });

  await replyEphemeral(interaction, `Enquete publicada em <#${channel.id}>.`);
}

async function handleAdvertir(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  if (!isStaffMember(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'Apenas membros da equipe podem aplicar advertências.');
    return;
  }

  const alvo = interaction.options.getMember('membro');
  if (!alvo) {
    await replyEphemeral(interaction, 'Membro não encontrado no servidor.');
    return;
  }

  const roleName = cfg.ROLES.find((r) => r.key === 'advertido')?.name;
  const role = interaction.guild.roles.cache.find((r) => r.name === roleName);
  if (!role) {
    await replyEphemeral(interaction, 'Cargo "Advertido" não encontrado. Rode o setup para criar a estrutura.');
    return;
  }

  const motivo = interaction.options.getString('motivo');
  await alvo.roles.add(role, `Advertência aplicada por ${interaction.user.tag}: ${motivo}`);

  const embed = new EmbedBuilder()
    .setColor(0xd35400)
    .setTitle('Advertência aplicada')
    .addFields(
      { name: 'Membro', value: `${alvo.user.tag} (${alvo.id})`, inline: true },
      { name: 'Aplicada por', value: `${interaction.user.tag}`, inline: true },
      { name: 'Motivo', value: motivo },
    )
    .setTimestamp();

  const registro = interaction.guild.channels.cache.find((c) => c.name === cfg.channelName('registro'));
  if (registro) await registro.send({ embeds: [embed] }).catch(() => {});

  await alvo
    .send(`Você recebeu uma advertência no ${interaction.guild.name}.\nMotivo: ${motivo}\nDúvidas ou revisão: abra um ticket em #${cfg.channelName('tickets')}.`)
    .catch(() => {});

  await replyEphemeral(interaction, `Advertência aplicada a ${alvo}.`);
}

async function findOrgRole(guild, cfg, key) {
  const name = cfg.ROLES.find((role) => role.key === key)?.name;
  if (!name) return null;
  return (
    guild.roles.cache.find((role) => role.name === name) ??
    (await guild.roles.fetch().then((roles) => roles.find((role) => role.name === name)).catch(() => null))
  );
}

async function refreshOrgCard(guild, cfg, key) {
  const channelCfg = cfg.CATEGORIES.flatMap((category) => category.channels).find(
    (channel) => channel.ref === 'times',
  );
  const card = channelCfg?.panels?.find((panel) => panel.orgKey === key);
  if (!card) return;

  const channel = guild.channels.cache.find((c) => c.name === channelCfg.name);
  if (!channel) return;

  const icon = channel.name.includes('・') ? channel.name.split('・')[0] : undefined;
  const payload = buildPanel(card, {
    cfg,
    guild,
    channels: {},
    leaders: loadOrgs(guild.id),
    channelIcon: icon,
  });
  const messages = await channel.messages.fetch({ limit: 50 });
  const title = titleOfPayload(payload);
  const current = messages.find(
    (message) =>
      message.author.id === guild.client.user.id &&
      message.flags.has(MessageFlags.IsComponentsV2) &&
      titleOfPanel(message) === title,
  );

  if (current) await current.edit({ components: payload.components, allowedMentions: { parse: [] } });
  else await channel.send(payload);
}

async function leaderFromCard(guild, cfg, key) {
  const channelCfg = cfg.CATEGORIES.flatMap((category) => category.channels).find(
    (channel) => channel.ref === 'times',
  );
  const card = channelCfg?.panels?.find((panel) => panel.orgKey === key);
  if (!card) return null;

  const channel = guild.channels.cache.find((c) => c.name === channelCfg.name);
  if (!channel) return null;

  const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
  if (!messages) return null;

  const message = messages.find(
    (entry) =>
      entry.author.id === guild.client.user.id &&
      entry.flags.has(MessageFlags.IsComponentsV2) &&
      (titleOfPanel(entry) ?? '').includes(card.title.toLowerCase()),
  );
  if (!message) return null;

  const texts = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (typeof node.content === 'string') texts.push(node.content);
    for (const child of node.components ?? []) walk(child);
  };
  walk(message.toJSON());
  return texts.join('\n').match(/Líder:\s*<@!?(\d+)>/)?.[1] ?? null;
}

async function handleAssumir(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  if (!isStaffMember(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'Apenas a equipe pode assumir times.');
    return;
  }

  const key = interaction.options.getString('organizacao');
  const lider = interaction.options.getMember('lider');
  if (!lider) {
    await replyEphemeral(interaction, 'Membro não encontrado no servidor.');
    return;
  }

  const role = await findOrgRole(interaction.guild, cfg, key);
  if (!role) {
    await replyEphemeral(interaction, 'Cargo do time não encontrado. Rode o setup.');
    return;
  }

  const claims = loadOrgs(interaction.guildId);
  const previousId = claims[key] ?? (await leaderFromCard(interaction.guild, cfg, key));

  for (const member of role.members.values()) {
    if (member.id !== lider.id) await member.roles.remove(role).catch(() => {});
  }
  if (previousId && previousId !== lider.id) {
    const previous = await interaction.guild.members.fetch(previousId).catch(() => null);
    if (previous) await previous.roles.remove(role).catch(() => {});
  }

  await lider.roles.add(role, `Assumiu ${role.name} (por ${interaction.user.tag})`);
  await syncMemberTag(lider, cfg);
  claims[key] = lider.id;
  saveOrgs(interaction.guildId, claims);
  await refreshOrgCard(interaction.guild, cfg, key).catch((error) =>
    console.warn(`[aviso] Não foi possível atualizar o cartão de ${key}: ${error.message}`),
  );

  await replyEphemeral(interaction, `**${role.name}** agora é de ${lider}. O recrutamento já está liberado.`);
}

async function handleLiberar(interaction) {
  const cfg = getConfig(interaction.guildId);
  if (!cfg) return;

  if (!isStaffMember(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'Apenas a equipe pode liberar times.');
    return;
  }

  const key = interaction.options.getString('organizacao');
  const role = await findOrgRole(interaction.guild, cfg, key);
  if (!role) {
    await replyEphemeral(interaction, 'Cargo do time não encontrado. Rode o setup.');
    return;
  }

  const claims = loadOrgs(interaction.guildId);
  const previousId = claims[key] ?? (await leaderFromCard(interaction.guild, cfg, key));

  const touched = new Set();
  for (const member of role.members.values()) {
    touched.add(member.id);
    await member.roles.remove(role).catch(() => {});
  }
  if (previousId) {
    touched.add(previousId);
    const previous = await interaction.guild.members.fetch(previousId).catch(() => null);
    if (previous) await previous.roles.remove(role).catch(() => {});
  }
  for (const id of touched) {
    const member = await interaction.guild.members.fetch(id).catch(() => null);
    if (member) await syncMemberTag(member, cfg);
  }

  delete claims[key];
  saveOrgs(interaction.guildId, claims);
  await refreshOrgCard(interaction.guild, cfg, key).catch((error) =>
    console.warn(`[aviso] Não foi possível atualizar o cartão de ${key}: ${error.message}`),
  );

  await replyEphemeral(interaction, `**${role.name}** está livre de novo.`);
}

const HANDLERS = {
  assumir: handleAssumir,
  liberar: handleLiberar,
  anunciar: handleAnunciar,
  enquete: handleEnquete,
  advertir: handleAdvertir,
};

async function registerCommands(guild) {
  try {
    await guild.commands.set(COMMANDS.map((command) => command.toJSON()));
    console.log(`[ok] Comandos registrados: ${COMMANDS.map((command) => `/${command.name}`).join(', ')}.`);
  } catch (error) {
    console.warn(`[aviso] Não foi possível registrar os comandos: ${error.message}`);
  }
}

async function handleCommand(interaction) {
  if (!interaction.guild || !getConfig(interaction.guildId)) return;
  const handler = HANDLERS[interaction.commandName];
  if (!handler) return;

  try {
    await handler(interaction);
  } catch (error) {
    console.error(`[erro] Falha no comando /${interaction.commandName}: ${error.message}`);
    await replyEphemeral(interaction, 'Não foi possível concluir o comando. Avise a administração.');
  }
}

module.exports = { COMMANDS, registerCommands, handleCommand };
