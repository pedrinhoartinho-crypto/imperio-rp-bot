const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { getConfig } = require('./config');
const { PRODUCTS, getProduct, formatPrice } = require('./products');
const {
  createDataStoreEntry,
  getDataStoreEntry,
  deleteDataStoreEntry,
  isConfigured,
  missingConfig,
  isConflict,
  resolveRobloxUser,
} = require('./roblox');
const { createKey, deliveryMessage, maskKey, RECEIPT_STORE, KEY_STORE } = require('./keys');
const {
  extractReceiptText,
  validateReceipt,
  receiptFingerprint,
  describeValidation,
} = require('./receipts');

const MAX_RECEIPT_BYTES = Number(process.env.LOJA_MAX_RECEIPT_MB || 8) * 1024 * 1024;
const orders = new Map();
const reviews = new Map();
const processing = new Set();

function replyEphemeral(interaction, content) {
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp({ content, flags: MessageFlags.Ephemeral }).catch(() => {});
  }
  return interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => {});
}

function roleNameFor(cfg, key) {
  return cfg.ROLES.find((role) => role.key === key)?.name;
}

function canSell(member, cfg) {
  if (!cfg || !member) return false;
  const names = new Set(
    cfg.ROLES.filter((role) => cfg.STAFF_KEYS.includes(role.key) || role.key === 'vendedor').map((role) => role.name),
  );
  return member.roles.cache.some((role) => names.has(role.name));
}

function isLojaTicket(channel) {
  return Boolean(channel?.topic?.startsWith('ticket:loja'));
}

function orderFromTopic(channel) {
  const topic = channel?.topic ?? '';
  const authorId = (topic.match(/\((\d{17,20})\)/) ?? [])[1] ?? null;
  const productId = (topic.match(/\|\s*produto:([a-z0-9_-]+)/) ?? [])[1] ?? null;
  const robloxName = (topic.match(/\|\s*roblox:([A-Za-z0-9_]+)/) ?? [])[1] ?? null;
  const robloxId = Number((topic.match(/\|\s*userid:(\d+)/) ?? [])[1] ?? 0) || null;
  return { authorId, productId, robloxName, robloxId };
}

async function saveOrderToTopic(channel, order) {
  const base = (channel.topic ?? '')
    .replace(/\s*\|\s*produto:[^|]+/g, '')
    .replace(/\s*\|\s*roblox:[^|]+/g, '')
    .replace(/\s*\|\s*userid:\d+/g, '')
    .trim()
    .slice(0, 780);
  const parts = [base, `produto:${order.productId}`];
  if (order.buyer?.name) parts.push(`roblox:${order.buyer.name}`);
  if (order.buyer?.id) parts.push(`userid:${order.buyer.id}`);
  await channel.setTopic(parts.join(' | ').slice(0, 1024), 'Produto escolhido na loja').catch(() => {});
}

function pixConfigured() {
  return Boolean(process.env.PIX_KEY?.trim());
}

function pixLines() {
  const key = process.env.PIX_KEY?.trim() || 'PIX_KEY não configurada';
  const name = process.env.PIX_NAME?.trim() || 'Favorecido não configurado';
  return { key, name };
}

function paymentEmbed(product, order) {
  const { key, name } = pixLines();
  return new EmbedBuilder()
    .setColor(0xd4af37)
    .setTitle(`Pagamento — ${product.name}`)
    .setDescription(
      [
        `**Valor:** ${formatPrice(product.price)}`,
        '',
        `**Chave Pix:** \`${key}\``,
        `**Favorecido:** ${name}`,
        '',
        'Depois de pagar, **envie o comprovante neste ticket** (print ou foto).',
        'A conferência é automática e a chave chega por DM.',
      ].join('\n'),
    )
    .addFields({ name: 'Conta Roblox', value: `@${order.buyer.name} (${order.buyer.id})`, inline: true })
    .setFooter({ text: 'A chave é de uso único e fica vinculada a esta conta Roblox.' });
}

