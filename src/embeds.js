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

function head(text) {
  return `**${text.charAt(0).toUpperCase()}${text.slice(1)}**`;
}

const note = (text) => `-# ${text}`;

const guildNameOf = (ctx) => ctx.guild?.name ?? SERVIDOR;

const LEGACY_TITLES = {
  welcome: ['Bem-vindo ao Império RP', 'Bem-vindo ao ✦ 𝓘𝓶𝓹𝓮𝓻𝓲𝓸 𝓡𝓟 ✦'],
  about: ['Império RP', '✦ 𝓘𝓶𝓹𝓮𝓻𝓲𝓸 𝓡𝓟 ✦'],
};

const PANEL_COLORS = {
  welcome: 0xd4af37,
  about: 0xd4af37,
  cargos: 0xd4af37,
  equipes: 0xd4af37,
  tags: 0xd4af37,
  partnerships: 0xd4af37,
  media: 0xd4af37,
  'staff-review': 0xd4af37,
  rules: 0x8b0000,
  'rp-rules': 0x8b0000,
  reports: 0x8b0000,
  ombudsman: 0x8b0000,
  appeals: 0x8b0000,
  punishments: 0x8b0000,
  boardroom: 0x8b0000,
  announcements: 0x2e86c1,
  changelog: 0x2e86c1,
  polls: 0x2e86c1,
  help: 0x2e86c1,
  tickets: 0x2e86c1,
  bugs: 0x2e86c1,
  suggestions: 0x2e86c1,
  general: 0x2e86c1,
  'rec-faccao': 0x8b3a3a,
  'rec-corporacao': 0x2e86c1,
  actions: 0x2e86c1,
  status: 0x2ecc71,
  servers: 0x1f3a5f,
  hierarquia: 0x1f3a5f,
  'staff-chat': 0x1f3a5f,
  'staff-notices': 0x1f3a5f,
  bateponto: 0x1f3a5f,
  ausencias: 0x1f3a5f,
  'automod-logs': 0x4f545c,
  'ticket-logs': 0x4f545c,
  spoilers: 0x6c3483,
};

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

