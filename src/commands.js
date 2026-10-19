const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');
const { SERVIDOR, channelName } = require('./config');
const { stylize } = require('./embeds');
const { isStaffMember, replyEphemeral } = require('./components');

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
  if (!isStaffMember(interaction.member)) {
    await replyEphemeral(interaction, 'Apenas membros da equipe podem publicar anúncios.');
    return;
  }

  const channel = interaction.guild.channels.cache.find((c) => c.name === channelName('anuncios'));
  if (!channel) {
    await replyEphemeral(interaction, `Canal #${channelName('anuncios')} não encontrado. Rode o setup para criar a estrutura.`);
    return;
  }

  const titulo = interaction.options.getString('titulo');
  const mensagem = interaction.options.getString('mensagem');
  const ping = interaction.options.getBoolean('ping') ?? true;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(titulo)
    .setDescription(mensagem)
    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
    .setFooter({ text: SERVIDOR })
    .setTimestamp();

  const pingRole = interaction.guild.roles.cache.find((role) => role.name === 'Ping Anúncios');
  await channel.send({
    content: ping && pingRole ? `<@&${pingRole.id}>` : undefined,
    embeds: [embed],
  });

  await replyEphemeral(interaction, `Anúncio publicado em <#${channel.id}>.`);
}

async function handleEnquete(interaction) {
  if (!isStaffMember(interaction.member)) {
    await replyEphemeral(interaction, 'Apenas membros da equipe podem criar enquetes.');
    return;
  }

  const channel = interaction.guild.channels.cache.find((c) => c.name === channelName('enquetes'));
  if (!channel) {
    await replyEphemeral(interaction, `Canal #${channelName('enquetes')} não encontrado. Rode o setup para criar a estrutura.`);
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
  if (!isStaffMember(interaction.member)) {
    await replyEphemeral(interaction, 'Apenas membros da equipe podem aplicar advertências.');
    return;
  }

  const alvo = interaction.options.getMember('membro');
  if (!alvo) {
    await replyEphemeral(interaction, 'Membro não encontrado no servidor.');
    return;
  }

  const role = interaction.guild.roles.cache.find((r) => r.name === 'Advertido');
  if (!role) {
    await replyEphemeral(interaction, 'Cargo "Advertido" não encontrado. Rode o setup para criar a estrutura.');
    return;
  }

  const motivo = interaction.options.getString('motivo');
  await alvo.roles.add(role, `Advertência aplicada por ${interaction.user.tag}: ${motivo}`);

  const embed = new EmbedBuilder()
    .setColor(0xd35400)
    .setTitle(stylize('Advertência aplicada'))
    .addFields(
      { name: 'Membro', value: `${alvo.user.tag} (${alvo.id})`, inline: true },
      { name: 'Aplicada por', value: `${interaction.user.tag}`, inline: true },
      { name: 'Motivo', value: motivo },
    )
    .setTimestamp();

  const registro = interaction.guild.channels.cache.find((c) => c.name === channelName('registro'));
  if (registro) await registro.send({ embeds: [embed] }).catch(() => {});

  await alvo
    .send(`Você recebeu uma advertência no ${SERVIDOR}.\nMotivo: ${motivo}\nDúvidas ou revisão: abra um ticket em #${channelName('tickets')}.`)
    .catch(() => {});

  await replyEphemeral(interaction, `Advertência aplicada a ${alvo}.`);
}

const HANDLERS = {
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
  if (!interaction.guild) return;
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
