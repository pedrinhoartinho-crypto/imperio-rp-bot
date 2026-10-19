# Império RP — Bot de Configuração e Gestão

Bot em `discord.js` que entrega o servidor pronto no padrão dos grandes RPs: estrutura completa, cargos com hierarquia e permissões, AutoMod, tickets por setor com transcript, bate-ponto persistente, registro de ausências, comandos slash e menus de cargo. Tudo idempotente — rodar de novo nunca duplica.

Facções e corporações operam em servidores próprios, com hierarquia interna. Aqui ficam os canais de recrutamento (facção e corporação), o registro de ações da cidade e os cargos de representação (Líder/Sub-Líder) para identificar lideranças.

## Estrutura criada

### Cargos (de cima para baixo)

| Cargo | Função |
| --- | --- |
| Dono | Proprietários do projeto (os donos usam o mesmo cargo, sem limite de pessoas) |
| Diretor Geral | Administração total |
| Diretor de Operações | Operação, gestão de equipe e canais |
| Diretor de Tecnologia | Tecnologia, bots e sistemas |
| Diretor de Marketing | Marketing e crescimento |
| Diretor de Design | Design e identidade visual |
| Gerente Geral | Coordenação geral da equipe |
| Gerente de Moderação | Liderança da moderação |
| Gerente de Suporte | Liderança do atendimento |
| Supervisor | Acompanhamento da linha de frente |
| Administrador | Punições completas |
| Moderador | Kick, mute, gerenciamento de mensagens |
| Suporte | Atendimento e tickets (mentionável) |
| Recrutador | Seleção de novos membros da equipe |
| Estagiário | Período de avaliação interna |
| Staff de Jogo | Atuação no servidor Roblox (mentionável) |
| Equipe Staff | Tag base de todos os membros da equipe (mentionável) |
| Equipe Império | Frente geral de staff |
| Equipe de Desenvolvimento / Eventos / Design / Marketing | Frentes especializadas |
| Booster | Quem impulsiona o servidor |
| Apoiador | Apoiadores do projeto |
| Criador de Conteúdo | Divulgação de vídeos e lives |
| Parceiro | Servidores e projetos parceiros |
| Líder / Sub-Líder de Facção | Representação de liderança de facção |
| Líder / Sub-Líder de Organização | Representação de liderança de organização |
| Cidadão | Cargo base da comunidade (autorole automático) |
| Ping Anúncios / Ping Ações | Notificações (obtidos por botão) |
| Advertido / Mutado | Punições |

### Canais

Nomes limpos, em minúsculas com hífen (padrão de RP profissional), e categorias com nome normal. Os canais de aviso usam o **tipo Anúncio** do Discord — por isso aparecem com o ícone de megafone na lista:

- **Informações** (só a equipe escreve) — boas-vindas, sobre-o-servidor, status-servidor (anúncio)
- **Avisos** (só a equipe escreve) — anuncios-gerais, atualizações (anúncio), spoilers, enquetes
- **Regras** (só a equipe escreve) — regras, regras-roleplay
- **Comunidade** — geral, mídia, sugestões, parcerias, cargos
- **Facções e Corporações** — recrutamento-facção e recrutamento-corporação (só líderes e sub-líderes publicam), avisos-ações
- **Suporte** — ajuda, abrir-ticket, denúncias (equipe), corregedoria (direção), recursos (equipe), reportar-bugs, avaliar-staff
- **Candidaturas** — seja-staff (frentes de trabalho), solicitar-tag (tags de criador)
- **Equipe** — chat-staff, avisos-staff, hierarquia-staff, bate-ponto, ausências, registro-punições, logs-automod, logs-tickets, diretoria (só direção), sala-staff
- **Tickets** — categoria privada onde os atendimentos são criados automaticamente
- **Canais de voz** — geral, roleplay-1, roleplay-2, eventos (palco), afk

## Recursos em operação

### Tickets profissionais por setor
Em #abrir-ticket, o membro escolhe entre **Suporte**, **Denúncia**, **Recurso**, **Parceria** e **Liderança**. O bot cria um canal privado na categoria Tickets (visível para o autor e a equipe), marca o Suporte e mostra as instruções do setor escolhido.

