const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { SERVIDOR, LINKS, MENU_ROLE_KEYS, TICKETS, ROLES } = require('./config');
const { version: PANEL_VERSION } = require('../package.json');

const TICKET_STYLES = {
  suporte: ButtonStyle.Primary,
  denuncia: ButtonStyle.Danger,
  recurso: ButtonStyle.Secondary,
  parceria: ButtonStyle.Success,
  lideranca: ButtonStyle.Secondary,
};

const DIVIDER = '━━━━━━━━━━━━━━━━━━━━━━━━━━━';

function stylize(text) {
  return [...String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '')]
    .map((char) => {
      const code = char.codePointAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d4d0 + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d4ea + (code - 97));
      return char;
    })
    .join('');
}

function channelRef(ctx, ref, fallback) {
  return ctx.channels?.[ref] ? `<#${ctx.channels[ref]}>` : fallback;
}

function linksBlock() {
  const lines = [];
  if (LINKS.jogo) lines.push(`Jogo no Roblox: ${LINKS.jogo}`);
  if (LINKS.grupo) lines.push(`Grupo no Roblox: ${LINKS.grupo}`);
  if (LINKS.trello) lines.push(`Trello: ${LINKS.trello}`);
  return lines.length ? lines.join('\n') : 'Os links serão publicados em #anuncios-gerais.';
}

function withIcon(embed, ctx) {
  const icon = ctx.guild ? ctx.guild.iconURL({ size: 256 }) : null;
  if (icon) embed.setThumbnail(icon);
  return embed;
}