function saleEmbed(product, order, record) {
  return new EmbedBuilder()
    .setColor(0x1e8449)
    .setTitle('✅ Compra entregue')
    .setDescription(
      [
        `**Produto:** ${product.name}`,
        `**Valor:** ${formatPrice(product.price)}`,
        `**Conta Roblox:** @${record.boundName} (${record.boundUserId})`,
        `**Chave:** \`${maskKey(record.code)}\``,
        '',
        'A chave completa foi enviada por DM. Para usar, abra **Configurações → RESGATAR CÓDIGO** no jogo.',
      ].join('\n'),
    )
    .setFooter({ text: `Pedido ${record.code}` })
    .setTimestamp();
}

function errorEmbed(title, description) {
  return new EmbedBuilder().setColor(0x8b0000).setTitle(title).setDescription(description).setTimestamp();
}

function findLogChannel(guild, cfg) {
  const name = process.env.LOJA_LOG_CHANNEL?.trim() || cfg.channelName?.('ticket-logs');
  if (!name) return null;
  return (
    guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText && channel.name === name) ?? null
  );
}

async function postLojaPanel(channel, cfg) {
  if (!PRODUCTS.length) return;

  const embed = new EmbedBuilder()
    .setColor(cfg.ACCENT ?? 0xd4af37)
    .setTitle('🛒 Loja oficial')
    .setDescription(
      [
        'Escolha o produto no menu abaixo para iniciar a compra.',
        '',
        'O bot mostra o valor e a chave Pix. Depois do pagamento, envie o comprovante aqui neste ticket.',
        'A chave de resgate é entregue por DM e deve ser usada em **Configurações → RESGATAR CÓDIGO**.',
      ].join('\n'),
    )
    .setFooter({ text: 'Pagamento conferido automaticamente · atendimento privado' });

  const menu = new StringSelectMenuBuilder()
    .setCustomId('loja:produto')
    .setPlaceholder('Escolha o produto')
    .addOptions(
      PRODUCTS.slice(0, 25).map((product) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(`${product.name} — ${formatPrice(product.price)}`.slice(0, 100))
          .setDescription(product.description.slice(0, 100))
          .setValue(product.id)
          .setEmoji(product.emoji || '🛒'),
      ),
    );

  const rows = [
    new ActionRowBuilder().addComponents(menu),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('loja:pix').setLabel('Ver chave Pix').setStyle(ButtonStyle.Secondary),
    ),
  ];

  await channel.send({ embeds: [embed], components: rows, allowedMentions: { parse: [] } }).catch(() => {});
}

async function handleProductSelect(interaction) {
  if (!isLojaTicket(interaction.channel)) {
    await replyEphemeral(interaction, 'Este menu só funciona dentro de um ticket da Loja.');
    return;
  }

  const product = getProduct(interaction.values?.[0]);
  if (!product) {
    await replyEphemeral(interaction, 'Produto indisponível. Escolha outro no menu.');
    return;
  }

  const modal = new ModalBuilder().setCustomId(`loja:usuario:${product.id}`).setTitle('Dados da compra');
  modal.addLabelComponents(
    new LabelBuilder().setLabel('Usuário Roblox').setTextInputComponent(
      new TextInputBuilder()
        .setCustomId('roblox')
        .setStyle(TextInputStyle.Short)
        .setMinLength(3)
        .setMaxLength(20)
        .setRequired(true)
        .setPlaceholder('Ex.: itzvini459'),
    ),
    new LabelBuilder().setLabel('Observação (opcional)').setTextInputComponent(
      new TextInputBuilder()
        .setCustomId('observacao')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(120)
        .setRequired(false)
        .setPlaceholder('Ex.: comprei pelo celular'),
    ),
  );

  await interaction.showModal(modal);
}

