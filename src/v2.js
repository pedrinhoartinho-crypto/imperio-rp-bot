const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorBuilder,
  TextDisplayBuilder,
} = require('discord.js');
const path = require('path');
const { version: PANEL_VERSION } = require('../package.json');

const TICKET_STYLES = [
  ButtonStyle.Primary,
  ButtonStyle.Danger,
  ButtonStyle.Secondary,
  ButtonStyle.Success,
  ButtonStyle.Secondary,
];

function tokenize(text, ctx) {
  return String(text ?? '').replace(/\{\{([a-z0-9-]+)\}\}/gi, (match, key) => {
    const id = ctx.channels?.[key];
    if (id) return `<#${id}>`;
    const name = ctx.cfg?.CHANNEL_REFS?.[key] ?? key;
    return `#${name}`;
  });
}

function ticketRows(cfg) {
  const rows = [];
  for (let index = 0; index < cfg.TICKETS.length; index += 5) {
    const row = new ActionRowBuilder();
    for (const ticket of cfg.TICKETS.slice(index, index + 5)) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket:abrir:${ticket.key}`)
          .setLabel(ticket.label)
          .setStyle(TICKET_STYLES[cfg.TICKETS.indexOf(ticket) % TICKET_STYLES.length]),
      );
    }
    rows.push(row);
  }
  return rows;
}

function roleRows(cfg) {
  const rows = [];
  const keys = cfg.MENU_ROLE_KEYS ?? [];
  for (let index = 0; index < keys.length; index += 5) {
    const row = new ActionRowBuilder();
    for (const key of keys.slice(index, index + 5)) {
      const role = cfg.ROLES.find((entry) => entry.key === key);
      if (!role) continue;
      row.addComponents(
        new ButtonBuilder().setCustomId(`cargo:${key}`).setLabel(role.name).setStyle(ButtonStyle.Secondary),
      );
    }
    if (row.components.length) rows.push(row);
  }
  return rows;
}

function buildPanel(def, ctx) {
  const accent = def.accent ?? ctx.cfg.ACCENT ?? 0xd4af37;
  const icon = def.icon ?? ctx.channelIcon;
  const container = new ContainerBuilder().setAccentColor(accent);
  const files = [];

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${icon ? `${icon} ` : ''}${tokenize(def.title, ctx)}`),
  );

  if (def.intro) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(tokenize(def.intro, ctx)));
  }

  if (def.image) {
    const filePath = path.join(__dirname, '..', def.image);
    const filename = path.basename(filePath);
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(`attachment://${filename}`)
          .setDescription(def.imageAlt ?? def.title),
      ),
    );
    files.push({ attachment: filePath, name: filename });
  }

  if (def.orgKey) {
    const leader = ctx.leaders?.[def.orgKey];
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        leader ? `### 🔴 Assumida\nLíder: <@${leader}>` : '### 🟢 Livre\nNinguém assumiu ainda.',
      ),
    );
  }

  for (const section of def.sections ?? []) {
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${tokenize(section.label, ctx)}\n${tokenize(section.lines.join('\n'), ctx)}`,
      ),
    );
  }

  if (def.kind === 'tickets') container.addActionRowComponents(...ticketRows(ctx.cfg));
  if (def.kind === 'cargos') container.addActionRowComponents(...roleRows(ctx.cfg));
  if (def.button) {
    const button = new ButtonBuilder()
      .setCustomId(def.button.id)
      .setLabel(def.button.label)
      .setStyle(def.button.style ?? ButtonStyle.Success);
    if (def.button.emoji) button.setEmoji(def.button.emoji);
    container.addActionRowComponents(new ActionRowBuilder().addComponents(button));
  }

  if (def.note) {
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${tokenize(def.note, ctx)}`));
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${ctx.guild?.name ?? ctx.cfg.SERVIDOR} · Painel oficial · v${PANEL_VERSION}`),
  );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
    allowedMentions: { parse: [] },
    ...(files.length ? { files } : {}),
  };
}

function collectTexts(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (typeof node.content === 'string') out.push(node.content);
  for (const child of node.components ?? []) collectTexts(child, out);
  return out;
}

const clean = (text) =>
  String(text)
    .split('\n')[0]
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .trim()
    .toLowerCase();

function titleOfPanel(message) {
  const texts = collectTexts({ components: message.components });
  return texts.length ? clean(texts[0]) : null;
}

function titleOfPayload(payload) {
  const texts = collectTexts(payload.components?.[0]?.toJSON?.() ?? payload.components?.[0] ?? {});
  return texts.length ? clean(texts[0]) : null;
}

function collectAccent(node) {
  if (!node || typeof node !== 'object') return null;
  if (typeof node.accent_color === 'number') return node.accent_color;
  for (const child of node.components ?? []) {
    const found = collectAccent(child);
    if (found !== null) return found;
  }
  return null;
}

function panelFingerprint(source) {
  const json = typeof source?.toJSON === 'function' ? source.toJSON() : source;
  const list = Array.isArray(json?.components) ? json.components : [];
  const components = list.map((component) => (typeof component?.toJSON === 'function' ? component.toJSON() : component));
  const texts = collectTexts({ components });
  return `${collectAccent({ components }) ?? 'none'}|${texts.join('\n')}`;
}

function buildV2JoinWelcome(member, ctx) {
  const rules = ctx.channels?.regras ? `<#${ctx.channels.regras}>` : 'as regras';
  const commands = ctx.channels?.cargos ? `<#${ctx.channels.cargos}>` : 'os cargos';
  const howto = ctx.channels?.['como-jogar'] ? `<#${ctx.channels['como-jogar']}>` : 'como jogar';
  const ticket = ctx.channels?.tickets ? `<#${ctx.channels.tickets}>` : 'o suporte';

  const container = new ContainerBuilder()
    .setAccentColor(ctx.cfg?.ACCENT ?? 0xd4af37)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# Bem-vindo, ${member.displayName}`),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Você acabou de entrar no **${member.guild.name}**. A cidade é viva, e a sua história começa agora.`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### Primeiros passos\n1. Leia ${rules} e as regras de RP.\n2. Escolha seus avisos em ${commands}.\n3. Veja ${howto} e acompanhe o status da cidade.`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Dúvidas? Abra um atendimento em ${ticket}.`),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${member.guild.name} · Painel oficial · v${PANEL_VERSION}`,
      ),
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

module.exports = { buildPanel, buildV2JoinWelcome, titleOfPanel, titleOfPayload, panelFingerprint, tokenize };