- **Assumir atendimento:** qualquer membro da equipe pode assumir; o botão mostra quem está atendendo.
- **Fechar ticket:** disponível para o autor e para a equipe. O bot gera um **transcript completo (.txt)** em #logs-tickets antes de apagar o canal.
- Um membro só pode ter um atendimento aberto por vez.

### Bate-ponto com persistência
Em #bate-ponto, a equipe registra entrada e saída por botão. O bot salva os horários em `data/bateponto.json`, confirma o horário real e acumula o tempo total de cada membro. Não é possível registrar duas entradas ou uma saída sem entrada.

### Registro de ausências
Em #ausencias, o membro da equipe clica em "Registrar ausência" e preenche um formulário (início, retorno previsto e motivo). O bot publica o registro no canal.

### Comandos slash
| Comando | Efeito |
| --- | --- |
| `/anunciar` | Publica um anúncio em #anuncios-gerais, com opção de marcar Ping Anúncios |
| `/enquete` | Cria uma enquete nativa em #enquetes (opções separadas por `;`) |
| `/advertir` | Aplica o cargo Advertido, avisa o membro por DM e registra em #registro-punicoes |

Todos restritos à equipe.

### Sugestões com votação automática
Toda mensagem em #sugestoes recebe automaticamente os votos 👍 e 👎 do bot.

### Boas-vindas automáticas
Quem entra no servidor recebe o cargo Cidadão automaticamente (autorole) e uma mensagem de boas-vindas no canal #boas-vindas, com menção, avatar do membro e o passo a passo inicial (regras, cargos e atendimento). Quem já estava no servidor também recebe o cargo na próxima inicialização. Requer a Server Members Intent ligada no portal do bot.

### Painel em todos os canais
Nenhum canal fica vazio: cada canal recebe uma mensagem explicativa própria (objetivo, regras, modelos de postagem e canais relacionados), no estilo limpo — título em negrito, sem enfeites, com o nome real do servidor (renomeou o servidor? os painéis se atualizam no próximo reinício) e rodapé `Painel oficial`. Ao reexecutar o setup, painéis faltantes são publicados de novo e painéis de versões antigas são atualizados no lugar — sem duplicar nada.