function buildWelcome(ctx) {
  return withIcon(
    new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Bem-vindo ao ${SERVIDOR}`)
      .setDescription(
        'Este é o servidor oficial da comunidade e do suporte. O roleplay acontece no Roblox; aqui ficam os comunicados, os canais de conversa e o atendimento.',
      )
      .addFields(
        {
          name: 'Comece por aqui',
          value:
            `1. Leia ${channelRef(ctx, 'regras', '#regras')} e ${channelRef(ctx, 'rp-regras', '#regras-roleplay')}.\n` +
            `2. Escolha seus cargos de notificação em ${channelRef(ctx, 'cargos', '#cargos')}.\n` +
            `3. Acompanhe ${channelRef(ctx, 'anuncios', '#anuncios')} e entre no jogo.`,
        },
        { name: 'Links', value: linksBlock() },
        {
          name: 'Precisa de ajuda?',
          value: `Abra um atendimento em ${channelRef(ctx, 'tickets', '#abrir-ticket')}.`,
        },
      ),
    ctx,
  );
}

function buildAnnouncements(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Comunicados')
    .setDescription(
      'Canal destinado a comunicados oficiais da administração. Apenas a equipe publica aqui.\n' +
        `Dúvidas: ${channelRef(ctx, 'ajuda', '#ajuda')}.`,
    )
    .addFields({
      name: 'Notificações',
      value: `Use o canal ${channelRef(ctx, 'cargos', '#cargos')} para receber o cargo de avisos.`,
    });
}

function buildRules() {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Regras do Servidor')
    .setDescription(
      [
        '**1.** Respeito acima de tudo. Ofensas, racismo e qualquer forma de preconceito são proibidos.',
        '**2.** Spam, flood e divulgação sem autorização da administração são proibidos.',
        '**3.** Conteúdo ilegal, gore ou +18 não é permitido em nenhum canal.',
        '**4.** Não compartilhe dados pessoais, seus ou de terceiros.',
        '**5.** Divulgação de outros servidores apenas com parceria oficial.',
        '**6.** Conversas, prints e gravações internas não devem sair do servidor.',
        '**7.** Tentar burlar punições com contas alternativas resulta em banimento.',
        '**8.** A administração tem a palavra final.',
      ].join('\n'),
    )
    .addFields({
      name: 'Punições',
      value: 'Advertência, silenciamento ou banimento, conforme a gravidade da infração.',
    });
}

function buildRpRules(ctx) {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Regras de Roleplay')
    .setDescription(
      [
        '**1. Valorização da vida.** Seu personagem deve agir para sobreviver; ignorar riscos é tão incorreto quanto fugir de toda situação.',
        '**2. RDM.** Matar ou agredir alguém sem motivo de RP é proibido.',
        '**3. VDM.** Usar veículo como arma é proibido.',
        '**4. Metagaming.** Não use informações obtidas fora do personagem, como Discord, lives ou prints.',
        '**5. Powergaming.** Ações impossíveis ou que forcem a decisão de outro jogador são proibidas.',
        '**6. Combat logging.** Sair do jogo para fugir de consequências é proibido.',
        '**7. Ações.** Siga as regras de engajamento e registre ações relevantes em ' +
          channelRef(ctx, 'acoes', '#avisos-acoes') +
          '.',
        '**8. Fora do personagem.** Conversa OOC apenas em ' + channelRef(ctx, 'pausa', '#rp-pausa') + '.',
        '**9. Hierarquia.** Ordens de líderes e sub-líderes valem dentro do RP.',
      ].join('\n'),
    );
}

function buildAbout(ctx) {
  return withIcon(
    new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(SERVIDOR)
      .setDescription(
        'Servidor de roleplay de temática carioca no Roblox. Aqui ficam a comunidade, os comunicados e o suporte. Facções e organizações operam em servidores próprios.',
      )
      .addFields(
        { name: 'Links', value: linksBlock() },
        {
          name: 'Comece por aqui',
          value:
            `1. Leia ${channelRef(ctx, 'regras', '#regras')} e ${channelRef(ctx, 'rp-regras', '#regras-roleplay')}.\n` +
            `2. Acompanhe ${channelRef(ctx, 'anuncios', '#anuncios')}.\n` +
            '3. Entre no jogo pelo link acima.',
        },
      ),
    ctx,
  );
}

function buildHelp(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Suporte')
    .setDescription(
      `Para atendimento privado, use ${channelRef(ctx, 'tickets', '#abrir-ticket')}. Este canal é para dúvidas rápidas; evite marcar a equipe diretamente.`,
    )
    .addFields(
      { name: 'Denúncias', value: `Envie provas, vídeo ou print, em ${channelRef(ctx, 'denuncias', '#denuncias')}.` },
      { name: 'Equipe', value: `Reclamações sobre membros da equipe em ${channelRef(ctx, 'corregedoria', '#corregedoria')}.` },
      { name: 'Recursos', value: `Pedidos de revisão de punição em ${channelRef(ctx, 'recursos', '#recursos')}.` },
      { name: 'Bugs', value: `Problemas no jogo ou no servidor em ${channelRef(ctx, 'bugs', '#reportar-bugs')}.` },
    );
}

function buildVagas() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Facções e Organizações')
    .setDescription(
      'Facções e organizações funcionam em servidores próprios e fazem recrutamento por conta própria. Use este canal para divulgar vagas e entrar em contato com lideranças.',
    )
    .addFields(
      { name: 'Como ingressar', value: 'Fale diretamente com o líder ou sub-líder da organização.' },
      {
        name: 'Cargos de representação',
        value: 'Líderes e sub-líderes recebem o cargo correspondente no Discord para identificação. A entrega é feita pela administração após verificação.',
      },
    );
}

function buildCargos() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Cargos de Notificação')
    .setDescription(
      'Clique nos botões abaixo para receber ou remover um cargo. Você só será notificado quando o cargo for marcado.',
    );
}

function buildTickets() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Central de Atendimento')
    .setDescription(
      [
        'Escolha o setor correspondente ao seu caso e um canal privado será aberto com a equipe.',
        '',
        ...TICKETS.map((ticket) => `**${ticket.label}** — ${ticket.summary}`),
        '',
        'Um atendimento por vez. Tickets parados podem ser encerrados pela equipe.',
      ].join('\n'),
    );
}

function buildHierarquia(ctx) {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Hierarquia da Equipe')
    .setDescription('Organização, cargos e diretrizes da equipe do projeto.')
    .addFields(
      {
        name: 'Direção',
        value:
          'Dono — proprietários do projeto (cargo compartilhado).\n' +
          'Diretor Geral — administração total do projeto.\n' +
          'Diretor de Operações — operação, gestão de equipe e canais.\n' +
          'Diretor de Tecnologia — tecnologia, bots e sistemas.\n' +
          'Diretor de Marketing — marketing e crescimento.\n' +
          'Diretor de Design — design e identidade visual.',
      },
      {
        name: 'Gestão',
        value:
          'Gerente Geral — coordena toda a equipe.\n' +
          'Gerente de Moderação — lidera a moderação.\n' +
          'Gerente de Suporte — lidera o atendimento.\n' +
          'Supervisor — acompanha a linha de frente.',
      },
      {
        name: 'Linha de frente',
        value:
          'Administrador — punições completas.\n' +
          'Moderador — punições e gerenciamento de mensagens.\n' +
          'Suporte — atendimento e tickets.\n' +
          'Recrutador — seleção de novos membros da equipe.\n' +
          'Estagiário — avaliação interna, atua com supervisão.\n' +
          'Staff de Jogo — atuação dentro do servidor Roblox.',
      },
      {
        name: 'Equipes',
        value:
          'Equipe Staff — tag base de todos os membros da equipe.\n' +
          'Equipe Império — frente geral de staff.\n' +
          'Equipes de Desenvolvimento, Eventos, Design e Marketing — frentes especializadas do projeto.',
      },
      {
        name: 'Diretrizes',
        value:
          `Punições seguem a tabela oficial e devem ser registradas em ${channelRef(ctx, 'registro', '#registro-punicoes')}.\n` +
          `Assuntos internos e decisões ficam em ${channelRef(ctx, 'diretoria', '#diretoria')}.`,
      },
    );
}

function buildBatePonto() {
  return new EmbedBuilder()
    .setColor(0x1f618d)
    .setTitle('Bate-ponto')
    .setDescription(
      'Registre sua entrada ao iniciar o serviço e a saída ao encerrar. Cada registro é salvo automaticamente pelo bot.',
    )
    .addFields({
      name: 'Como funciona',
      value: 'Use os botões abaixo dentro deste canal. O bot confirma o horário e acumula o tempo de cada membro da equipe.',
    });
}

function buildAusencias() {
  return new EmbedBuilder()
    .setColor(0xa04000)
    .setTitle('Ausências')
    .setDescription(
      'Vai ficar fora por um período? Registre a ausência pelo botão abaixo para a direção acompanhar.',
    )
    .addFields({
      name: 'O que informar',
      value: 'Data de início, retorno previsto e motivo. Sempre que possível, registre com antecedência.',
    });
}

function buildEquipes(ctx) {
  return withIcon(
    new EmbedBuilder()
      .setColor(0x9c640c)
      .setTitle('Faça parte da equipe')
      .setDescription('O Império RP está sempre em expansão. Estas são as frentes de trabalho do projeto:')
      .addFields(
        { name: 'Equipe Staff', value: 'Tag base de todos os membros da equipe, de qualquer frente.' },
        { name: 'Equipe Império', value: 'Moderação, suporte e operação do dia a dia no servidor.' },
        { name: 'Staff de Jogo', value: 'Supervisão e suporte dentro do servidor Roblox.' },
        { name: 'Equipe de Desenvolvimento', value: 'Programação do jogo no Roblox, sistemas e correções.' },
        { name: 'Equipe de Eventos', value: 'Criação e condução de eventos para a comunidade.' },
        { name: 'Equipe de Design', value: 'Identidade visual, banners, thumbs e materiais do projeto.' },
        { name: 'Equipe de Marketing', value: 'Divulgação, redes sociais, vídeos e crescimento do projeto.' },
        {
          name: 'Como participar',
          value: `Abra um atendimento em ${channelRef(ctx, 'tickets', '#abrir-ticket')} e informe a equipe desejada.`,
        },
      ),
    ctx,
  );
}

function buildTags(ctx) {
  return new EmbedBuilder()
    .setColor(0x6c3483)
    .setTitle('Tags para Criadores de Conteúdo')
    .setDescription('Produz vídeos, lives ou conteúdo sobre o projeto? Solicite sua tag de criador.')
    .addFields(
      { name: 'Quem pode solicitar', value: 'Criadores de conteúdo e parceiros oficiais com produção ativa.' },
      { name: 'Requisitos', value: 'Conteúdo sobre o Império RP publicado com regularidade e canal ou perfil ativo.' },
      {
        name: 'Como solicitar',
        value: `Abra um atendimento em ${channelRef(ctx, 'tickets', '#abrir-ticket')} com os links do seu conteúdo.`,
      },
    );
}

function buildChangelog(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Notas de Atualização')
    .setDescription('Registro oficial das mudanças do jogo e do servidor. Apenas a administração publica aqui.')
    .addFields(
      { name: 'Formato', value: '**Versão** · o que mudou · o que foi corrigido.' },
      { name: 'Avisos importantes', value: `Comunicados gerais ficam em ${channelRef(ctx, 'anuncios', '#anuncios-gerais')}.` },
    );
}

function buildSpoilers() {
  return new EmbedBuilder()
    .setColor(0x6c3483)
    .setTitle('Prévias')
    .setDescription('Novidades e recursos futuros em primeira mão, publicados pela administração.')
    .addFields(
      { name: 'O que aparece aqui', value: 'Imagens, detalhes e bastidores das próximas atualizações.' },
      { name: 'Atenção', value: 'Compartilhar este conteúdo fora do servidor é proibido pelas regras.' },
    );
}

function buildPolls(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Enquetes Oficiais')
    .setDescription('A administração publica aqui as enquetes oficiais do projeto usando o comando /enquete.')
    .addFields(
      { name: 'Sugestões', value: `Suas ideias ficam em ${channelRef(ctx, 'sugestoes', '#sugestoes')}.` },
      { name: 'Resultados', value: `As decisões são anunciadas em ${channelRef(ctx, 'anuncios', '#anuncios-gerais')}.` },
    );
}

function buildStatus(ctx) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('Status do Servidor')
    .setDescription('Acompanhe o estado do jogo e do atendimento.')
    .addFields(
      { name: 'Estado do jogo', value: `Online, em manutenção ou fechado — avisado em ${channelRef(ctx, 'anuncios', '#anuncios-gerais')}.`, inline: true },
      { name: 'Manutenção', value: 'Programada e avisada com antecedência.', inline: true },
      { name: 'Problemas', value: `Reporte em ${channelRef(ctx, 'bugs', '#reportar-bugs')}.` },
    );
}

function buildGeneral(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Chat Geral')
    .setDescription('Espaço para conversa livre da comunidade.')
    .addFields(
      { name: 'Conduta', value: 'Respeito sempre. Sem spam, flood ou divulgação não autorizada.' },
      { name: 'Roleplay', value: 'Assuntos de personagem ficam em #rp-geral.' },
      { name: 'Dúvidas', value: `Use ${channelRef(ctx, 'ajuda', '#ajuda')} ou abra um ticket.` },
    );
}

function buildMedia() {
  return new EmbedBuilder()
    .setColor(0x1abc9c)
    .setTitle('Mídia')
    .setDescription('Compartilhe clipes, prints e criações sobre o Império RP.')
    .addFields(
      { name: 'Regras', value: 'Conteúdo próprio ou com créditos. Proibido NSFW e divulgação sem autorização.' },
      { name: 'Destaques', value: 'As melhores criações podem ser repostadas nos canais oficiais.' },
    );
}

function buildSuggestions(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Sugestões')
    .setDescription('Envie sua ideia para o servidor. O bot adiciona os votos automaticamente.')
    .addFields(
      { name: 'Como funciona', value: 'Poste sua sugestão aqui. O bot adiciona 👍 e 👎 para a comunidade votar.' },
      { name: 'O que ajuda', value: 'Detalhar o problema, a proposta e exemplos de como funcionaria.' },
      { name: 'Resultado', value: `Sugestões aprovadas viram atualização — acompanhe ${channelRef(ctx, 'atualizacoes', '#atualizacoes')}.` },
    );
}

function buildPartnerships(ctx) {
  return new EmbedBuilder()
    .setColor(0x2e86c1)
    .setTitle('Parcerias')
    .setDescription('Quer firmar parceria com o Império RP? Este é o canal de contato.')
    .addFields(
      { name: 'Como pedir', value: `Abra um atendimento no setor **Parceria** em ${channelRef(ctx, 'tickets', '#abrir-ticket')}.` },
      { name: 'O que enviar', value: 'Nome do projeto, link do servidor, número de membros e a proposta.' },
      { name: 'Requisitos', value: 'Projeto ativo, organizado e alinhado com roleplay.' },
    );
}

function buildRpGeneral(ctx) {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Roleplay Geral')
    .setDescription('Aqui acontece o roleplay por texto do servidor.')
    .addFields(
      { name: 'Antes de jogar', value: `Leia ${channelRef(ctx, 'rp-regras', '#regras-roleplay')} e ${channelRef(ctx, 'regras', '#regras')}.` },
      { name: 'Ações importantes', value: `Registre em ${channelRef(ctx, 'acoes', '#avisos-acoes')}.` },
      { name: 'Fora do personagem', value: `Conversa OOC apenas em ${channelRef(ctx, 'pausa', '#rp-pausa')}.` },
    );
}

function buildRpPause() {
  return new EmbedBuilder()
    .setColor(0x7f8c8d)
    .setTitle('Pausa (OOC)')
    .setDescription('Canal para conversa fora do personagem, sem quebrar o clima do roleplay.')
    .addFields(
      { name: 'Regras', value: 'Não vaze informações do roleplay — metagaming é proibido.' },
      { name: 'Roleplay', value: 'As cenas acontecem em #rp-geral.' },
    );
}

function buildActions(ctx) {
  return new EmbedBuilder()
    .setColor(0xcb4335)
    .setTitle('Avisos de Ações')
    .setDescription('Registre as ações relevantes da cidade no formato abaixo.')
    .addFields(
      { name: 'Modelo', value: '**AÇÃO** · **LOCAL** · **PARTICIPANTES** · **DESCRIÇÃO**' },
      { name: 'Importante', value: 'Ações sem registro podem não ser reconhecidas pela administração.' },
      { name: 'Regras', value: `Siga as regras de roleplay em ${channelRef(ctx, 'rp-regras', '#regras-roleplay')}.` },
    );
}

function buildReports() {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Denúncias')
    .setDescription('Envie denúncias com provas. Este canal é visível apenas para a equipe.')
    .addFields(
      { name: 'Modelo', value: '**Denunciado** · **Motivo** · **Provas**' },
      { name: 'Provas', value: 'Vídeo ou print obrigatório. Sem provas, a denúncia não avança.' },
      { name: 'Aviso', value: 'Denúncia falsa gera punição ao autor.' },
    );
}

function buildOmbudsman() {
  return new EmbedBuilder()
    .setColor(0x1b2631)
    .setTitle('Corregedoria')
    .setDescription('Canal para denúncias contra membros da equipe. Visível apenas para a direção.')
    .addFields(
      { name: 'Como enviar', value: 'Poste a denúncia com provas e o máximo de contexto.' },
      { name: 'Sigilo', value: 'Nada do que for enviado aqui sai do canal.' },
    );
}

function buildAppeals() {
  return new EmbedBuilder()
    .setColor(0xa04000)
    .setTitle('Recursos')
    .setDescription('Foi punido e acredita que houve erro? Solicite revisão neste canal.')
    .addFields(
      { name: 'Modelo', value: '**Punição recebida** · **Data** · **Motivo do recurso**' },
      { name: 'Decisão', value: 'A revisão é feita pela administração e a decisão é final.' },
    );
}

function buildBugs() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Reportar Bugs')
    .setDescription('Encontrou um problema no jogo ou no servidor? Reporte aqui.')
    .addFields(
      { name: 'Modelo', value: '**Onde aconteceu** · **O que aconteceu** · **Como reproduzir**' },
      { name: 'Anexos', value: 'Prints e vídeos agilizam a correção.' },
      { name: 'Recompensa', value: 'Bugs graves reportados com detalhes podem render recompensas.' },
    );
}

function buildStaffReview(ctx) {
  return new EmbedBuilder()
    .setColor(0x9c640c)
    .setTitle('Avaliação da Equipe')
    .setDescription('Foi atendido por um membro da equipe? Deixe sua avaliação.')
    .addFields(
      { name: 'Formato', value: '**Staff avaliado** · **Atendimento** · **Nota de 0 a 10**' },
      { name: 'Reclamações graves', value: `Situações sérias devem ir para ${channelRef(ctx, 'corregedoria', '#corregedoria')}.` },
    );
}

function buildStaffChat() {
  return new EmbedBuilder()
    .setColor(0x1f618d)
    .setTitle('Chat da Equipe')
    .setDescription('Comunicação interna do dia a dia.')
    .addFields(
      { name: 'Conduta', value: 'Profissionalismo e sigilo: assuntos da equipe ficam entre a equipe.' },
      { name: 'Assuntos sérios', value: 'Discussões estratégicas ficam em #diretoria.' },
    );
}

function buildStaffNotices() {
  return new EmbedBuilder()
    .setColor(0x21618c)
    .setTitle('Avisos Internos')
    .setDescription('Alinhamentos, mudanças de processo e avisos para toda a equipe.')
    .addFields(
      { name: 'Leitura obrigatória', value: 'Todos os membros da equipe devem acompanhar este canal.' },
      { name: 'Organização', value: 'Havendo dúvida, pergunte em #chat-staff.' },
    );
}

function buildPunishments(ctx) {
  return new EmbedBuilder()
    .setColor(0xd35400)
    .setTitle('Registro de Punições')
    .setDescription('Histórico de punições aplicadas. Registro obrigatório para auditoria.')
    .addFields(
      { name: 'Advertências', value: 'Use o comando /advertir — o registro cai automaticamente aqui.' },
      { name: 'Banimentos e silenciamentos', value: 'Formato manual: **Membro · Punição · Motivo · Provas**' },
      { name: 'Hierarquia', value: `Dúvidas? Consulte ${channelRef(ctx, 'hierarquia', '#hierarquia-staff')}.` },
    );
}

function buildAutomodLogs() {
  return new EmbedBuilder()
    .setColor(0x4f545c)
    .setTitle('Logs de AutoMod')
    .setDescription('Alertas automáticos de spam, palavras ofensivas, menções em massa e convites.')
    .addFields(
      { name: 'Equipe', value: 'Todos os cargos da equipe são isentos da moderação automática.' },
      { name: 'Importante', value: 'Não apague os registros deste canal.' },
    );
}

function buildTicketLogs() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Logs de Tickets')
    .setDescription('Quando um atendimento é fechado, o transcript completo chega aqui automaticamente.')
    .addFields(
      { name: 'Transcript', value: 'Arquivo .txt com todo o histórico do atendimento.' },
      { name: 'Sigilo', value: 'Conteúdo restrito à equipe.' },
    );
}

function buildBoardroom() {
  return new EmbedBuilder()
    .setColor(0x8b0000)
    .setTitle('Diretoria')
    .setDescription('Canal restrito à direção para decisões e assuntos estratégicos.')
    .addFields(
      { name: 'Acesso', value: 'Somente cargos da diretoria.' },
      { name: 'Conduta', value: 'Sigilo total sobre o que é tratado aqui.' },
    );
}

function buildJoinWelcome(member, ctx) {
  const embed = new EmbedBuilder()
    .setColor(0xd4af37)
    .setTitle(stylize('Bem-vindo ao Império!'))
    .setDescription(
      `<@${member.id}> acabou de chegar. O roleplay acontece no Roblox; aqui ficam a comunidade, os comunicados e o suporte.`,
    )
    .addFields(
      {
        name: '✦ Comece por aqui',
        value:
          `1. Leia ${channelRef(ctx, 'regras', '#regras')} e as regras de roleplay.\n` +
          `2. Escolha seus cargos de notificação em ${channelRef(ctx, 'cargos', '#cargos')}.\n` +
          `3. Acompanhe ${channelRef(ctx, 'anuncios', '#anuncios-gerais')}.`,
      },
      {
        name: '✦ Precisa de ajuda?',
        value: `Abra um atendimento em ${channelRef(ctx, 'tickets', '#abrir-ticket')}.`,
      },
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `${SERVIDOR} ✦ membro nº ${member.guild?.memberCount ?? '?'}` });

  const icon = member.guild?.iconURL?.({ size: 256 }) ?? null;
  if (icon) embed.setAuthor({ name: SERVIDOR, iconURL: icon });
  else embed.setAuthor({ name: SERVIDOR });

  return embed;
}

function buildRoleMenu() {
  const row = new ActionRowBuilder();
  for (const key of MENU_ROLE_KEYS) {
    const cfg = ROLES.find((role) => role.key === key);
    if (!cfg) continue;
    row.addComponents(
      new ButtonBuilder().setCustomId(`cargo:${key}`).setLabel(cfg.name).setStyle(ButtonStyle.Secondary),
    );
  }
  return row;
}

function buildTicketsMenu() {
  const row = new ActionRowBuilder();
  for (const ticket of TICKETS) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket:abrir:${ticket.key}`)
        .setLabel(ticket.label)
        .setStyle(TICKET_STYLES[ticket.key] ?? ButtonStyle.Secondary),
    );
  }
  return row;
}