function buildWelcome(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Bem-vindo ao Servidor')
    .setDescription(
      [
        '> **Seja bem-vindo(a) à nossa cidade.** Este é o seu ponto de partida.',
        '',
        head('roteiro inicial'),
        `**1.** Leia ${channelRef(ctx, 'regras', '#regras')} e ${channelRef(ctx, 'rp-regras', '#regras-roleplay')} — valem para todos, sem exceção.`,
        `**2.** Escolha seus cargos de notificação em ${channelRef(ctx, 'cargos', '#cargos')}.`,
        `**3.** Acompanhe os comunicados em ${channelRef(ctx, 'anuncios', '#anuncios-gerais')}.`,
        '**4.** Entre no jogo, crie seu personagem e comece a viver o roleplay.',
        '',
        head('suporte'),
        `Dúvidas, problemas ou denúncias: ${channelRef(ctx, 'tickets', '#abrir-ticket')}. A equipe atende por lá.`,
        '',
        note('Ao permanecer no servidor, você concorda com as regras.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Links', value: linksBlock() },
      { name: 'Ambiente', value: 'Roleplay no Roblox · Comunidade e suporte no Discord.' },
      { name: 'Precisa de ajuda?', value: `Abra um atendimento em ${channelRef(ctx, 'tickets', '#abrir-ticket')}.` },
    );
}

function buildAnnouncements(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Comunicados')
    .setDescription(
      [
        '> **Comunicados oficiais da administração.** Tudo o que importa é publicado aqui primeiro.',
        '',
        head('o que você encontra'),
        '• Anúncios do projeto e da comunidade.',
        '• Mudanças de regras e avisos gerais.',
        '• Comunicados urgentes: manutenção, eventos e novidades.',
        '',
        head('regra do canal'),
        `Apenas a equipe publica aqui. Dúvidas vão em ${channelRef(ctx, 'ajuda', '#ajuda')} ou em ticket.`,
        '',
        note('Não comente anúncios — use os canais de conversa.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Notificações', value: `Pegue o cargo de avisos em ${channelRef(ctx, 'cargos', '#cargos')} para ser marcado(a).` },
      { name: 'Atualizações', value: `Notas de versão ficam em ${channelRef(ctx, 'atualizacoes', '#atualizações')}.` },
    );
}

function buildRules() {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Regras do Servidor')
    .setDescription(
      [
        '> **A lei da cidade.** Ao permanecer no servidor, você concorda com cada regra abaixo.',
        '',
        head('convivência'),
        '**1.** Respeito acima de tudo. Ofensas, racismo e qualquer forma de preconceito levam a punição severa.',
        '**2.** Proibido spam, flood e divulgação não autorizada de outros servidores ou links.',
        '**3.** Conteúdo ilegal, gore, NSFW ou +18 não é permitido em nenhum canal.',
        '**4.** Não compartilhe dados pessoais — seus ou de terceiros.',
        '**5.** Conversas, prints e gravações internas não saem do servidor.',
        '',
        head('integridade'),
        '**6.** Contas alternativas para burlar punições resultam em banimento permanente.',
        '**7.** Enganar ou manipular a administração é falta grave.',
        '',
        head('ordem'),
        '**8.** A administração tem a palavra final, e toda decisão é registrada para auditoria.',
        '',
        note('Dúvidas de interpretação? Abra um ticket de suporte.'),
      ].join('\n'),
    )
    .addFields(
      {
        name: 'Tabela de punições',
        value: '**Advertência** — faltas leves.\n**Silenciamento** — reincidência ou falta média.\n**Banimento** — falta grave ou reincidência.',
      },
      {
        name: 'Apelações',
        value: 'Foi punido(a) injustamente? Solicite revisão pelo ticket de **Recurso**.',
      },
      {
        name: 'Denúncias',
        value: 'Testemunhou uma infração? Envie as provas pelo ticket de **Denúncia**.',
      },
    );
}

function buildRpRules(ctx) {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Regras de Roleplay')
    .setDescription(
      [
        '> **A vida na cidade é levada a sério.** Interpretar é obrigatório em todas as situações.',
        '',
        head('princípios'),
        '**1. Valorização da vida.** Seu personagem age para sobreviver — ignorar riscos é tão errado quanto fugir de tudo.',
        '**2. RDM.** Matar ou agredir alguém sem motivo de RP é proibido.',
        '**3. VDM.** Usar veículo como arma é proibido.',
        '**4. Combat logging.** Sair do jogo para escapar das consequências é proibido.',
        '',
        head('informação'),
        '**5. Metagaming.** Proibido usar informações obtidas fora do personagem (Discord, lives, prints).',
        '**6. Powergaming.** Ações impossíveis ou que forcem a decisão de outro jogador são proibidas.',
        '',
        head('convivência'),
        `**7. Ações.** Siga as regras de engajamento e registre ações relevantes em ${channelRef(ctx, 'acoes', '#avisos-ações')}.`,
        `**8. Fora do personagem.** Conversa OOC apenas em ${channelRef(ctx, 'geral', '#geral')}.`,
        '**9. Hierarquia.** Ordens de líderes e sub-líderes valem dentro do RP.',
        '',
        note('Desconhecer as regras não isenta de punição.'),
      ].join('\n'),
    )
    .addFields(
      {
        name: 'Termos importantes',
        value: '**RP** — interpretação · **OOC** — fora do personagem\n**RDM** — morte sem motivo · **VDM** — atropelamento proposital\n**Meta/Power** — uso indevido de informação/ações forçadas.',
      },
      {
        name: 'Punições de RP',
        value: 'Variam de advertência a banimento, conforme a gravidade e a reincidência.',
      },
    );
}

function buildAbout(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Sobre o Servidor')
    .setDescription(
      [
        '> **Bem-vindo à nossa cidade.** Um servidor de roleplay de temática carioca no Roblox.',
        '',
        head('o projeto'),
        'Aqui ficam a comunidade, os comunicados e o suporte. O roleplay acontece dentro do jogo.',
        '',
        head('facções e organizações'),
        'Operam em servidores próprios, com recrutamento e regras internas. As lideranças recebem cargos de representação aqui.',
        '',
        head('primeiros passos'),
        `**1.** Leia ${channelRef(ctx, 'regras', '#regras')} e ${channelRef(ctx, 'rp-regras', '#regras-roleplay')}.`,
        `**2.** Acompanhe ${channelRef(ctx, 'anuncios', '#anuncios-gerais')}.`,
        '**3.** Entre no jogo pelo link e comece a jogar.',
      ].join('\n'),
    )
    .addFields(
      { name: 'Links', value: linksBlock() },
      { name: 'Suporte', value: `Atendimento privado em ${channelRef(ctx, 'tickets', '#abrir-ticket')}.` },
      { name: 'Equipe', value: `Quer fazer parte? Veja as frentes em ${channelRef(ctx, 'seja-staff', '#seja-staff')}.` },
    );
}

function buildHelp(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Suporte')
    .setDescription(
      [
        '> **Central de ajuda.** Precisa de algo? Um dos caminhos abaixo resolve.',
        '',
        head('como pedir ajuda'),
        `• Atendimento privado: ${channelRef(ctx, 'tickets', '#abrir-ticket')}.`,
        '• Explique com detalhes e anexe prints ou vídeos quando possível.',
        '• Evite marcar a equipe diretamente — o ticket é o caminho oficial.',
        '',
        note('Pedidos fora do padrão demoram mais para serem respondidos.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Dúvidas e problemas', value: `Ticket de **Suporte** em ${channelRef(ctx, 'tickets', '#abrir-ticket')}.` },
      { name: 'Denúncias', value: `Provas (vídeo ou print) em ${channelRef(ctx, 'denuncias', '#denúncias')} ou pelo ticket de **Denúncia**.` },
      { name: 'Contra a equipe', value: `Reclamações sobre membros da equipe vão para ${channelRef(ctx, 'corregedoria', '#corregedoria')}.` },
      { name: 'Recursos', value: `Revisão de punição pelo ticket de **Recurso** (${channelRef(ctx, 'recursos', '#recursos')}).` },
      { name: 'Bugs', value: `Problemas no jogo ou no servidor: ${channelRef(ctx, 'bugs', '#reportar-bugs')}.` },
    );
}

function buildRecFaccao(ctx) {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Recrutamento de Facção')
    .setDescription(
      [
        '> **Vagas abertas nas facções da cidade.** Quem procura posição encontra aqui.',
        '',
        head('modelo de anúncio'),
        '**FACÇÃO · VAGA · REQUISITOS · CONTATO**',
        '',
        'Exemplo: **Comando Vermelho** · **Soldado e gerente** · **Ativo, headset e maior de 16** · **@liderança ou ticket de Liderança.**',
        '',
        note('Somente lideranças de facção publicam anúncios aqui.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Quem publica', value: 'Líderes e sub-líderes com o cargo de representação.' },
      { name: 'Como se candidatar', value: 'Chame no privado o contato do anúncio — a liderança envia o convite do time.' },
      { name: 'Postura', value: 'Anúncio no modelo, sem spam ou marcação em massa.' },
    );
}

function buildRecCorporacao(ctx) {
  return new EmbedBuilder()
    .setColor(0x2e86c1)
    .setTitle('Recrutamento de Corporação')
    .setDescription(
      [
        '> **Vagas abertas nas corporações da cidade.** Disciplina, farda e serviço.',
        '',
        head('modelo de anúncio'),
        '**CORPORAÇÃO · VAGA · REQUISITOS · CONTATO**',
        '',
        'Exemplo: **Polícia Civil** · **Investigador** · **Ativo, disciplina e maior de 16** · **@liderança ou ticket de Liderança.**',
        '',
        note('Somente lideranças de corporação publicam anúncios aqui.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Quem publica', value: 'Líderes e sub-líderes com o cargo de representação.' },
      { name: 'Como se candidatar', value: 'Chame no privado o contato do anúncio — a liderança envia o convite do time.' },
      { name: 'Postura', value: 'Anúncio no modelo, sem spam ou marcação em massa.' },
    );
}

function buildServers(ctx) {
  return new EmbedBuilder()
    .setColor(0x1f3a5f)
    .setTitle('Servidores Oficiais')
    .setDescription(
      [
        '> **Só entra na cidade quem é oficial.** Aqui ficam os servidores cadastrados de facções e corporações.',
        '',
        head('como funciona'),
        '• Apenas servidores cadastrados pela administração podem ser divulgados.',
        '• Convites de outros servidores são bloqueados automaticamente em todo o servidor.',
        '• A lista oficial é publicada pela administração logo abaixo.',
        '',
        note('Sua facção ou corporação quer um servidor oficial? Fale com a administração.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Facções cadastradas', value: 'Lista oficial mantida pela administração.' },
      { name: 'Corporações cadastradas', value: 'Lista oficial mantida pela administração.' },
      { name: 'Denúncias', value: `Servidor oficial fora das regras? Denuncie em ${channelRef(ctx, 'denuncias', '#denúncias')}.` },
    );
}

function buildCargos() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Cargos de Notificação')
    .setDescription(
      [
        '> **Escolha o que você quer receber.** Sem cargo, sem notificação.',
        '',
        head('como funciona'),
        'Clique no botão do cargo para **receber**; clique de novo para **remover**.',
        'A notificação só acontece quando o cargo correspondente é marcado.',
        '',
        note('Você pode mudar de ideia quando quiser — é instantâneo.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Ping Anúncios', value: 'Seja marcado(a) em comunicados, atualizações e avisos importantes.' },
      { name: 'Ping Ações', value: 'Seja marcado(a) em movimentações e ações relevantes da cidade.' },
    );
}

function buildTickets() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Central de Atendimento')
    .setDescription(
      [
        '> **Atendimento direto com a equipe.** Escolha o setor do seu caso e um canal privado será aberto.',
        '',
        head('setores disponíveis'),
        ...TICKETS.map((ticket) => `**${ticket.label}** — ${ticket.summary}`),
        '',
        head('regras do atendimento'),
        '• Um atendimento por vez por membro.',
        '• Explique com detalhes e anexe provas quando houver.',
        '• A equipe pode encerrar tickets inativos.',
      ].join('\n'),
    )
    .addFields(
      { name: 'Tempo de resposta', value: 'A equipe responde assim que possível — evite abrir vários tickets.' },
      { name: 'Sigilo', value: 'O conteúdo do atendimento é visível apenas para você e a equipe.' },
    );
}

function buildHierarquia(ctx) {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Hierarquia da Equipe')
    .setDescription(
      [
        '> **A estrutura que sustenta a cidade.** Organização, cargos e diretrizes da equipe.',
        '',
        'A hierarquia define responsabilidades e o caminho de crescimento dentro do staff.',
        '',
        note('Cada função existe para um propósito — respeite as atribuições de cada nível.'),
      ].join('\n'),
    )
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
          `Punições seguem a tabela oficial e devem ser registradas em ${channelRef(ctx, 'registro', '#registro-punições')}.\n` +
          `Assuntos internos e decisões ficam em ${channelRef(ctx, 'diretoria', '#diretoria')}.`,
      },
      {
        name: 'Postura da equipe',
        value: 'Discrição, respeito e exemplo. O cargo é uma responsabilidade, não um privilégio.',
      },
    );
}

function buildBatePonto(ctx) {
  return new EmbedBuilder()
    .setColor(0x1f618d)
    .setTitle('Bate-ponto')
    .setDescription(
      [
        '> **Controle de serviço da equipe.** Cada hora de dedicação é registrada.',
        '',
        head('como usar'),
        `**1.** Clique em **Registrar entrada** ao iniciar o serviço.`,
        `**2.** Clique em **Registrar saída** ao encerrar.`,
        '**3.** O bot confirma o horário e acumula o seu tempo total.',
        '',
        note('Os registros são salvos automaticamente pelo bot.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Regras', value: 'Registre ponto apenas em serviço. Inconsistências são auditadas pela gestão.' },
      { name: 'Imprevistos', value: `Vai precisar parar? Registre a ausência em ${channelRef(ctx, 'ausencias', '#ausências')}.` },
    );
}

function buildAusencias(ctx) {
  return new EmbedBuilder()
    .setColor(0xa04000)
    .setTitle('Ausências')
    .setDescription(
      [
        '> **Vai se ausentar? Avise antes.** Planejamento mantém a equipe saudável.',
        '',
        head('como registrar'),
        'Clique em **Registrar ausência** e preencha o formulário com data de início, retorno previsto e motivo.',
        '',
        note('Sempre que possível, registre com antecedência.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Boa prática', value: 'Avise a liderança direta e combine a cobertura das suas funções.' },
      { name: 'Retorno', value: 'Ao voltar, retome as atividades normalmente — o aviso fica registrado no canal.' },
    );
}

function buildEquipes(ctx) {
  return new EmbedBuilder()
    .setColor(0x9c640c)
    .setTitle('Faça parte da equipe')
    .setDescription(
      [
        '> **O projeto cresce com gente boa.** Estas são as frentes de trabalho abertas.',
        '',
        'Escolha a frente que combina com você e candidate-se. Experiência ajuda, mas dedicação vale mais.',
        '',
        head('como participar'),
        `Abra um atendimento em ${channelRef(ctx, 'tickets', '#abrir-ticket')} e informe a equipe desejada.`,
      ].join('\n'),
    )
    .addFields(
      { name: 'Equipe Staff', value: 'Tag base de todos os membros da equipe, de qualquer frente.' },
      { name: 'Equipe Império', value: 'Moderação, suporte e operação do dia a dia no servidor.' },
      { name: 'Staff de Jogo', value: 'Supervisão e suporte dentro do servidor Roblox.' },
      { name: 'Equipe de Desenvolvimento', value: 'Programação do jogo no Roblox, sistemas e correções.' },
      { name: 'Equipe de Eventos', value: 'Criação e condução de eventos para a comunidade.' },
      { name: 'Equipe de Design', value: 'Identidade visual, banners, thumbs e materiais do projeto.' },
      { name: 'Equipe de Marketing', value: 'Divulgação, redes sociais, vídeos e crescimento do projeto.' },
      { name: 'Requisitos', value: 'Comprometimento, postura e disponibilidade mínima semanal.' },
    );
}

function buildTags(ctx) {
  return new EmbedBuilder()
    .setColor(0x6c3483)
    .setTitle('Tags para Criadores de Conteúdo')
    .setDescription(
      [
        '> **Sua produção merece reconhecimento.** Produz vídeos, lives ou conteúdo sobre o projeto?',
        '',
        head('quem pode pedir'),
        'Criadores de conteúdo e parceiros oficiais com produção ativa.',
        '',
        head('benefícios'),
        '• Cargo de **Criador de Conteúdo** exclusivo.',
        '• Divulgação dos seus conteúdos nos canais oficiais.',
        '• Acesso antecipado a novidades para conteúdo.',
        '',
        note('Cada pedido é avaliado caso a caso pela administração.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Requisitos', value: 'Conteúdo sobre o projeto publicado com regularidade e canal ou perfil ativo.' },
      { name: 'Como solicitar', value: `Abra um atendimento em ${channelRef(ctx, 'tickets', '#abrir-ticket')} com os links do seu conteúdo.` },
    );
}

function buildChangelog(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Notas de Atualização')
    .setDescription(
      [
        '> **O registro oficial das mudanças.** Cada versão do jogo e do servidor fica documentada aqui.',
        '',
        head('formato das notas'),
        '**Versão** — o que mudou — o que foi corrigido.',
        '',
        `Novidades em primeira mão ficam em ${channelRef(ctx, 'spoilers', '#spoilers')}.`,
        '',
        note('Apenas a administração publica neste canal.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Comunicados gerais', value: `Anúncios e avisos importantes em ${channelRef(ctx, 'anuncios', '#anuncios-gerais')}.` },
      { name: 'Problemas', value: `Reporte bugs em ${channelRef(ctx, 'bugs', '#reportar-bugs')} para entrarem nas próximas notas.` },
    );
}

function buildSpoilers() {
  return new EmbedBuilder()
    .setColor(0x6c3483)
    .setTitle('Prévias')
    .setDescription(
      [
        '> **Primeira mão.** Novidades e recursos futuros publicados pela administração.',
        '',
        head('o que aparece aqui'),
        '• Imagens e detalhes das próximas atualizações.',
        '• Bastidores do desenvolvimento.',
        '• Mudanças planejadas na cidade.',
        '',
        note('Compartilhar este conteúdo fora do servidor é proibido pelas regras.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Confidencialidade', value: 'Vazamentos são tratados como falta grave.' },
      { name: 'Expectativas', value: 'Recursos em desenvolvimento podem mudar antes do lançamento.' },
    );
}

function buildPolls(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Enquetes Oficiais')
    .setDescription(
      [
        '> **A voz da comunidade decide.** Enquetes oficiais publicadas pela administração com o comando /enquete.',
        '',
        head('como participar'),
        'Vote na enquete e acompanhe o resultado em tempo real.',
        '',
        note('Os resultados orientam as decisões — a palavra final é da administração.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Sugestões', value: `Suas ideias ficam em ${channelRef(ctx, 'sugestoes', '#sugestões')}.` },
      { name: 'Resultados', value: `As decisões são anunciadas em ${channelRef(ctx, 'anuncios', '#anuncios-gerais')}.` },
    );
}

function buildStatus(ctx) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('Status do Servidor')
    .setDescription(
      [
        '> **Tudo em um só lugar.** O estado do jogo e do atendimento, direto da administração.',
        '',
        note('Em manutenção? Acompanhe o retorno pelos avisos oficiais.'),
      ].join('\n'),
    )
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
    .setDescription(
      [
        '> **O ponto de encontro da comunidade.** Converse, conheça gente, combine o RP.',
        '',
        head('combina com o canal'),
        '• Conversa livre e apresentações.',
        '• Combinados rápidos de jogo.',
        '• Memes e zoação leve.',
        '',
        head('não combina'),
        '• Discussões de personagem (isso é no RP).',
        '• Divulgação, spam ou discussão pesada.',
      ].join('\n'),
    )
    .addFields(
      { name: 'Conduta', value: 'Respeito sempre. Reincidência leva a silenciamento.' },
      { name: 'Ações', value: `Registre as ações da cidade em ${channelRef(ctx, 'acoes', '#avisos-ações')}.` },
      { name: 'Dúvidas', value: `Use ${channelRef(ctx, 'ajuda', '#ajuda')} ou abra um ticket.` },
    );
}

function buildMedia(ctx) {
  return new EmbedBuilder()
    .setColor(0x1abc9c)
    .setTitle('Mídia')
    .setDescription(
      [
        '> **Mostre sua cidade.** Clipes, prints, edits e criações são bem-vindos.',
        '',
        head('regras do canal'),
        '• Conteúdo próprio ou com créditos explícitos.',
        '• Proibido NSFW e divulgação não autorizada.',
        '• Mantenha o respeito nos comentários.',
        '',
        note('As melhores criações podem ser repostadas nos canais oficiais.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Destaques', value: 'Criações de destaque recebem visibilidade da administração.' },
      { name: 'Criadores', value: `Produz conteúdo? Solicite sua tag em ${channelRef(ctx, 'solicitar-tag', '#solicitar-tag')}.` },
    );
}

function buildSuggestions(ctx) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Sugestões')
    .setDescription(
      [
        '> **Sua ideia pode virar atualização.** Este canal existe para ouvir a comunidade.',
        '',
        head('como funciona'),
        'Poste sua sugestão — o bot adiciona 👍 e 👎 automaticamente para a comunidade votar.',
        '',
        head('o que faz uma boa sugestão'),
        '• Problema claro e proposta objetiva.',
        '• Exemplos de como funcionaria.',
        '• Detalhes que ajudem a equipe a avaliar.',
      ].join('\n'),
    )
    .addFields(
      { name: 'O que ajuda', value: 'Detalhar o problema, a proposta e exemplos práticos.' },
      { name: 'Resultado', value: `Sugestões aprovadas viram atualização — acompanhe ${channelRef(ctx, 'atualizacoes', '#atualizações')}.` },
      { name: 'Votação', value: 'Sugestões com boa receptação são priorizadas pela administração.' },
    );
}

function buildPartnerships(ctx) {
  return new EmbedBuilder()
    .setColor(0x2e86c1)
    .setTitle('Parcerias')
    .setDescription(
      [
        '> **Crescer junto é melhor.** Parcerias com projetos organizados e alinhados ao RP.',
        '',
        head('como pedir'),
        `Abra um atendimento no setor **Parceria** em ${channelRef(ctx, 'tickets', '#abrir-ticket')}.`,
        '',
        head('o que enviar'),
        '• Nome e link do projeto.',
        '• Número de membros.',
        '• Proposta de parceria.',
        '',
        note('Projetos inativos ou desorganizados não são aprovados.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Requisitos', value: 'Projeto ativo, organizado e alinhado com roleplay.' },
      { name: 'Divulgação', value: `Parcerias oficiais são divulgadas em ${channelRef(ctx, 'parcerias', '#parcerias')}.` },
    );
}

function buildActions(ctx) {
  return new EmbedBuilder()
    .setColor(0xcb4335)
    .setTitle('Avisos de Ações')
    .setDescription(
      [
        '> **Registro oficial de ações.** O que não é registrado pode não ser reconhecido.',
        '',
        head('modelo de post'),
        '**AÇÃO** · **LOCAL** · **PARTICIPANTES** · **DESCRIÇÃO**',
        '',
        'Exemplo: **Assalto** · **Porto** · **Facção Vermelha** · **Chegada em comboio, negociação e fuga pela Zona Norte.**',
        '',
        note('Ações sem registro podem ser desconsideradas em disputas.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Importante', value: 'Poste o registro imediatamente após a ação acontecer.' },
      { name: 'Regras', value: `Siga as regras de roleplay em ${channelRef(ctx, 'rp-regras', '#regras-roleplay')}.` },
    );
}

function buildReports() {
  return new EmbedBuilder()
    .setColor(0x8b3a3a)
    .setTitle('Denúncias')
    .setDescription(
      [
        '> **Justiça com provas.** Denúncias são tratadas com sigilo e seriedade.',
        '',
        head('modelo de denúncia'),
        '**Denunciado** · **Motivo** · **Provas**',
        '',
        'Vídeo ou print é obrigatório — sem provas, a denúncia não avança.',
        '',
        note('Denúncia falsa gera punição ao autor.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Prazo de análise', value: 'A equipe avalia as provas e retorna pelo próprio canal.' },
      { name: 'Sigilo', value: 'Apenas a equipe vê este canal.' },
    );
}

function buildOmbudsman() {
  return new EmbedBuilder()
    .setColor(0x1b2631)
    .setTitle('Corregedoria')
    .setDescription(
      [
        '> **Contra abuso de poder.** Canal para denúncias contra membros da equipe.',
        '',
        head('como enviar'),
        'Poste com provas e o máximo de contexto: quem, quando, onde e o que aconteceu.',
        '',
        note('Sigilo absoluto: nada do que for enviado aqui sai desta sala.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Quem vê', value: 'Somente a direção do projeto.' },
      { name: 'Retorno', value: 'A conclusão da análise é informada diretamente a você.' },
    );
}

function buildAppeals() {
  return new EmbedBuilder()
    .setColor(0xa04000)
    .setTitle('Recursos')
    .setDescription(
      [
        '> **Direito de revisão.** Foi punido(a) e acredita que houve erro? Este é o caminho formal.',
        '',
        head('modelo de recurso'),
        '**Punição recebida** · **Data** · **Motivo do recurso**',
        '',
        'Seja objetivo e traga provas quando existirem.',
        '',
        note('A revisão é feita pela administração e a decisão é final.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Prazo', value: 'Recursos são analisados em até 48 horas.' },
      { name: 'Enquanto isso', value: 'Usar contas alternativas durante a punição agrava a situação.' },
    );
}

function buildBugs() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Reportar Bugs')
    .setDescription(
      [
        '> **Encontrou um problema? Reporte e ajude a melhorar a cidade.**',
        '',
        head('modelo de report'),
        '**Onde aconteceu** · **O que aconteceu** · **Como reproduzir**',
        '',
        'Prints e vídeos agilizam MUITO a correção.',
        '',
        note('Bugs graves reportados com detalhes podem render recompensas.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Prioridade', value: 'Bugs que bloqueiam o jogo são tratados primeiro.' },
      { name: 'Não use este canal para', value: 'Denúncias de jogadores — use o ticket de denúncia.' },
    );
}

function buildStaffReview(ctx) {
  return new EmbedBuilder()
    .setColor(0x9c640c)
    .setTitle('Avaliação da Equipe')
    .setDescription(
      [
        '> **A equipe também é avaliada.** Seu feedback melhora o atendimento.',
        '',
        head('formato da avaliação'),
        '**Staff avaliado** · **Atendimento** · **Nota de 0 a 10**',
        '',
        note(`Reclamações graves devem ir para ${channelRef(ctx, 'corregedoria', '#corregedoria')}.`),
      ].join('\n'),
    )
    .addFields(
      { name: 'Feedback sincero', value: 'Elogios e críticas construtivas são bem-vindos.' },
      { name: 'Reconhecimento', value: 'Atendimentos de destaque são reconhecidos pela gestão.' },
    );
}

function buildStaffChat(ctx) {
  return new EmbedBuilder()
    .setColor(0x1f618d)
    .setTitle('Chat da Equipe')
    .setDescription(
      [
        '> **Base da equipe.** Comunicação interna do dia a dia.',
        '',
        head('convivência'),
        '• Profissionalismo e respeito entre os membros.',
        '• Assuntos da equipe ficam entre a equipe.',
        '',
        `Decisões estratégicas e assuntos sensíveis ficam em ${channelRef(ctx, 'diretoria', '#diretoria')}.`,
      ].join('\n'),
    )
    .addFields(
      { name: 'Dúvidas', value: 'Pergunte sem medo — ninguém nasce sabendo.' },
      { name: 'Confidencialidade', value: 'Prints deste canal não saem da equipe.' },
    );
}

function buildStaffNotices(ctx) {
  return new EmbedBuilder()
    .setColor(0x21618c)
    .setTitle('Avisos Internos')
    .setDescription(
      [
        '> **Avisos da gestão.** Alinhamentos e mudanças de processo para toda a equipe.',
        '',
        head('leitura obrigatória'),
        'Todo membro da equipe deve acompanhar este canal.',
        '',
        `Dúvidas sobre avisos: ${channelRef(ctx, 'staff-chat', '#chat-staff')}.`,
      ].join('\n'),
    )
    .addFields(
      { name: 'Ciência', value: 'Aplique os avisos no expediente assim que lidos.' },
      { name: 'Atualizações', value: 'Processos antigos deixam de valer quando há aviso novo.' },
    );
}

function buildPunishments(ctx) {
  return new EmbedBuilder()
    .setColor(0xd35400)
    .setTitle('Registro de Punições')
    .setDescription(
      [
        '> **Registro obrigatório para auditoria.** Toda punição aplicada fica documentada aqui.',
        '',
        head('como registrar'),
        '• **Advertências:** use o comando /advertir — o registro cai automaticamente neste canal.',
        '• **Banimentos e silenciamentos:** poste no formato **Membro · Punição · Motivo · Provas**.',
        '',
        note('Registro incompleto dificulta recursos e auditorias.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Hierarquia', value: `Dúvidas? Consulte ${channelRef(ctx, 'hierarquia', '#hierarquia-staff')}.` },
      { name: 'Auditoria', value: 'A direção revisa os registros periodicamente.' },
    );
}

function buildAutomodLogs(ctx) {
  return new EmbedBuilder()
    .setColor(0x4f545c)
    .setTitle('Logs de AutoMod')
    .setDescription(
      [
        '> **Guardião automático.** Alertas de moderação em tempo real.',
        '',
        head('o que é monitorado'),
        '• Spam e flood.',
        '• Palavras ofensivas.',
        '• Menções em massa.',
        '• Convites e links externos.',
        '',
        note('Todos os cargos da equipe são isentos. Não apague registros deste canal.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Ação da equipe', value: 'Analise os alertas e aplique as punições cabíveis.' },
      { name: 'Falsos positivos', value: `Alertas em contexto legítimo (ex.: ${channelRef(ctx, 'parcerias', '#parcerias')}) podem ser ignorados.` },
    );
}

function buildTicketLogs() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Logs de Tickets')
    .setDescription(
      [
        '> **Memória do atendimento.** Quando um ticket é fechado, o transcript completo chega aqui.',
        '',
        head('o que contém'),
        '• Arquivo .txt com todo o histórico da conversa.',
        '• Setor, autor e quem fechou o atendimento.',
        '• Links dos anexos enviados.',
        '',
        note('Conteúdo restrito à equipe.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Uso', value: 'Consulte em recursos, denúncias e auditorias internas.' },
      { name: 'Sigilo', value: 'Transcripts não são compartilhados fora da equipe.' },
    );
}

function buildBoardroom(ctx) {
  return new EmbedBuilder()
    .setColor(0x8b0000)
    .setTitle('Diretoria')
    .setDescription(
      [
        '> **Sala estratégica.** Decisões, planejamento e assuntos da direção.',
        '',
        head('acesso'),
        'Somente cargos da diretoria.',
        '',
        note('Sigilo total sobre o que é tratado aqui.'),
      ].join('\n'),
    )
    .addFields(
      { name: 'Pauta', value: 'Decisões registradas aqui têm prioridade máxima na execução.' },
      { name: 'Punições', value: `Registros oficiais em ${channelRef(ctx, 'registro', '#registro-punições')}.` },
    );
}

function buildJoinWelcome(member, ctx) {
  const name = guildNameOf({ guild: member.guild });
  const icon = member.guild?.iconURL?.({ size: 256 }) ?? null;
  const count = member.guild?.memberCount ?? '?';

  const embed = new EmbedBuilder()
    .setColor(PANEL_COLORS.welcome)
    .setTitle('Bem-vindo!')
    .setDescription(
      `<@${member.id}> acabou de chegar.\n\n` +
        'Aqui ficam a comunidade, os comunicados e o suporte. O roleplay acontece no Roblox.',
    )
    .addFields(
      {
        name: 'Comece por aqui',
        value:
          `1. Leia ${channelRef(ctx, 'regras', '#regras')} e as regras de roleplay.\n` +
          `2. Escolha seus cargos de notificação em ${channelRef(ctx, 'cargos', '#cargos')}.\n` +
          `3. Acompanhe ${channelRef(ctx, 'anuncios', '#anuncios-gerais')}.`,
      },
      {
        name: 'Precisa de ajuda?',
        value: `Abra um atendimento em ${channelRef(ctx, 'tickets', '#abrir-ticket')}.`,
      },
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `Membro nº ${count}` });

  if (icon) {
    embed.setAuthor({ name, iconURL: icon });
    embed.setFooter({ text: `Membro nº ${count}`, iconURL: icon });
  } else {
    embed.setAuthor({ name });
  }

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
  'rec-faccao': buildRecFaccao,
  'rec-corporacao': buildRecCorporacao,
  servers: buildServers,
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
  if (embed.data.description) {
    embed.setDescription(embed.data.description.replace(/^>\s?/gm, ''));
  }
  if (!options.plain) {
    if (PANEL_COLORS[key] !== undefined) embed.setColor(PANEL_COLORS[key]);

    const name = guildNameOf(ctx);
    const icon = ctx.guild?.iconURL?.({ size: 256 }) ?? null;
    if (icon) {
      embed.setAuthor({ name, iconURL: icon });
      embed.setFooter({ text: `Painel oficial · v${PANEL_VERSION}`, iconURL: icon });
    } else {
      embed.setAuthor({ name });
      embed.setFooter({ text: `Painel oficial · v${PANEL_VERSION}` });
    }
  }
  const payload = { embeds: [embed] };
  if (COMPONENTS[key]) payload.components = COMPONENTS[key]();
  return payload;
}

module.exports = { buildMessage, stylize, buildJoinWelcome, LEGACY_TITLES };