async function handleBuyerModal(interaction) {
  const productId = interaction.customId.slice('loja:usuario:'.length);
  const product = getProduct(productId);
  if (!product) {
    await replyEphemeral(interaction, 'Produto indisponível. Abra a Loja novamente.');
    return;
  }
  if (!isLojaTicket(interaction.channel)) {
    await replyEphemeral(interaction, 'Este formulário só funciona dentro de um ticket da Loja.');
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const username = interaction.fields.getTextInputValue('roblox');
  const note = interaction.fields.getTextInputValue('observacao') || null;

  let buyer;
  try {
    buyer = await resolveRobloxUser(username);
  } catch (error) {
    await interaction.editReply({ content: `❌ ${error.message}` }).catch(() => {});
    return;
  }

  const topic = orderFromTopic(interaction.channel);
  const buyerDiscordId = topic.authorId ?? interaction.user.id;
  const order = {
    productId: product.id,
    buyer,
    buyerDiscordId,
    note,
    selectedBy: interaction.user.id,
    selectedAt: Date.now(),
  };

  orders.set(interaction.channel.id, order);
  await saveOrderToTopic(interaction.channel, order);

  const cfg = getConfig(interaction.guildId);
  const sellerName = cfg ? roleNameFor(cfg, 'vendedor') : null;
  const sellerRole = sellerName ? interaction.guild.roles.cache.find((role) => role.name === sellerName) : null;
  const mention = sellerRole ? `\n<@&${sellerRole.id}>` : '';

  await interaction.channel
    .send({
      content: `<@${buyerDiscordId}> escolheu **${product.name}**.${mention}`,
      embeds: [paymentEmbed(product, order)],
      allowedMentions: { parse: [] },
    })
    .catch(() => {});

  await interaction
    .editReply({
      content:
        `✅ Conta Roblox vinculada: **@${buyer.name}** (${buyer.id}).\n` +
        'Agora envie o comprovante Pix neste ticket. A conferência é automática.',
    })
    .catch(() => {});
}

async function handlePixButton(interaction) {
  if (!isLojaTicket(interaction.channel)) {
    await replyEphemeral(interaction, 'Este botão só funciona dentro de um ticket da Loja.');
    return;
  }

  const order = orders.get(interaction.channel.id) ?? orderFromTopic(interaction.channel);
  const product = order?.productId ? getProduct(order.productId) : null;
  const { key, name } = pixLines();

  const lines = [`**Chave Pix:** \`${key}\``, `**Favorecido:** ${name}`];
  if (product) lines.unshift(`**Produto:** ${product.name} — ${formatPrice(product.price)}`, '');

  await replyEphemeral(interaction, lines.join('\n'));
}

async function downloadAttachment(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Não consegui baixar o comprovante (HTTP ${response.status}).`);
    const length = Number(response.headers.get('content-length') || 0);
    if (length > MAX_RECEIPT_BYTES) {
      throw new Error(`Comprovante muito grande. Envie um print de até ${Math.round(MAX_RECEIPT_BYTES / 1024 / 1024)} MB.`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_RECEIPT_BYTES) {
      throw new Error(`Comprovante muito grande. Envie um print de até ${Math.round(MAX_RECEIPT_BYTES / 1024 / 1024)} MB.`);
    }
    return buffer;
  } finally {
    clearTimeout(timer);
  }
}

function pickReceiptAttachment(message) {
  return [...message.attachments.values()].find(
    (attachment) =>
      String(attachment.contentType || '').startsWith('image/') ||
      /\.(png|jpe?g|gif|bmp)$/i.test(attachment.name || ''),
  );
}

function orderFromMessage(channel) {
  const cached = orders.get(channel.id);
  if (cached) return cached;

  const parsed = orderFromTopic(channel);
  if (!parsed.productId || !parsed.robloxId || !parsed.robloxName) return null;

  return {
    productId: parsed.productId,
    buyer: { id: parsed.robloxId, name: parsed.robloxName, displayName: parsed.robloxName },
    buyerDiscordId: parsed.authorId,
    selectedAt: Date.now(),
  };
}

async function handleReceiptMessage(message, cfg) {
  if (!message.guild || message.author.bot) return;
  if (!isLojaTicket(message.channel)) return;

  const attachment = pickReceiptAttachment(message);
  if (!attachment) return;

  const channel = message.channel;

  if (processing.has(channel.id)) {
    await message.reply({ content: '⏳ Já estou conferindo outro comprovante deste ticket. Aguarde um instante.' }).catch(() => {});
    return;
  }

  const order = orderFromMessage(channel);
  if (!order) {
    await message
      .reply({ content: 'Escolha primeiro o produto no menu da Loja e informe seu usuário Roblox.' })
      .catch(() => {});
    return;
  }

  const product = getProduct(order.productId);
  if (!product) {
    await message.reply({ content: 'Produto indisponível. Escolha outro no menu da Loja.' }).catch(() => {});
    return;
  }

  if (!isConfigured()) {
    await message
      .reply({
        content: `⚙️ A loja está sem integração com o Roblox. Configure ${missingConfig().join(', ')} no bot.`,
      })
      .catch(() => {});
    return;
  }

  if (!pixConfigured()) {
    await message.reply({ content: '⚙️ A chave Pix ainda não foi configurada no bot. Avise a administração.' }).catch(() => {});
    return;
  }

  processing.add(channel.id);
  await message.react('⏳').catch(() => {});

  let buffer = null;
  let fingerprint = null;

  try {
    buffer = await downloadAttachment(attachment.url);
    fingerprint = receiptFingerprint(buffer, null);

    let ocr = null;
    let ocrError = null;
    try {
      ocr = await extractReceiptText({
        buffer,
        filename: attachment.name,
        contentType: attachment.contentType,
        url: attachment.url,
      });
    } catch (error) {
      ocrError = error;
    }

    if (!ocr) {
      const reason =
        ocrError?.code === 'OCR_NOT_CONFIGURED'
          ? 'OCR não configurado no bot. Um vendedor precisa conferir manualmente.'
          : `Não consegui ler o comprovante: ${ocrError?.message ?? 'erro desconhecido'}`;
      await postManualReview(message, order, product, null, fingerprint, reason);
      return;
    }

    const validation = validateReceipt(ocr.text, product);
    fingerprint = receiptFingerprint(buffer, validation.e2e);

    if (!validation.ok) {
      await postManualReview(
        message,
        order,
        product,
        validation,
        fingerprint,
        'A conferência automática encontrou divergências. Um vendedor pode aprovar manualmente.',
      );
      return;
    }

    const result = await deliverProduct({
      channel,
      cfg,
      product,
      order,
      validation,
      fingerprint,
      source: 'loja',
      createdBy: null,
    });

    await message.react('✅').catch(() => {});
    if (result.recovered) {
      await message
        .reply({ content: 'Este comprovante já tinha sido aprovado. Reenviei a mesma chave por DM.' })
        .catch(() => {});
    }
  } catch (error) {
    console.error(`[loja] Falha ao processar comprovante: ${error.message}`);
    await message
      .reply({
        content: `❌ Não foi possível concluir a entrega: ${error.message}\nUm vendedor pode conferir manualmente.`,
      })
      .catch(() => {});
    await message.react('❌').catch(() => {});
  } finally {
    processing.delete(channel.id);
    await message.reactions.cache.get('⏳')?.users.remove(message.client.user.id).catch(() => {});
  }
}

async function postManualReview(message, order, product, validation, fingerprint, reason) {
  const channel = message.channel;
  reviews.set(channel.id, {
    order,
    product,
    validation,
    fingerprint,
    attachmentUrl: [...message.attachments.values()].map((attachment) => attachment.url),
    reason,
    createdAt: Date.now(),
  });

  const cfg = getConfig(message.guild.id);
  const sellerName = cfg ? roleNameFor(cfg, 'vendedor') : null;
  const sellerRole = sellerName ? message.guild.roles.cache.find((role) => role.name === sellerName) : null;

  const embed = errorEmbed('⚠️ Comprovante precisa de conferência', reason)
    .addFields(
      { name: 'Produto', value: `${product.name} — ${formatPrice(product.price)}`, inline: true },
      { name: 'Conta Roblox', value: `@${order.buyer.name} (${order.buyer.id})`, inline: true },
    )
    .setFooter({ text: 'Vendedor: confira o comprovante e use o botão abaixo se estiver correto.' });

  if (validation) {
    embed.addFields({ name: 'Conferência automática', value: describeValidation(validation).slice(0, 1024) });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`loja:aprovar:${channel.id}`)
      .setLabel('Aprovar e entregar')
      .setStyle(ButtonStyle.Success),
  );

  await message
    .reply({
      content: sellerRole ? `<@&${sellerRole.id}>` : undefined,
      embeds: [embed],
      components: [row],
      allowedMentions: { parse: [] },
    })
    .catch(() => {});
}

async function claimReceiptLocks(ids, value, buyer, product, retried = false) {
  const created = [];

  for (const id of ids) {
    try {
      await createDataStoreEntry(RECEIPT_STORE, id, value, [buyer.id]);
      created.push(id);
    } catch (error) {
      for (const made of created) {
        await deleteDataStoreEntry(RECEIPT_STORE, made).catch(() => {});
      }

      if (isConflict(error)) {
        const existing = await getDataStoreEntry(RECEIPT_STORE, id).catch(() => null);
        const entry = existing?.value;
        const sameBuyer = entry?.buyerId === buyer.id && entry?.productId === product.id;
        const fresh = entry?.createdAt && Date.now() - entry.createdAt < 24 * 60 * 60 * 1000;
        const stale = sameBuyer && entry?.status === 'processing' && entry?.createdAt && Date.now() - entry.createdAt > 5 * 60 * 1000;

        if (sameBuyer && fresh && entry?.keyRecord) {
          const keyEntry = await getDataStoreEntry(KEY_STORE, entry.keyRecord.code).catch(() => null);
          if (keyEntry?.value) return { recovered: keyEntry.value };

          if (!retried) {
            await deleteDataStoreEntry(RECEIPT_STORE, id).catch(() => {});
            return claimReceiptLocks(ids, value, buyer, product, true);
          }
        }

        if (stale && !retried) {
          await deleteDataStoreEntry(RECEIPT_STORE, id).catch(() => {});
          return claimReceiptLocks(ids, value, buyer, product, true);
        }

        throw new Error('Este comprovante já foi utilizado ou está em processamento.');
      }

      throw error;
    }
  }

  return { created };
}

async function deliverProduct({
  channel,
  cfg,
  product,
  order,
  validation,
  fingerprint,
  source,
  createdBy,
  actorId = null,
}) {
  const buyer = order.buyer;
  if (!buyer?.id || !buyer?.name) throw new Error('Conta Roblox do comprador não identificada.');

  const lockIds = [`I${fingerprint.imageId.slice(1, 31)}`];
  if (fingerprint.e2eId) lockIds.push(fingerprint.e2eId);

  const record = await createKey({
    product,
    buyer,
    source,
    createdBy,
    orderId: channel.id,
    receipt: validation
      ? {
          amount: validation.amount,
          e2e: validation.e2e,
          date: validation.date,
          fingerprint: lockIds[0],
        }
      : { fingerprint: lockIds[0] },
  });

  const lockValue = {
    status: 'delivered',
    productId: product.id,
    productName: product.name,
    price: product.price,
    buyerId: buyer.id,
    buyerName: buyer.name,
    discordId: order.buyerDiscordId ?? null,
    channelId: channel.id,
    createdAt: Date.now(),
    validation: validation
      ? { amount: validation.amount, date: validation.date, e2e: validation.e2e }
      : null,
    keyRecord: record,
  };

  let claim;
  try {
    claim = await claimReceiptLocks(lockIds, lockValue, buyer, product);
  } catch (error) {
    await deleteDataStoreEntry(KEY_STORE, record.code).catch(() => {});
    throw error;
  }

  if (claim.recovered) {
    await deleteDataStoreEntry(KEY_STORE, record.code).catch(() => {});
    const delivery = await deliverKeyMessage(channel, claim.recovered, order, product, { recovered: true });
    reviews.delete(channel.id);
    orders.delete(channel.id);
    return { record: claim.recovered, recovered: true, dmOk: delivery.dmOk };
  }

  const delivery = await deliverKeyMessage(channel, record, order, product, {
    recovered: false,
    actorId,
  });

  reviews.delete(channel.id);
  orders.delete(channel.id);

  await sendSaleLog(channel.guild, cfg, {
    product,
    record,
    order,
    source,
    createdBy,
    actorId,
    recovered: false,
  });

  return { record, recovered: false, dmOk: delivery.dmOk };
}

async function deliverKeyMessage(channel, record, order, product, { recovered, actorId }) {
  const discordId = order.buyerDiscordId;
  let dmOk = false;

  if (discordId) {
    const user = await channel.client.users.fetch(discordId).catch(() => null);
    if (user) {
      dmOk = await user
        .send(deliveryMessage(record))
        .then(() => true)
        .catch(() => false);
    }
  }

  const lines = [
    `**Produto:** ${product.name}`,
    `**Valor:** ${formatPrice(product.price)}`,
    `**Conta Roblox:** @${record.boundName} (${record.boundUserId})`,
    '',
  ];

  if (dmOk) {
    lines.push('A chave completa foi enviada por **DM**. Use **Configurações → RESGATAR CÓDIGO**.');
  } else {
    lines.push(`⚠️ Não consegui enviar por DM. Chave: \`${record.code}\``);
  }

  if (recovered) lines.push('', 'Esta é a mesma chave entregue anteriormente para este comprovante.');

  const embed = new EmbedBuilder()
    .setColor(dmOk ? 0x1e8449 : 0xa04000)
    .setTitle(recovered ? '🔁 Chave reenviada' : '✅ Compra aprovada')
    .setDescription(lines.join('\n'))
    .setFooter({ text: recovered ? 'Reenvio automático' : 'Obrigado pela compra!' })
    .setTimestamp();

  if (actorId) embed.addFields({ name: 'Aprovado por', value: `<@${actorId}>`, inline: true });

  await channel.send({ embeds: [embed], allowedMentions: { parse: [] } }).catch(() => {});
  return { dmOk };
}