function buildPontoMenu() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ponto:entrada').setLabel('Registrar entrada').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('ponto:saida').setLabel('Registrar saída').setStyle(ButtonStyle.Secondary),
  );
}

function buildAusenciaMenu() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ausencia:abrir').setLabel('Registrar ausência').setStyle(ButtonStyle.Primary),
  );
}

const BUILDERS = {
  welcome: buildWelcome,
  announcements: buildAnnouncements,
  rules: buildRules,
  'rp-rules': buildRpRules,
  about: buildAbout,
  help: buildHelp,
  vagas: buildVagas,
  cargos: buildCargos,
  tickets: buildTickets,
  hierarquia: buildHierarquia,
  bateponto: buildBatePonto,
  ausencias: buildAusencias,
  equipes: buildEquipes,
  tags: buildTags,
  changelog: buildChangelog,
  spoilers: buildSpoilers,
  polls: buildPolls,
  status: buildStatus,
  general: buildGeneral,
  media: buildMedia,
  suggestions: buildSuggestions,
  partnerships: buildPartnerships,
  'rp-general': buildRpGeneral,
  'rp-pause': buildRpPause,
  actions: buildActions,
  reports: buildReports,
  ombudsman: buildOmbudsman,
  appeals: buildAppeals,
  bugs: buildBugs,
  'staff-review': buildStaffReview,
  'staff-chat': buildStaffChat,
  'staff-notices': buildStaffNotices,
  punishments: buildPunishments,
  'automod-logs': buildAutomodLogs,
  'ticket-logs': buildTicketLogs,
  boardroom: buildBoardroom,
};