### AutoMod
- Anti-spam
- Palavras ofensivas (slurs)
- Menções em massa (6 ou mais)
- Convites e links de outros servidores (liberado em #parcerias)

Alertas caem em #logs-automod. Todos os cargos da equipe são isentos.

### Ajustes do servidor
- Idioma pt-BR, verificação Baixa, filtro de conteúdo explícito para todos e notificações apenas de menções
- Comunidade ativada pelo bot, com #regras como canal de regras e #anuncios-gerais como canal de atualizações
- AFK em #afk após 5 minutos

### Menus e organização
- #cargos com botões para Ping Anúncios e Ping Ações
- #hierarquia-staff com organograma (direção, gestão, linha de frente e equipes)
- #registro-punições para registro de toda punição aplicada
- #diretoria restrita à direção

## Instalação

Requisitos: Node.js 18+ e um servidor Discord (recomendado começar vazio).

### 1. Criar o bot

1. Acesse <https://discord.com/developers/applications> e clique em **New Application**;
2. Vá em **Bot** → **Reset Token** e copie o token;
3. Para o **autorole** (cargo automático de Cidadão ao entrar): em **Bot** → **Privileged Gateway Intents**, ligue **Server Members Intent** → **Save**. Sem isso o bot funciona normalmente, só não aplica o autorole nem as boas-vindas (ele avisa no console).

### 2. Convidar o bot

Monte o link trocando `SEU_CLIENT_ID` pelo ID da aplicação (aba **General Information**):

```
https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&scope=bot%20applications.commands&permissions=271674480
```

As permissões cobrem cargos, canais, mensagens, histórico, voz e gerenciamento do servidor (AutoMod, tickets e comandos). Se preferir, marque **Administrador** no gerador de convite.

### 3. Configurar

1. Renomeie `.env.example` para `.env` e preencha:

```
DISCORD_TOKEN=seu_token
GUILD_ID=id_do_servidor
```

> Para pegar o ID: Discord → Configurações → Avançado → **Modo Desenvolvedor**; clique com o botão direito no servidor → **Copiar ID do Servidor**.

2. Personalize em `src/config.js`: `SERVIDOR`, `LINKS`, cargos, canais, setores de ticket e o menu de cargos.

### 4. Executar

```bash
npm install

npm run setup   # monta a estrutura e sai (execução única)

npm start       # monta, registra os comandos e mantém o bot online
```

## Deploy grátis no Render (24/7)

O Render free roda o bot 24/7 usando o keep-alive embutido: o bot abre um servidor HTTP e faz auto-ping a cada 10 minutos (via `RENDER_EXTERNAL_URL`), driblando o spin-down de 15 minutos do plano Free. O `render.yaml` já está pronto na raiz.

### 1. Subir o código para o GitHub
Crie um repositório no GitHub e envie o projeto. `node_modules`, `.env` e `data` ficam fora pelo `.gitignore`.

### 2. Criar o serviço no Render
1. Crie a conta em <https://render.com> entrando com o GitHub;
2. **New +** → **Blueprint** → selecione o repositório;
3. O Render lê o `render.yaml`; preencha `DISCORD_TOKEN` e `GUILD_ID` quando pedir;
4. **Apply** e acompanhe os Logs até aparecer `[ok] Bot online`.

### Observações
- **Horas grátis:** o plano Free dá 750 horas/mês por conta — um bot 24/7 usa ~730, então não rode outra aplicação grátis junto.
- **Dados do bate-ponto:** o disco do Render é temporário; o `data/bateponto.json` pode zerar quando o serviço reiniciar ou for atualizado.
- **Atualizações:** cada `git push` faz o Render publicar a versão nova sozinho.
- **Sem cron externo:** o auto-ping é embutido, não precisa de site de monitoramento.

## Operação

- **Tickets, botões e comandos:** funcionam enquanto o bot estiver online (`npm start`).
- **Punições:** aplique o cargo Mutado (bloqueia escrita, reação e fala) e registre em #registro-punicoes ou use `/advertir`.
- **Cargo do bot:** mantenha-o no topo da hierarquia do servidor.
- **Palco:** o canal Eventos (palco) é criado automaticamente quando o bot ativa a Comunidade.
- **Dados:** o bate-ponto fica em `data/bateponto.json` (fora do controle de versão).
- **Reexecução:** rodar `npm run setup` de novo completa o que faltar sem duplicar e republica painéis de canal que estiverem faltando.
- **Atualização de versões antigas:** canais e categorias de versões anteriores (sem emoji ou com nomes antigos) são renomeados e movidos automaticamente para a estrutura nova, e os painéis antigos são atualizados no lugar — sem duplicar nada.
- **Autorole e boas-vindas:** todo membro que entra recebe o cargo Cidadão e uma mensagem de boas-vindas em #boas-vindas (requer Server Members Intent ligada no portal, veja a Instalação).

## Personalização rápida

| Onde | O que muda |
| --- | --- |
| `SERVIDOR` | Nome reserva (os embeds usam o nome real do servidor automaticamente) |
| `LINKS` | Link do jogo, grupo e Trello |
| `MENU_ROLE_KEYS` | Cargos com botão em #cargos |
| `TICKETS` | Setores de atendimento, cores e instruções |
| `ROLES` | Nome, cor, hierarquia, menção e permissões |
| `CATEGORIES` | Categorias, canais, tópicos e presets de permissão |
| `STAFF_KEYS` / `STAFF_SENIOR_KEYS` | Quem é equipe e quem é direção |

## Arquitetura

```
src/
  config.js      dados: cargos, canais, setores de ticket e listas de equipe
  store.js       persistência local (bate-ponto)
  embeds.js      embeds e menus de botão
  setup.js       criação de cargos, canais, ajustes e AutoMod
  components.js  interações: cargos, tickets, bate-ponto, ausências e sugestões
  commands.js    comandos slash (/anunciar, /enquete, /advertir)
  index.js       conexão e orquestração
```

## Solução de problemas

- **Faltou permissão:** o log indica a etapa que falhou; ajuste o cargo do bot e rode `npm run setup` novamente.
- **Botões, tickets ou comandos não respondem:** o bot precisa estar online (`npm start`), não apenas a estrutura pronta (`npm run setup`).
- **Comandos não aparecem:** eles são registrados ao iniciar com `npm start`; aguarde alguns segundos e recarregue o Discord.
- **Algo não foi criado:** o motivo aparece no terminal (ex.: palco sem Comunidade, AutoMod sem permissão).