async function sendSaleLog(guild, cfg, { product, record, order, source, createdBy, actorId, recovered }) {
  const channel = findLogChannel(guild, cfg);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x1e8449)
    .setTitle('💰 Venda registrada')
    .addFields(
      { name: 'Produto', value: `${product.name} — ${formatPrice(product.price)}`, inline: true },
      { name: 'Conta Roblox', value: `@${record.boundName} (${record.boundUserId})`, inline: true },
      { name: 'Discord', value: order.buyerDiscordId ? `<@${order.buyerDiscordId}>` : 'Desconhecido', inline: true },
      { name: 'Chave', value: `\`${record.code}\`` },
      {
        name: 'Origem',
        value: recovered
          ? 'Reenvio de comprovante já aprovado'
          : source === 'manual'
            ? `Manual${createdBy ? ` (${createdBy})` : ''}`
            : 'Loja automática (OCR)',
      },
    )
    .setTimestamp();

  if (actorId) embed.addFields({ name: 'Aprovado por', value: `<@${actorId}>`, inline: true });
  if (order.note) embed.addFields({ name: 'Observação', value: String(order.note).slice(0, 1024) });

  await channel.send({ embeds: [embed], allowedMentions: { parse: [] } }).catch(() => {});
}

async function handleManualApprove(interaction) {
  const channelId = interaction.customId.slice('loja:aprovar:'.length);
  if (interaction.channelId !== channelId || !isLojaTicket(interaction.channel)) {
    await replyEphemeral(interaction, 'Este botão só funciona no ticket onde o comprovante foi enviado.');
    return;
  }

  const cfg = getConfig(interaction.guildId);
  if (!canSell(interaction.member, cfg)) {
    await replyEphemeral(interaction, 'Somente vendedores ou membros da equipe podem aprovar comprovantes.');
    return;
  }

  const review = reviews.get(channelId);
  if (!review) {
    await replyEphemeral(interaction, 'Este comprovante não está mais aguardando aprovação.');
    return;
  }

  if (processing.has(channelId)) {
    await replyEphemeral(interaction, 'Já existe uma entrega em andamento para este ticket.');
    return;
  }

  if (!isConfigured()) {
    await replyEphemeral(interaction, `Configure ${missingConfig().join(', ')} antes de aprovar.`);
    return;
  }

  processing.add(channelId);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

  try {
    const result = await deliverProduct({
      channel: interaction.channel,
      cfg,
      product: review.product,
      order: review.order,
      validation: review.validation,
      fingerprint: review.fingerprint,
      source: 'manual',
      createdBy: `${interaction.user.tag} (${interaction.user.id})`,
      actorId: interaction.user.id,
    });

    await interaction
      .editReply({
        content: result.recovered
          ? '✅ Comprovante já aprovado anteriormente. Reenviei a mesma chave.'
          : `✅ Produto entregue. Chave: \`${result.record.code}\``,
      })
      .catch(() => {});

    await interaction.message.edit({ components: [] }).catch(() => {});
    reviews.delete(channelId);
  } catch (error) {
    console.error(`[loja] Aprovação manual falhou: ${error.message}`);
    await interaction.editReply({ content: `❌ ${error.message}` }).catch(() => {});
  } finally {
    processing.delete(channelId);
  }
}

module.exports = {
  postLojaPanel,
  handleProductSelect,
  handleBuyerModal,
  handleReceiptMessage,
  handleManualApprove,
  handlePixButton,
};
