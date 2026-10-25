const GUILD_ID = '1515169542043734148';
const SERVIDOR = 'Assault RJ';
const NAME = 'Assault RJ';
const DESCRIPTION = 'Roleplay carioca no Roblox. Entre, escolha sua história e viva a cidade.';
const LAYOUT = 'v2';
const ACCENT = 0xd4af37;

const COLORS = {
  gold: 0xd4af37,
  red: 0x8b0000,
  blue: 0x2e86c1,
  green: 0x1e8449,
  dark: 0x1f3a5f,
  orange: 0xa04000,
};

const LINKS = {
  jogo: '',
  grupo: '',
  trello: '',
};

const MENU_ROLE_KEYS = ['ping_anuncios', 'ping_acoes'];
const AUTO_ROLE_KEY = 'membro';
const TICKET_JUNIOR_KEYS = ['staff_rp', 'auxiliar', 'estagiario'];

const STAFF_KEYS = [
  'fundador',
  'administrador',
  'diretor_geral',
  'diretor_operacoes',
  'diretor_tecnologia',
  'diretor_marketing',
  'gerente_geral',
  'supervisor',
  'coordenador',
  'moderador',
  'suporte',
  'staff_rp',
  'auxiliar',
  'estagiario',
];
const STAFF_SENIOR_KEYS = [
  'fundador',
  'administrador',
  'diretor_geral',
  'diretor_operacoes',
  'diretor_tecnologia',
  'diretor_marketing',
];

const TICKETS = [
  {
    key: 'suporte',
    label: 'Suporte',
    summary: 'Dúvidas e problemas gerais',
    title: 'Atendimento — Suporte',
    color: 0x2e86c1,
    instructions:
      'Descreva sua dúvida ou problema com detalhes. Se envolver o jogo, anexe prints ou vídeos.',
  },
  {
    key: 'denuncia',
    label: 'Denúncia',
    summary: 'Denúncias com provas',
    title: 'Atendimento — Denúncia',
    color: 0x8b0000,
    instructions:
      'Informe quem está sendo denunciado, o que aconteceu e anexe provas. Denúncias falsas geram punição.',
  },
  {
    key: 'recurso',
    label: 'Recurso',
    summary: 'Revisão de punições',
    title: 'Atendimento — Recurso',
    color: 0xa04000,
    instructions:
      'Explique a punição recebida e o que deseja acrescentar. A decisão final é da direção.',
  },
  {
    key: 'parceria',
    label: 'Parceria',
    summary: 'Propostas de parceria',
    title: 'Atendimento — Parceria',
    color: 0xd4af37,
    instructions: 'Envie o nome do projeto, link do servidor, número de membros e a proposta.',
  },
];

const FACTION_KEYS = ['rodo', 'prazeres', 'babilonia'];
const CORP_KEYS = ['pmerj', 'pcerj', 'bope'];
const LEADER_KEYS = [...FACTION_KEYS, ...CORP_KEYS];

