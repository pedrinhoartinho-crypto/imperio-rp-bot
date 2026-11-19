const crypto = require('node:crypto');
const { createDataStoreEntry, isConfigured, missingConfig, isConflict } = require('./roblox');
const { formatPrice } = require('./products');

const KEY_STORE = 'ProductKeys';
const RECEIPT_STORE = 'ProductReceipts';

function prefix() {
  const raw = (process.env.KEY_PREFIX || 'ASSAULT').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return (raw || 'ASSAULT').slice(0, 12);
}

function generateKey() {
  const raw = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `${prefix()}-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
}

function maskKey(code) {
  const parts = String(code).split('-');
  if (parts.length < 2) return `${String(code).slice(0, 3)}***`;
  return `${parts[0]}-****-****-****-${parts[parts.length - 1]}`;
}

function deliveryMessage(record) {
  return [
    '🎟️ **Sua chave chegou!**',
    '',
    `**Produto:** ${record.productName}`,
    `**Valor:** ${formatPrice(record.price ?? 0)}`,
    `**Conta vinculada:** @${record.boundName} (${record.boundUserId})`,
    '',
    `\`${record.code}\``,
    '',
    '**Como resgatar**',
    '1. Entre no jogo.',
    '2. Abra o ícone de engrenagem (Configurações).',
    '3. Vá até **RESGATAR CÓDIGO**.',
    '4. Cole a chave e confirme.',
    '',
    'A chave é de uso único e só funciona na conta Roblox vinculada.',
  ].join('\n');
}

async function createKey({
  product,
  buyer,
  source = 'loja',
  createdBy = null,
  orderId = null,
  receipt = null,
  note = null,
}) {
  if (!isConfigured()) {
    throw new Error(`Loja não configurada. Defina ${missingConfig().join(', ')} no .env.`);
  }
  if (!product || !Array.isArray(product.grants) || !product.grants.length) {
    throw new Error('Produto sem grants configurados.');
  }
  if (!buyer?.id || !buyer?.name) {
    throw new Error('Comprador Roblox inválido.');
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const code = generateKey();
    const record = {
      code,
      productId: product.id,
      productName: product.name,
      price: product.price,
      grants: product.grants,
      boundUserId: buyer.id,
      boundName: buyer.name,
      boundDisplayName: buyer.displayName ?? buyer.name,
      createdAt: Math.floor(Date.now() / 1000),
      redeemed: false,
      source,
      createdBy,
      orderId,
      note,
      receipt: receipt
        ? {
            amount: receipt.amount ?? null,
            e2e: receipt.e2e ?? null,
            date: receipt.date ?? null,
            fingerprint: receipt.fingerprint ?? null,
          }
        : null,
    };

    try {
      await createDataStoreEntry(KEY_STORE, code, record, [buyer.id]);
      return record;
    } catch (error) {
      if (isConflict(error)) continue;
      throw error;
    }
  }

  throw new Error('Não foi possível gerar uma chave única. Tente novamente.');
}

module.exports = {
  KEY_STORE,
  RECEIPT_STORE,
  generateKey,
  maskKey,
  deliveryMessage,
  createKey,
};