const COMPONENTS = {
  cargos: () => [buildRoleMenu()],
  tickets: () => [buildTicketsMenu()],
  bateponto: () => [buildPontoMenu()],
  ausencias: () => [buildAusenciaMenu()],
};

function buildMessage(key, ctx, options = {}) {
  const builder = BUILDERS[key];
  if (!builder) return null;
  const embed = builder(ctx);
  if (!options.plain) {
    if (embed.data.title) embed.setTitle(stylize(embed.data.title));
    if (embed.data.description) embed.setDescription(`${embed.data.description}\n${DIVIDER}`);
    embed.setFooter({ text: `${SERVIDOR} ⊹ ᴘᴀɪɴᴇʟ ᴠ${PANEL_VERSION}` });
    const icon = ctx.guild?.iconURL?.({ size: 256 }) ?? null;
    if (icon) {
      embed.setAuthor({ name: SERVIDOR, iconURL: icon });
      if (!embed.data.thumbnail) embed.setThumbnail(icon);
    } else {
      embed.setAuthor({ name: SERVIDOR });
    }
  }
  const payload = { embeds: [embed] };
  if (COMPONENTS[key]) payload.components = COMPONENTS[key]();
  return payload;
}

module.exports = { buildMessage, stylize, buildJoinWelcome };