const ROLES = [
  {
    key: 'fundador',
    name: 'Fundador',
    color: '#0F2A44',
    hoist: true,
    mentionable: false,
    perms: ['Administrator'],
  },
  {
    key: 'administrador',
    name: 'Administrador',
    color: '#1F3A5F',
    hoist: true,
    mentionable: false,
    perms: ['Administrator'],
  },
  {
    key: 'diretor_geral',
    name: 'Diretor Geral',
    color: '#123A5C',
    hoist: true,
    mentionable: false,
    perms: ['ManageGuild', 'ManageChannels', 'ManageRoles', 'KickMembers', 'ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog', 'ManageWebhooks'],
  },
  {
    key: 'diretor_operacoes',
    name: 'Diretor de Operações',
    color: '#1B4F72',
    hoist: true,
    mentionable: false,
    perms: ['ManageGuild', 'ManageChannels', 'ManageRoles', 'KickMembers', 'ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog'],
  },
  {
    key: 'diretor_tecnologia',
    name: 'Diretor de Tecnologia',
    color: '#21618C',
    hoist: true,
    mentionable: false,
    perms: ['ManageGuild', 'ManageChannels', 'ManageWebhooks', 'ManageMessages'],
  },
  {
    key: 'diretor_marketing',
    name: 'Diretor de Marketing',
    color: '#2874A6',
    hoist: true,
    mentionable: false,
    perms: ['ManageMessages'],
  },
  {
    key: 'gerente_geral',
    name: 'Gerente Geral',
    color: '#2E86C1',
    hoist: true,
    mentionable: false,
    perms: ['KickMembers', 'ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog'],
  },
  {
    key: 'supervisor',
    name: 'Supervisor',
    color: '#3498DB',
    hoist: true,
    mentionable: false,
    perms: ['ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog'],
  },
  {
    key: 'coordenador',
    name: 'Coordenador',
    color: '#5DADE2',
    hoist: true,
    mentionable: false,
    perms: ['ModerateMembers', 'ManageMessages', 'ManageThreads'],
  },
  {
    key: 'moderador',
    name: 'Moderador',
    color: '#2E5A88',
    hoist: true,
    mentionable: false,
    perms: ['KickMembers', 'ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog'],
  },
  {
    key: 'suporte',
    name: 'Suporte',
    color: '#3A7CA5',
    hoist: true,
    mentionable: true,
    perms: ['ManageMessages'],
  },
  {
    key: 'staff_rp',
    name: 'Staff de RP',
    color: '#4B6A88',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'auxiliar',
    name: 'Auxiliar',
    color: '#5D6D7E',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'estagiario',
    name: 'Estagiário',
    color: '#7F8C8D',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'pmerj',
    name: 'Comando PMERJ',
    color: '#1B4F72',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'pcerj',
    name: 'Comando PCERJ',
    color: '#154360',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'bope',
    name: 'Comando BOPE',
    color: '#111111',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'rodo',
    name: 'Líder do Rodo',
    color: '#922B21',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'prazeres',
    name: 'Líder dos Prazeres',
    color: '#7B241C',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'babilonia',
    name: 'Líder da Babilônia',
    color: '#A04000',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'asj',
    name: '✦ 𝔸𝕊𝕁 ✦',
    color: '#D4AF37',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'membro',
    name: 'Cidadão',
    color: '#808B96',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'booster',
    name: 'Booster',
    color: '#F47FFF',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'apoiador',
    name: 'Apoiador',
    color: '#D4AF37',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'criador',
    name: 'Criador de Conteúdo',
    color: '#E67E22',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'parceiro',
    name: 'Parceiro',
    color: '#616A6B',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'ping_anuncios',
    name: 'Ping Anúncios',
    color: '#95A5A6',
    hoist: false,
    mentionable: true,
    perms: [],
  },
  {
    key: 'ping_acoes',
    name: 'Ping Ações',
    color: '#95A5A6',
    hoist: false,
    mentionable: true,
    perms: [],
  },
  {
    key: 'advertido',
    name: 'Advertido',
    color: '#E67E22',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'mutado',
    name: 'Mutado',
    color: '#4F545C',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'banido',
    name: 'Banido',
    color: '#111111',
    hoist: false,
    mentionable: false,
    perms: [],
  },
];

const panel = (title, intro, sections = [], note, extra = {}) => ({ title, intro, sections, note, ...extra });
const sec = (label, lines) => ({ label, lines });
const orgPanel = (key, label, kind, file, description, accent) =>
  panel(label, `${kind} · ${description}`, [], 'Use **/assumir** para definir o líder e **/liberar** para deixar o time livre.', {
    accent,
    orgKey: key,
    image: `assets/orgs/${file}`,
    imageAlt: `${kind} ${label}`,
  });

