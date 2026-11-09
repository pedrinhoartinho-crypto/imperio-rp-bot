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
  'sub_fundador',
  'administrador',
  'chefe_diretoria',
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
  'sub_fundador',
  'administrador',
  'chefe_diretoria',
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
  {
    key: 'loja',
    label: 'Loja',
    summary: 'Compras e produtos oficiais',
    title: 'Atendimento — Loja',
    color: 0xd4af37,
    staffKey: 'vendedor',
    categoryKey: 'cat-tickets-loja',
    instructions:
      'Informe o produto ou serviço que você quer comprar, seu personagem e a forma de pagamento combinada. A equipe confirma estoque e entrega.',
  },
];

const FACTION_KEYS = ['rodo', 'prazeres', 'babilonia'];
const CORP_KEYS = ['pmerj', 'pcerj', 'bope'];
const LEADER_KEYS = [...FACTION_KEYS, ...CORP_KEYS];

const ROLES = [
  {
    key: 'fundador',
    name: 'Fundador',
    color: '#F39C12',
    hoist: true,
    mentionable: false,
    perms: ['Administrator'],
  },
  {
    key: 'sub_fundador',
    name: 'Sub Fundador',
    color: '#B71C1C',
    hoist: true,
    mentionable: false,
    perms: ['Administrator'],
  },
  {
    key: 'administrador',
    name: 'Administrador',
    color: '#E74C3C',
    hoist: true,
    mentionable: false,
    perms: ['Administrator'],
  },
  {
    key: 'chefe_diretoria',
    name: 'Chefe de Diretoria',
    color: '#8E44AD',
    hoist: true,
    mentionable: false,
    perms: ['ManageGuild', 'ManageChannels', 'ManageRoles', 'KickMembers', 'ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog'],
  },
  {
    key: 'diretor_geral',
    name: 'Diretor Geral',
    color: '#FF8C00',
    hoist: true,
    mentionable: false,
    perms: ['ManageGuild', 'ManageChannels', 'ManageRoles', 'KickMembers', 'ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog', 'ManageWebhooks'],
  },
  {
    key: 'diretor_operacoes',
    name: 'Diretor de Operações',
    color: '#F1C40F',
    hoist: true,
    mentionable: false,
    perms: ['ManageGuild', 'ManageChannels', 'ManageRoles', 'KickMembers', 'ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog'],
  },
  {
    key: 'diretor_tecnologia',
    name: 'Diretor de Tecnologia',
    color: '#1ABC9C',
    hoist: true,
    mentionable: false,
    perms: ['ManageGuild', 'ManageChannels', 'ManageWebhooks', 'ManageMessages'],
  },
  {
    key: 'diretor_marketing',
    name: 'Diretor de Marketing',
    color: '#F06292',
    hoist: true,
    mentionable: false,
    perms: ['ManageMessages'],
  },
  {
    key: 'gerente_geral',
    name: 'Gerente Geral',
    color: '#BA68C8',
    hoist: true,
    mentionable: false,
    perms: ['KickMembers', 'ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog'],
  },
  {
    key: 'supervisor',
    name: 'Supervisor',
    color: '#9575CD',
    hoist: true,
    mentionable: false,
    perms: ['ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog'],
  },
  {
    key: 'coordenador',
    name: 'Coordenador',
    color: '#7986CB',
    hoist: true,
    mentionable: false,
    perms: ['ModerateMembers', 'ManageMessages', 'ManageThreads'],
  },
  {
    key: 'moderador',
    name: 'Moderador',
    color: '#4CAF50',
    hoist: true,
    mentionable: false,
    perms: ['KickMembers', 'ModerateMembers', 'ManageMessages', 'ManageThreads', 'ViewAuditLog'],
  },
  {
    key: 'suporte',
    name: 'Suporte',
    color: '#00BCD4',
    hoist: true,
    mentionable: true,
    perms: ['ManageMessages'],
  },
  {
    key: 'staff_rp',
    name: 'Staff de RP',
    color: '#8BC34A',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'auxiliar',
    name: 'Auxiliar',
    color: '#FFC107',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'estagiario',
    name: 'Estagiário',
    color: '#BDC3C7',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'vendedor',
    name: 'Vendedor',
    color: '#1ABC9C',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'pmerj',
    name: 'Comando PMERJ',
    color: '#2196F3',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'pcerj',
    name: 'Comando PCERJ',
    color: '#E040FB',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'bope',
    name: 'Comando BOPE',
    color: '#00E676',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'rodo',
    name: 'Líder do Rodo',
    color: '#FF5722',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'prazeres',
    name: 'Líder dos Prazeres',
    color: '#FF4081',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'babilonia',
    name: 'Líder da Babilônia',
    color: '#FF9800',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'asj',
    name: '𝔸𝕊𝕁',
    color: '#FFD700',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'membro',
    name: 'Cidadão',
    color: '#AAB7B8',
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
    color: '#FFB300',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'criador',
    name: 'Influencer',
    color: '#FF7043',
    hoist: true,
    mentionable: false,
    perms: [],
  },
  {
    key: 'parceiro',
    name: 'Parceiro',
    color: '#26C6DA',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'ping_anuncios',
    name: 'Ping Anúncios',
    color: '#42A5F5',
    hoist: false,
    mentionable: true,
    perms: [],
  },
  {
    key: 'ping_acoes',
    name: 'Ping Ações',
    color: '#536DFE',
    hoist: false,
    mentionable: true,
    perms: [],
  },
  {
    key: 'advertido',
    name: 'Advertido',
    color: '#FFA726',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'mutado',
    name: 'Mutado',
    color: '#90A4AE',
    hoist: false,
    mentionable: false,
    perms: [],
  },
  {
    key: 'banido',
    name: 'Banido',
    color: '#EF5350',
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
        name: '📥・entrou',
        ref: 'entrou',
        preset: 'readonly',
        topic: 'Registro de entradas no servidor',
        panel: panel(
          'Entradas',
          'Cada novo membro aparece aqui. Dê as boas-vindas e ajude a cidade a crescer.',
          [],
          'Registro automático do servidor.',
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
        name: '🎁・sorteios',
        ref: 'sorteios',
        preset: 'readonly',
        topic: 'Sorteios oficiais do servidor',
        panel: panel(
          'Sorteios',
          'Sorteios oficiais da cidade: prêmios, cargos e experiências. Participe e fique de olho nas regras.',
          [
            sec('Como participar', [
              'Leia o sorteio na hora e siga os requisitos.',
              'Uma participação por pessoa, salvo indicação contrária.',
              'O resultado sai aqui e no anúncio do vencedor.',
            ]),
          ],
          'Sorteios falsos ou fora deste canal não são válidos.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '🚀・seja-booster',
        ref: 'booster',
        preset: 'readonly',
        topic: 'Apoie o servidor e receba benefícios',
        panel: panel(
          'Seja Booster',
          'Impulsione o Assault RJ e ajude a cidade a crescer. Booster tem reconhecimento e vantagens na comunidade.',
          [
            sec('Benefícios', [
              'Cargo **Booster** exclusivo e destaque no servidor.',
              'Prioridade em eventos e sorteios especiais.',
              'Acesso antecipado a novidades e bastidores.',
            ]),
            sec('Como ajudar', [
              'Use o impulso do Nitro no ícone do servidor.',
              'Fale com a equipe em {{tickets}} para dúvidas.',
            ]),
          ],
          'Obrigado por manter a cidade no ar.',
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
        name: '🎉・eventos',
        ref: 'eventos',
        preset: 'public',
        topic: 'Eventos e ações especiais da cidade',
        panel: panel(
          'Eventos',
          'A cidade nunca para. Acompanhe eventos, operações e ações especiais da equipe e da comunidade.',
          [
            sec('O que rola aqui', [
              'Eventos oficiais com data, local e regras.',
              'Operações de facções e corporações.',
              'Ações da comunidade e corridas valendo prêmio.',
            ]),
          ],
          'Eventos oficiais são anunciados pela equipe. Combine os informais em {{procurar-cena}}.',
          { accent: COLORS.orange },
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
        name: '📰・jornal',
        ref: 'jornal',
        preset: 'public',
        topic: 'Notícias, bastidores e novidades da cidade',
        panel: panel(
          'Jornal da Cidade',
          'Notícias, bastidores e histórias do Assault RJ. A equipe publica as pautas principais; a comunidade participa com ideias.',
          [
            sec('Pautas', [
              'Novidades do jogo e do servidor.',
              'Entrevistas e histórias de personagens.',
              'Cobertura de eventos e operações.',
            ]),
          ],
          'Sugestões de pauta em {{sugestoes}}.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '🎬・shorts',
        ref: 'shorts',
        preset: 'public',
        topic: 'Vídeos curtos e momentos rápidos da comunidade',
        panel: panel(
          'Shorts',
          'Momentos rápidos, edits e cortes da cidade. Vídeos curtos, sem spam e com crédito aos autores.',
          [],
          'Vídeos longos e clipes maiores ficam em {{clipes}}.',
          { accent: COLORS.orange },
        ),
      },
      {
        name: '💻・comandos',
        ref: 'comandos',
        preset: 'readonly',
        topic: 'Guia de comandos e atalhos do servidor',
        panel: panel(
          'Comandos',
          'Guia rápido dos comandos oficiais e atalhos da cidade.',
          [
            sec('Atendimento', [
              '`/assumir organizacao: <nome> lider: @membro` — assume uma organização.',
              '`/liberar organizacao: <nome>` — libera uma organização.',
            ]),
            sec('Comunicação', [
              '`/anunciar` — publica um anúncio oficial.',
              '`/enquete` — cria uma enquete.',
              '`/advertir` — registra uma advertência.',
            ]),
            sec('Ajuda', [
              'Abra um atendimento em {{tickets}} para suporte.',
            ]),
          ],
          'Comandos de organização são exclusivos da liderança e da equipe.',
          { accent: COLORS.blue },
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
    name: '「🛍️」LOJA',
    ref: 'cat-loja',
    preset: 'public',
    channels: [
      {
        name: '🛍️・loja',
        ref: 'loja',
        preset: 'readonly',
        topic: 'Loja oficial do Assault RJ',
        panel: panel(
          'Loja Oficial',
          'Produtos, serviços e vantagens oficiais da cidade. Compre com segurança e receba direto da equipe.',
          [
            sec('Como comprar', [
              'Escolha o produto e clique no botão de atendimento.',
              'Informe seu personagem, o item e a forma de pagamento.',
              'A equipe confirma estoque, valor e entrega pelo ticket.',
            ]),
            sec('Formas de pagamento', [
              'Dinheiro do jogo, Robux ou Pix — sempre combinado no ticket.',
              'Nunca envie valores fora do atendimento oficial.',
            ]),
            sec('Entrega', [
              'Itens digitais são entregues no jogo ou no Discord.',
              'Produtos personalizados têm prazo combinado com a equipe.',
            ]),
          ],
          'A loja oficial não se responsabiliza por negociações feitas fora do ticket.',
          {
            accent: COLORS.gold,
            button: { id: 'ticket:abrir:loja', label: 'Abrir atendimento de compra', style: 3, emoji: '🛍️' },
          },
        ),
      },
      {
        name: '🛒・olx-vendas',
        ref: 'olx-vendas',
        preset: 'public',
        topic: 'Anúncios de compra, venda e troca entre jogadores',
        panel: panel(
          'OLX da Cidade',
          'Compra, venda e troca entre jogadores. Negocie com respeito e cuidado.',
          [
            sec('Modelo de anúncio', [
              '**Produto/serviço:**',
              '**Preço:**',
              '**Contato:**',
              '**Observações:**',
            ]),
          ],
          'Não envie dinheiro real. A equipe não se responsabiliza por negociações entre jogadores.',
          { accent: COLORS.green },
        ),
      },
      {
        name: '⭐・avaliacoes-loja',
        ref: 'loja-avaliacoes',
        preset: 'public',
        topic: 'Avaliações da loja oficial',
        panel: panel(
          'Avaliações da Loja',
          'Comprou na loja? Deixe sua avaliação e ajude a melhorar o atendimento.',
          [
            sec('Modelo', [
              '**Produto:**',
              '**Atendimento:** (nota de 1 a 5)',
              '**Comentário:**',
            ]),
          ],
          'Avaliações ofensivas ou falsas são removidas.',
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
        name: '⌛・aguardando',
        ref: 'fila-tickets',
        preset: 'staff',
        topic: 'Fila de atendimentos abertos',
        panel: panel(
          'Aguardando atendimento',
          'Cada atendimento novo da cidade cai aqui automaticamente com o setor e o solicitante.',
          [
            sec('Como usar', [
              'Leia o card e clique em **Puxar atendimento**.',
              'O card sai da fila e entra em 🎫・atendimento com o seu nome.',
              'O atendimento acontece no canal do ticket, só fecha por lá.',
            ]),
          ],
          'Quem puxar é responsável pelo atendimento até o fechamento.',
          { accent: COLORS.gold },
        ),
      },
      {
        name: '🎫・atendimento',
        ref: 'atendendo-tickets',
        preset: 'staff',
        topic: 'Atendimentos em andamento',
        panel: panel(
          'Atendimento em andamento',
          'Aqui ficam os cards dos tickets que já foram assumidos, com o responsável marcado.',
          [
            sec('Boas práticas', [
              'Responda o solicitante no canal do ticket.',
              'Ao concluir, feche o ticket e preencha o relatório.',
            ]),
          ],
          'O histórico dos atendimentos fica em 📊・relatorios-tickets.',
          { accent: COLORS.blue },
        ),
      },
      { name: '🔊・atendendo-1', type: 'voice', preset: 'staff-call' },
      { name: '🔊・atendendo-2', type: 'voice', preset: 'staff-call' },
      {
        name: '🕒・bate-ponto',
        ref: 'ponto',
        preset: 'staff',
        topic: 'Registro de entrada, saída e ausências da equipe',
        panel: panel(
          'Bate-ponto da equipe',
          'Registre seu turno e mantenha a escala transparente. Entrada e saída ficam salvas por membro.',
          [
            sec('Como funciona', [
              'Clique em **Bater entrada** ao começar o serviço.',
              'Clique em **Bater saída** ao encerrar o turno.',
              'Use **Meu relatório** para ver o total acumulado.',
              'Registre ausências com antecedência pelo botão **Ausência**.',
            ]),
          ],
          'O ponto é exclusivo da equipe. Turnos abertos contam até a saída.',
          { kind: 'ponto', accent: COLORS.gold },
        ),
      },
      {
        name: '📈・ponto-geral',
        ref: 'ponto-geral',
        preset: 'staff-high',
        topic: 'Monitor da escala e das horas da equipe',
        panel: panel(
          'Ponto geral',
          'Monitor em tempo real da escala da equipe. Quem está de plantão, quem já saiu e o total de horas de cada membro.',
          [
            sec('Como ler', [
              '🟢 **Em serviço** — está de plantão agora, com o horário da entrada.',
              '⚪ **Fora de serviço** — encerrou o turno atual.',
              '**Total** — horas acumuladas desde o início.',
            ]),
          ],
          'Atualiza sozinho a cada entrada, saída ou ausência registrada.',
          { accent: COLORS.green },
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
              '**Sub Fundador** — apoio direto à fundação e continuidade.',
              '**Administrador** — administração total do servidor.',
              '**Chefe de Diretoria** — comanda a diretoria e os projetos.',
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
        name: '📊・relatorios-tickets',
        ref: 'ticket-reports',
        preset: 'staff',
        topic: 'Relatórios dos tickets assumidos pela equipe',
        panel: panel(
          'Relatórios de tickets',
          'Cada atendimento assumido vira um registro aqui: quem atendeu, qual setor, o resumo e a resolução.',
          [
            sec('O que fica registrado', [
              'Quem assumiu o atendimento e quem solicitou.',
              'Setor, resumo do atendimento e resolução.',
              'Ticket de origem e horário do registro.',
            ]),
          ],
          'Ao fechar um ticket, a equipe preenche o relatório antes da exclusão do canal.',
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
    name: '「📊」LOGS',
    ref: 'cat-logs',
    preset: 'logs',
    channels: [
      {
        name: '🚨・logs-anticheat',
        ref: 'logs-anticheat',
        preset: 'logs',
        topic: 'Flags e punições do anticheat',
      },
      {
        name: '🚗・logs-veiculos',
        ref: 'logs-veiculos',
        preset: 'logs',
        topic: 'Ocorrências e flags de veículos',
      },
      {
        name: '🔫・logs-armas',
        ref: 'logs-armas',
        preset: 'logs',
        topic: 'Roubo, clone e confisco de armas',
      },
      {
        name: '🛠️・logs-fabricacao',
        ref: 'logs-fabricacao',
        preset: 'logs',
        topic: 'Itens fabricados e materiais gastos',
      },
      {
        name: '📦・logs-drops',
        ref: 'logs-drops',
        preset: 'logs',
        topic: 'Armas e itens dropados no chão',
      },
      {
        name: '🔄・logs-transferencias',
        ref: 'logs-transferencias',
        preset: 'logs',
        topic: 'Transferências, confisco e movimentação de itens',
      },
      {
        name: '💀・logs-mortes',
        ref: 'logs-mortes',
        preset: 'logs',
        topic: 'Mortes, kills e autores',
      },
      {
        name: '⌨️・logs-comandos',
        ref: 'logs-comandos',
        preset: 'logs',
        topic: 'Comandos executados pela equipe',
      },
      {
        name: '💰・logs-economia',
        ref: 'logs-economia',
        preset: 'logs',
        topic: 'Compras, vendas e movimentações de dinheiro',
      },
      {
        name: '📥・logs-entradas',
        ref: 'logs-entradas',
        preset: 'logs',
        topic: 'Entradas e saídas de jogadores',
      },
      {
        name: '🧩・logs-sistema',
        ref: 'logs-sistema',
        preset: 'logs',
        topic: 'Inicialização, erros e avisos do logger',
      },
    ],
  },
  {
    name: '「🎫」TICKETS',
    ref: 'cat-tickets',
    preset: 'staff',
    channels: [],
  },
  {
    name: '「🛍️」TICKETS-LOJA',
    ref: 'cat-tickets-loja',
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
const LEGACY_ROLES = {
  '𝔸𝕊𝕁': ['✦ 𝔸𝕊𝕁 ✦'],
  Influencer: ['Criador de Conteúdo'],
};

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