const CATEGORIES = [
  {
    name: '「👋」CHEGADA',
    ref: 'cat-chegada',
    preset: 'readonly',
    channels: [
      {
        name: '👋・bem-vindo',
        ref: 'bem-vindo',
        preset: 'readonly',
        topic: 'Boas-vindas e primeiros passos',
        panel: panel(
          'Bem-vindo ao Assault',
          '**Assault RJ** é o baque carioca no Roblox. Aqui você constrói história, sobe na vida e vive a cidade — do asfalto ao morro, da delegacia ao baile.',
          [
            sec('Comece por aqui', [
              'Leia as {{regras}} e as {{rp-regras}} — valem para todo mundo.',
              'Escolha seus avisos em {{cargos}}.',
              'Entenda o jogo em {{como-jogar}}.',
              'Acompanhe novidades em {{anuncios}} e {{atualizacoes}}.',
            ]),
          ],
          'Ao permanecer no servidor, você concorda com as regras.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '🎭・cargos',
        ref: 'cargos',
        preset: 'readonly',
        topic: 'Escolha seus cargos de notificação',
        panel: panel(
          'Escolha seus cargos',
          'Clique nos botões abaixo para receber ou remover os avisos. Você pode mudar de ideia quando quiser.',
          [],
          'Pings são usados com moderação pela administração.',
          { kind: 'cargos', accent: COLORS.gold },
        ),
      },
    ],
  },
  {
    name: '「🏙️」TIMES',
    ref: 'cat-times',
    preset: 'public',
    channels: [
      {
        name: '📋・times',
        ref: 'times',
        preset: 'readonly',
        topic: 'Veja se cada favela ou corporação está livre ou assumida',
        panels: [
          orgPanel(
            'babilonia',
            'Babilônia',
            'Facção',
            'babilonia.png',
            'A favela mais temida da Zona Norte. Quem manda aqui, manda no morro.',
            COLORS.red,
          ),
          orgPanel(
            'prazeres',
            'Prazeres',
            'Facção',
            'prazeres.png',
            'Comunidade unida e muita história pra contar. Cada rua tem um dono.',
            COLORS.red,
          ),
          orgPanel(
            'rodo',
            'Rodo',
            'Facção',
            'rodo.png',
            'O complexo que nunca dorme. Movimento o dia inteiro.',
            COLORS.red,
          ),
          orgPanel(
            'pmerj',
            'PMERJ',
            'Corporação',
            'pmerj.png',
            '12º Batalhão. Disciplina, farda e ordem na cidade.',
            COLORS.blue,
          ),
          orgPanel(
            'pcerj',
            'PCERJ',
            'Corporação',
            'pcerj.png',
            '27ª Delegacia. Investigação e inteligência contra o crime.',
            COLORS.blue,
          ),
          orgPanel(
            'bope',
            'BOPE',
            'Corporação',
            'bope.png',
            'Tropa de elite. Entra onde ninguém mais entra.',
            COLORS.dark,
          ),
        ],
      },
      {
        name: '🏚️・rec-facção',
        ref: 'rec-faccao',
        preset: 'leaders',
        orgKeys: FACTION_KEYS,
        topic: 'Recrutamento das facções (só líderes publicam)',
        panel: panel(
          'Recrutamento — Facções',
          'Canal reservado às lideranças de **Rodo**, **Prazeres** e **Babilônia**. Só a liderança publica; todo mundo lê.',
          [
            sec('Modelo de anúncio', [
              '**Facção:**',
              '**Vagas:**',
              '**Requisitos:**',
              '**Como participar:** entre no servidor da facção citado no anúncio.',
              '**Responsável:**',
            ]),
          ],
          'Anúncios fora do modelo podem ser removidos. Candidaturas são tratadas no servidor de cada facção.',
          { accent: COLORS.red },
        ),
      },
      {
        name: '🚔・rec-corporação',
        ref: 'rec-corporacao',
        preset: 'leaders',
        orgKeys: CORP_KEYS,
        topic: 'Recrutamento das corporações (só comandos publicam)',
        panel: panel(
          'Recrutamento — Corporações',
          'Canal reservado aos comandos da **PMERJ**, **PCERJ** e **BOPE**. Só a liderança publica; todo mundo lê.',
          [
            sec('Modelo de anúncio', [
              '**Corporação:**',
              '**Vagas:**',
              '**Requisitos:**',
              '**Como participar:** entre no servidor da corporação citado no anúncio.',
              '**Responsável:**',
            ]),
          ],
          'Anúncios fora do modelo podem ser removidos. Candidaturas são tratadas no servidor de cada corporação.',
          { accent: COLORS.dark },
        ),
      },
    ],
  },
  {
    name: '「📌」INFORMAÇÕES',
    ref: 'cat-informacoes',
    preset: 'readonly',
    channels: [
      {
        name: '📜・regras',
        ref: 'regras',
        preset: 'readonly',
        topic: 'Regras do servidor',
        panel: panel(
          'Regras do Discord',
          'O convívio aqui é simples: respeito acima de tudo. Quebrar as regras gera punição, sem aviso prévio quando necessário.',
          [
            sec('Conduta', [
              'Respeite todos os membros e a equipe.',
              'Proibido racismo, homofobia, assédio, ameaças ou qualquer preconceito.',
              'Sem flood, spam ou divulgação não autorizada.',
              'Proibido compartilhar conteúdo impróprio, ilegal ou de terceiros sem permissão.',
              'Discussões políticas, religiosas e polêmicas ficam fora do servidor.',
            ]),
            sec('Canais e organização', [
              'Use cada canal para o seu propósito.',
              'Não marque a equipe sem necessidade — abra um atendimento em {{tickets}}.',
              'Denúncias somente com provas, em {{reportar-jogador}} ou via ticket.',
            ]),
            sec('Punições', [
              'Advertência, silenciamento, expulsão ou banimento, conforme a gravidade.',
              'Recursos são analisados pela direção via ticket.',
            ]),
          ],
          'A administração pode ajustar estas regras a qualquer momento.',
          { accent: COLORS.red },
        ),
      },
      {
        name: '🎲・regras-rp',
        ref: 'rp-regras',
        preset: 'readonly',
        topic: 'Regras de roleplay',
        panel: panel(
          'Regras de RP',
          'Roleplay é interpretação. O que acontece no jogo fica no jogo — e todo mundo veio para se divertir.',
          [
            sec('Sempre', [
              'Valorize o RP: ações têm consequência dentro da história.',
              'Proibido RDM (matar sem motivo) e VDM (atropelar sem motivo).',
              'Proibido Powergaming (forçar ações impossíveis) e Metagaming (usar informação de fora do jogo).',
              'Proibido Fail RP, Cop Bait e abuso de bugs.',
              'Respeite o limite dos outros jogadores — consentimento vale para cenas sensíveis.',
            ]),
            sec('Cenas e ações', [
              'Use {{procurar-cena}} para combinar cenas antes de começar.',
              'Grave provas: {{clipes}} ajuda a resolver conflitos.',
              'Ataques, operações e alianças precisam de justificativa e registro.',
            ]),
            sec('Facções e corporações', [
              'Cada organização tem hierarquia e regras próprias no servidor dela.',
              'Recrutamentos oficiais saem em {{rec-faccao}} e {{rec-corporacao}} — desconfie de qualquer outro lugar.',
              'A vida de um personagem tem peso: evite morrer e voltar como se nada tivesse acontecido.',
            ]),
          ],
          'Descumprir regras de RP pode gerar punição no jogo e no Discord.',
          { accent: COLORS.red },
        ),
      },
      {
        name: '🧭・como-jogar',
        ref: 'como-jogar',
        preset: 'readonly',
        topic: 'Guia para começar a jogar',
        panel: panel(
          'Como jogar',
          'Em poucos passos você entra na cidade. Leva menos de cinco minutos.',
          [
            sec('Passo a passo', [
              '1. Leia as {{regras}} e as {{rp-regras}} — é rápido e evita punição.',
              '2. Escolha seus avisos em {{cargos}}.',
              '3. Acompanhe {{status}} para saber quando a cidade abre.',
              '4. Entre no jogo pelo link divulgado nos anúncios.',
              '5. Use {{procurar-cena}} para encontrar RP com outros jogadores.',
            ]),
            sec('Dentro do jogo', [
              'Siga as regras de RP em todas as cenas.',
              'Socorros, abordagens e ações policiais precisam de motivo.',
              'Reporte problemas em {{reportar-jogador}} com provas.',
            ]),
          ],
          'Dúvidas? Abra um atendimento em {{tickets}}.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '🟢・status-servidor',
        ref: 'status',
        type: 'announcement',
        preset: 'readonly',
        topic: 'Estado da cidade: online, manutenção ou fechado',
        panel: panel(
          'Status do servidor',
          'Acompanhe aqui o estado da cidade. Cada atualização é publicada pela administração.',
          [
            sec('Situações', [
              '🟢 **Online** — cidade aberta e tudo funcionando.',
              '🟡 **Manutenção** — ajustes em andamento.',
              '🔴 **Fechado** — cidade fechada no momento.',
            ]),
          ],
          'Não pergunte sobre abertura em outros canais — a resposta sempre aparece aqui.',
          { accent: COLORS.green },
        ),
      },
    ],
  },
  {
    name: '「📢」ANÚNCIOS',
    ref: 'cat-anuncios',
    preset: 'readonly',
    channels: [
      {
        name: '📣・anuncios-gerais',
        ref: 'anuncios',
        preset: 'readonly',
        topic: 'Comunicados oficiais da administração',
        panel: panel(
          'Anúncios',
          'Comunicados oficiais da administração: eventos, mudanças e avisos importantes. Leia antes de perguntar.',
          [],
          'Marque @Ping Anúncios em {{cargos}} para receber os avisos.',
          { accent: COLORS.blue },
        ),
      },
      {
        name: '🔄・atualizações',
        ref: 'atualizacoes',
        type: 'announcement',
        preset: 'readonly',
        topic: 'Notas de atualização do jogo e do servidor',
        panel: panel(
          'Atualizações',
          'Notas de atualização do jogo e do servidor. Cada mudança é registrada aqui.',
          [],
          'Sugestões são bem-vindas em {{sugestoes}}.',
          { accent: COLORS.blue },
        ),
      },
      {
        name: '📊・enquetes',
        ref: 'enquetes',
        preset: 'readonly',
        topic: 'Enquetes oficiais da administração',
        panel: panel(
          'Enquetes',
          'A voz da comunidade decide. Enquetes oficiais sobre o futuro do servidor.',
          [],
          'Enquetes duram 48 horas. Votos são públicos.',
          { accent: COLORS.blue },
        ),
      },
    ],
  },
  {
    name: '「🎮」JOGO',
    ref: 'cat-jogo',
    preset: 'public',
    channels: [
      {
        name: '🎬・procurar-cena',
        ref: 'procurar-cena',
        preset: 'public',
        topic: 'Combine cenas de RP com outros jogadores',
        panel: panel(
          'Procurar cena',
          'Combine cenas com outros jogadores. Use o modelo e marque quem vai participar.',
          [
            sec('Modelo', [
              '**Cena:** assalto / abordagem / resgate / outro',
              '**Local:**',
              '**Horário:**',
              '**Participantes:**',
              '**Contexto:**',
            ]),
          ],
          'Cenas combinadas aqui não valem como prova — grave em {{clipes}}.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '🎞️・clipes',
        ref: 'clipes',
        preset: 'public',
        topic: 'Clipes, prints e provas de RP',
        panel: panel(
          'Clipes',
          'Poste clipes de RP, momentos marcantes e provas de ações. Vídeos e prints são bem-vindos.',
          [],
          'Provas de denúncia também podem ser enviadas via ticket em {{tickets}}.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '🚨・reportar-jogador',
        ref: 'reportar-jogador',
        preset: 'report',
        topic: 'Denúncias com provas (histórico restrito)',
        panel: panel(
          'Reportar jogador',
          'Denuncie com provas. Este canal é de leitura restrita — só a equipe e quem reporta veem o histórico.',
          [
            sec('Modelo', [
              '**Quem está sendo reportado:** (ID ou @ no jogo)',
              '**O que aconteceu:**',
              '**Quando:**',
              '**Provas:** (clipe/print)',
              '**Testemunhas:**',
            ]),
          ],
          'Denúncias falsas geram punição. Nunca exponha outros jogadores publicamente.',
          { accent: COLORS.red },
        ),
      },
    ],
  },
  {
    name: '「🆘」SUPORTE',
    ref: 'cat-suporte',
    preset: 'public',
    channels: [
      {
        name: '🎫・abrir-ticket',
        ref: 'tickets',
        preset: 'readonly',
        topic: 'Atendimento privado com a equipe',
        panel: panel(
          'Atendimento',
          'Precisa de ajuda? Escolha o setor abaixo e abra um atendimento privado com a equipe.',
          [],
          'Não abra tickets sem motivo. O abuso pode gerar punição.',
          { kind: 'tickets', accent: COLORS.blue },
        ),
      },
      {
        name: '📩・denuncias',
        ref: 'denuncias',
        preset: 'staff',
        topic: 'Denúncias recebidas (restrito à equipe)',
        panel: panel(
          'Denúncias',
          'Denúncias recebidas com provas. A equipe analisa e registra as decisões.',
          [],
          'Canal restrito à equipe.',
          { accent: COLORS.red },
        ),
      },
      {
        name: '⚖️・recursos',
        ref: 'recursos',
        preset: 'staff',
        topic: 'Pedidos de revisão de punição (restrito à equipe)',
        panel: panel(
          'Recursos',
          'Pedidos de revisão de punição. A direção decide, e a decisão é final.',
          [],
          'Canal restrito à equipe.',
          { accent: COLORS.orange },
        ),
      },
      {
        name: '🐛・reportar-bug',
        ref: 'bugs',
        preset: 'public',
        topic: 'Reporte bugs do jogo e do servidor',
        panel: panel(
          'Reportar bug',
          'Encontrou um bug? Descreva o problema com detalhes e anexe prints ou vídeos.',
          [sec('Modelo', ['**O que aconteceu:**', '**Como reproduzir:**', '**Onde:**', '**Provas:**'])],
          'Bugs explorados de propósito geram banimento.',
          { accent: COLORS.orange },
        ),
      },
      {
        name: '⭐・avaliar-staff',
        ref: 'avaliar-staff',
        preset: 'public',
        topic: 'Avalie o atendimento da equipe',
        panel: panel(
          'Avaliar equipe',
          'Sua opinião melhora o servidor. Avalie o atendimento da equipe com sinceridade e respeito.',
          [sec('Modelo', ['**Membro da equipe:**', '**Atendimento:** (nota de 1 a 5)', '**Comentário:**'])],
          'Avaliações são lidas pela direção.',
          { accent: COLORS.gold },
        ),
      },
    ],
  },
  {
    name: '「💬」COMUNIDADE',
    ref: 'cat-comunidade',
    preset: 'public',
    channels: [
      {
        name: '💬・geral',
        ref: 'geral',
        preset: 'public',
        topic: 'Conversa geral',
        panel: panel(
          'Geral',
          'O ponto de encontro da cidade. Converse, conheça a comunidade e mantenha o respeito.',
          [],
          'Assuntos de suporte ficam em {{tickets}}.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '😂・memes',
        ref: 'memes',
        preset: 'public',
        topic: 'Humor leve e sem preconceito',
        panel: panel(
          'Memes',
          'Humor leve, sem preconceito e sem spam. O melhor da zoeira carioca.',
          [],
          'Memes ofensivos ou com conteúdo impróprio são removidos.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '📸・midia',
        ref: 'midia',
        preset: 'public',
        topic: 'Clipes, prints e criação de conteúdo',
        panel: panel(
          'Mídia',
          'Clipes, prints e criações da comunidade. Mostre seu talento.',
          [],
          'Créditos aos autores. Conteúdo de terceiros precisa de permissão.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '💡・sugestoes',
        ref: 'sugestoes',
        preset: 'public',
        topic: 'Sugestões para o servidor (votação por reação)',
        panel: panel(
          'Sugestões',
          'Ideias para melhorar o Assault RJ. Toda sugestão é lida pela administração.',
          [
            sec('Como enviar', [
              'Explique a ideia em uma mensagem.',
              'Vote com 👍 ou 👎 nas sugestões dos outros.',
              'Detalhe o impacto e o motivo.',
            ]),
          ],
          'Sugestões repetidas podem ser mescladas.',
          { accent: COLORS.blue },
        ),
      },
      {
        name: '🤝・parcerias',
        ref: 'parcerias',
        preset: 'public',
        topic: 'Contato e divulgação de parcerias',
        panel: panel(
          'Parcerias',
          'Propostas de parceria e divulgação. Envie as informações e a equipe responde via ticket.',
          [sec('Modelo', ['**Projeto:**', '**Link do servidor:**', '**Membros:**', '**Proposta:**'])],
          'Divulgação sem autorização é proibida.',
          { accent: COLORS.gold },
        ),
      },
    ],
  },
  {
    name: '「🔊」VOZ',
    ref: 'cat-voz',
    preset: 'public',
    channels: [
      { name: '🔊・geral-1', type: 'voice' },
      { name: '🔊・geral-2', type: 'voice' },
      { name: '💤・afk', type: 'voice', ref: 'afk' },
    ],
  },
  {
    name: '「🛡️」STAFF',
    ref: 'cat-equipe',
    preset: 'staff',
    channels: [
      {
        name: '💭・chat-staff',
        preset: 'staff',
        topic: 'Comunicação interna da equipe',
        panel: panel(
          'Chat da equipe',
          'Comunicação interna. Alinhamentos rápidos, avisos e apoio entre a equipe.',
          [],
          'Assuntos sensíveis ficam em {{diretoria}}.',
          { accent: COLORS.dark },
        ),
      },
      {
        name: '📋・avisos-staff',
        preset: 'staff',
        topic: 'Avisos e alinhamentos internos',
        panel: panel(
          'Avisos da equipe',
          'Comunicados oficiais para a equipe: escalas, mudanças e diretrizes.',
          [],
          'Leia sempre antes de começar o turno.',
          { accent: COLORS.dark },
        ),
      },
      {
        name: '🪜・hierarquia-staff',
        ref: 'hierarquia',
        preset: 'staff',
        topic: 'Organograma e diretrizes da equipe',
        panel: panel(
          'Hierarquia da equipe',
          'Organograma e diretrizes. Cada área responde à direção, e a direção responde ao Fundador.',
          [
            sec('Direção', [
              '**Fundador** — visão geral e decisões finais.',
              '**Administrador** — administração total do servidor.',
              '**Diretor Geral** — coordena todas as áreas.',
              '**Diretor de Operações** — equipe, canais e rotina.',
              '**Diretor de Tecnologia** — bots, sistemas e segurança.',
              '**Diretor de Marketing** — divulgação e parcerias.',
            ]),
            sec('Gestão', [
              '**Gerente Geral** — cobra metas e organiza a equipe.',
              '**Supervisor** — acompanha moderadores e coordenadores.',
              '**Coordenador** — lidera a moderação no dia a dia.',
            ]),
            sec('Linha de frente', [
              '**Moderador** — ordem nos canais e punições.',
              '**Suporte** — atendimentos e tickets.',
              '**Staff de RP** — suporte no jogo e eventos.',
              '**Auxiliar** — apoio à equipe, em treinamento.',
              '**Estagiário** — período de teste, acompanhado de perto.',
            ]),
          ],
          'Dúvidas de carreira: fale com sua liderança direta.',
          { accent: COLORS.dark },
        ),
      },
      {
        name: '⚠️・registro-punicoes',
        ref: 'registro',
        preset: 'staff',
        topic: 'Registro de punições aplicadas',
        panel: panel(
          'Registro de punições',
          'Histórico de advertências, silenciamentos e banimentos aplicados pela equipe.',
          [],
          'Toda punição deve ser registrada com motivo e provas.',
          { accent: COLORS.red },
        ),
      },
      {
        name: '🤖・logs-automod',
        ref: 'automod-logs',
        preset: 'staff',
        topic: 'Alertas de moderação automática',
        panel: panel(
          'Logs do AutoMod',
          'Alertas automáticos de spam, palavras ofensivas, menções em massa e convites.',
          [],
          'Canal restrito à equipe.',
          { accent: COLORS.red },
        ),
      },
      {
        name: '🧾・logs-tickets',
        ref: 'ticket-logs',
        preset: 'staff',
        topic: 'Transcripts de tickets encerrados',
        panel: panel(
          'Logs de tickets',
          'Transcripts e registros de atendimentos encerrados.',
          [],
          'Consultas e auditorias usam este histórico.',
          { accent: COLORS.blue },
        ),
      },
      {
        name: '🏛️・diretoria',
        ref: 'diretoria',
        preset: 'staff-high',
        topic: 'Discussões restritas à direção',
        panel: panel(
          'Diretoria',
          'Discussões restritas à direção: estratégia, contratações e casos sensíveis.',
          [],
          'Somente Fundador, Administrador e Diretores.',
          { accent: COLORS.red },
        ),
      },
      { name: '🔒・sala-staff', type: 'voice', preset: 'staff' },
    ],
  },
  {
    name: '「🎫」TICKETS',
    ref: 'cat-tickets',
    preset: 'staff',
    channels: [],
  },
];

const CHANNEL_REFS = {};
const CATEGORY_REFS = {};
for (const category of CATEGORIES) {
  if (category.ref) CATEGORY_REFS[category.ref] = category.name;
  for (const channel of category.channels) {
    if (channel.ref) CHANNEL_REFS[channel.ref] = channel.name;
  }
}

const channelName = (ref) => CHANNEL_REFS[ref] ?? ref;

const LEGACY_CATEGORIES = {};
const LEGACY_CHANNELS = {
  '📜・regras': ['regras'],
  '📣・anuncios-gerais': ['anuncios-gerais'],
};
const LEGACY_ROLES = {};

module.exports = {
  GUILD_ID,
  SERVIDOR,
  NAME,
  DESCRIPTION,
  LAYOUT,
  ACCENT,
  COLORS,
  LINKS,
  MENU_ROLE_KEYS,
  AUTO_ROLE_KEY,
  TICKETS,
  ROLES,
  CATEGORIES,
  STAFF_KEYS,
  STAFF_SENIOR_KEYS,
  LEADER_KEYS,
  TICKET_JUNIOR_KEYS,
  CHANNEL_REFS,
  CATEGORY_REFS,
  channelName,
  LEGACY_CATEGORIES,
  LEGACY_CHANNELS,
  LEGACY_ROLES,
};
