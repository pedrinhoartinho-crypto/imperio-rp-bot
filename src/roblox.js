// Armazenamento da loja (sem Open Cloud).
//
// Backend principal: Upstash Redis (REST), para o bot rodar 24/7 no Render.
//   - Chaves:   loja:key:<code>        -> JSON { userId, record }
//   - Comprador: loja:user:<userId>    -> hash { <code> => JSON público }
//   - Comprovantes: loja:receipt:<id>  -> JSON (trava anti-reuso)
//
// Fallback local (modo de teste, sem Upstash):
//   - LOJA_KEY_DIR/<segredo>/<userId>.json  (o jogo lê via túnel)
//   - data/keys.json e data/receipts.json    (índice interno)
//
// As funções mantêm a mesma assinatura usada por loja.js/keys.js.

const fs = require('node:fs');
const path = require('node:path');

class RobloxApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'RobloxApiError';
    this.status = status;
    this.body = body;
  }
}

const DATA_DIR = process.env.LOJA_DATA_DIR?.trim() || path.join(__dirname, '..', 'data');
const KEY_DIR = process.env.LOJA_KEY_DIR?.trim() || '';
const KEY_SECRET = process.env.LOJA_KEY_SECRET?.trim() || '';
const UPSTASH_URL = (process.env.UPSTASH_REDIS_REST_URL?.trim() || '').replace(/\/+$/, '');
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || '';

const INDEX_FILE = path.join(DATA_DIR, 'keys.json');
const RECEIPTS_FILE = path.join(DATA_DIR, 'receipts.json');

// Comprovantes ficam 60 dias no Redis; a validação de data já limita a 7 dias.
const RECEIPT_TTL_SECONDS = 60 * 60 * 24 * 60;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}

function upstashConfigured() {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

function backend() {
  return upstashConfigured() ? 'upstash' : 'local';
}

function config() {
  return { backend: backend(), dataDir: DATA_DIR, keyDir: KEY_DIR, secret: KEY_SECRET };
}

function isConfigured() {
  if (!KEY_SECRET) return false;
  return upstashConfigured() || Boolean(KEY_DIR);
}

function missingConfig() {
  const missing = [];
  if (!KEY_SECRET) missing.push('LOJA_KEY_SECRET');
  if (!upstashConfigured() && !KEY_DIR) {
    missing.push('UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (ou LOJA_KEY_DIR no modo local)');
  }
  return missing;
}

function assertConfigured() {
  const missing = missingConfig();
  if (missing.length) {
    throw new Error(`Loja sem armazenamento configurado: defina ${missing.join(', ')} no .env.`);
  }
}

function assertEntryId(entryId) {
  if (!entryId || entryId.length > 50 || !/^[A-Za-z0-9_-]+$/.test(entryId)) {
    throw new Error(`ID de entrada inválido: ${entryId}`);
  }
}

function assertUserId(userId) {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('User ID inválido.');
  }
  return id;
}

async function redis(command) {
  let response;
  try {
    response = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    throw new Error(`Falha ao falar com o Upstash: ${error.message}`);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.error) {
    throw new Error(`Upstash: ${body?.error || `HTTP ${response.status}`}`);
  }

  return body?.result ?? null;
}

function keyRecordKey(entryId) {
  return `loja:key:${entryId}`;
}

function userHashKey(userId) {
  return `loja:user:${userId}`;
}

function receiptKey(entryId) {
  return `loja:receipt:${entryId}`;
}

function keyFilePath(userId) {
  return path.join(KEY_DIR, KEY_SECRET, `${userId}.json`);
}

// O JSON público só leva o que o jogo precisa. Dados do comprovante ficam
// apenas no índice interno (data/keys.json ou registro loja:key:*).
function publicKeyRecord(record) {
  return {
    code: record.code,
    productId: record.productId,
    productName: record.productName,
    price: record.price,
    grants: record.grants,
    boundUserId: record.boundUserId,
    boundName: record.boundName,
    createdAt: record.createdAt,
    redeemed: false,
  };
}

function parseRecord(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readLocalUserKeys(userId) {
  const list = readJson(keyFilePath(userId), []);
  return Array.isArray(list) ? list : [];
}

function writeLocalUserKeys(userId, list) {
  writeJson(keyFilePath(userId), list);
}

// Lista pública consumida pelo KeySystem no jogo.
async function getUserKeys(userId) {
  const id = assertUserId(userId);

  if (upstashConfigured()) {
    const values = await redis(['HVALS', userHashKey(id)]);
    if (!Array.isArray(values)) return [];

    return values
      .map(parseRecord)
      .filter((record) => record && record.code)
      .map(publicKeyRecord);
  }

  return readLocalUserKeys(id).map(publicKeyRecord);
}

async function createProductKey(entryId, record, userIds) {
  const userId = assertUserId(userIds?.[0] ?? record?.boundUserId);
  const publicRecord = publicKeyRecord(record);

  if (upstashConfigured()) {
    const created = await redis([
      'SET',
      keyRecordKey(entryId),
      JSON.stringify({ userId, record }),
      'NX',
    ]);

    if (created === null) {
      throw new RobloxApiError('Esta chave já existe.', 409, null);
    }

    try {
      await redis(['HSET', userHashKey(userId), entryId, JSON.stringify(publicRecord)]);
    } catch (error) {
      await redis(['DEL', keyRecordKey(entryId)]).catch(() => {});
      throw error;
    }

    return { ok: true, entryId, userId };
  }

  ensureDir(path.join(KEY_DIR, KEY_SECRET));

  const index = readJson(INDEX_FILE, {});
  if (index[entryId]) {
    throw new RobloxApiError('Esta chave já existe.', 409, null);
  }

  const list = readLocalUserKeys(userId).filter((item) => item?.code !== entryId);
  list.push(publicRecord);
  writeLocalUserKeys(userId, list);

  index[entryId] = { userId, record };
  writeJson(INDEX_FILE, index);

  return { ok: true, entryId, userId };
}

async function getProductKey(entryId) {
  if (upstashConfigured()) {
    const entry = parseRecord(await redis(['GET', keyRecordKey(entryId)]));
    return entry?.record ? entry : null;
  }

  const index = readJson(INDEX_FILE, {});
  return index[entryId] ?? null;
}

async function deleteProductKey(entryId) {
  if (upstashConfigured()) {
    const entry = parseRecord(await redis(['GET', keyRecordKey(entryId)]));
    await redis(['DEL', keyRecordKey(entryId)]);
    if (entry?.userId) {
      await redis(['HDEL', userHashKey(entry.userId), entryId]).catch(() => {});
    }
    return { ok: true };
  }

  const index = readJson(INDEX_FILE, {});
  const entry = index[entryId];
  if (!entry) return { ok: true };

  delete index[entryId];
  writeJson(INDEX_FILE, index);

  const list = readLocalUserKeys(entry.userId).filter((item) => item?.code !== entryId);
  writeLocalUserKeys(entry.userId, list);

  return { ok: true };
}

async function createReceiptEntry(entryId, value) {
  if (upstashConfigured()) {
    const created = await redis([
      'SET',
      receiptKey(entryId),
      JSON.stringify(value),
      'NX',
      'EX',
      String(RECEIPT_TTL_SECONDS),
    ]);

    if (created === null) {
      throw new RobloxApiError('Este comprovante já foi utilizado.', 409, null);
    }

    return { ok: true };
  }

  const map = readJson(RECEIPTS_FILE, {});
  if (map[entryId]) {
    throw new RobloxApiError('Este comprovante já foi utilizado.', 409, null);
  }
  map[entryId] = value;
  writeJson(RECEIPTS_FILE, map);
  return { ok: true };
}

async function getReceiptEntry(entryId) {
  if (upstashConfigured()) {
    const value = parseRecord(await redis(['GET', receiptKey(entryId)]));
    return value ? { value } : null;
  }

  const map = readJson(RECEIPTS_FILE, {});
  return map[entryId] ? { value: map[entryId] } : null;
}

async function updateReceiptEntry(entryId, value) {
  if (upstashConfigured()) {
    const existing = parseRecord(await redis(['GET', receiptKey(entryId)])) ?? {};
    const merged = { ...existing, ...value };
    await redis([
      'SET',
      receiptKey(entryId),
      JSON.stringify(merged),
      'EX',
      String(RECEIPT_TTL_SECONDS),
    ]);
    return { ok: true };
  }

  const map = readJson(RECEIPTS_FILE, {});
  map[entryId] = { ...(map[entryId] ?? {}), ...value };
  writeJson(RECEIPTS_FILE, map);
  return { ok: true };
}

async function deleteReceiptEntry(entryId) {
  if (upstashConfigured()) {
    await redis(['DEL', receiptKey(entryId)]);
    return { ok: true };
  }

  const map = readJson(RECEIPTS_FILE, {});
  delete map[entryId];
  writeJson(RECEIPTS_FILE, map);
  return { ok: true };
}

async function createDataStoreEntry(store, entryId, value, userIds = []) {
  assertConfigured();
  assertEntryId(entryId);

  if (store === 'ProductKeys') {
    return createProductKey(entryId, value, userIds);
  }

  if (store === 'ProductReceipts') {
    return createReceiptEntry(entryId, value);
  }

  throw new Error(`Store desconhecido: ${store}`);
}

async function getDataStoreEntry(store, entryId) {
  assertConfigured();
  assertEntryId(entryId);

  if (store === 'ProductKeys') {
    const entry = await getProductKey(entryId);
    return entry ? { value: entry.record } : null;
  }

  if (store === 'ProductReceipts') {
    return getReceiptEntry(entryId);
  }

  return null;
}

async function updateDataStoreEntry(store, entryId, value, userIds = []) {
  assertConfigured();
  assertEntryId(entryId);

  if (store === 'ProductReceipts') {
    return updateReceiptEntry(entryId, value);
  }

  // ProductKeys não é atualizado pelo bot; o resgate é controlado pelo jogo.
  return { ok: true };
}

async function deleteDataStoreEntry(store, entryId) {
  assertConfigured();
  assertEntryId(entryId);

  if (store === 'ProductKeys') {
    return deleteProductKey(entryId);
  }

  if (store === 'ProductReceipts') {
    return deleteReceiptEntry(entryId);
  }

  return { ok: true };
}

async function resolveRobloxUser(username) {
  const clean = String(username ?? '').trim().replace(/^@/, '');
  if (!/^[A-Za-z0-9_]{3,20}$/.test(clean)) {
    throw new Error('Usuário Roblox inválido. Use apenas letras, números e _ (3 a 20 caracteres).');
  }

  const response = await fetch('https://users.roblox.com/v1/usernames/users', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ usernames: [clean], excludeBannedUsers: false }),
    signal: AbortSignal.timeout(15_000),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Não foi possível consultar o Roblox (HTTP ${response.status}).`);
  }

  const user = body?.data?.[0];
  if (!user) {
    throw new Error(`A conta Roblox "${clean}" não foi encontrada. Confira o nome de usuário.`);
  }

  return {
    id: Number(user.id),
    name: user.name,
    displayName: user.displayName ?? user.name,
  };
}

function isConflict(error) {
  return (
    error instanceof RobloxApiError &&
    (error.status === 409 || /já existe|already exists|conflict|utilizado/i.test(String(error.message)))
  );
}

module.exports = {
  RobloxApiError,
  config,
  backend,
  upstashConfigured,
  isConfigured,
  missingConfig,
  assertConfigured,
  createDataStoreEntry,
  getDataStoreEntry,
  updateDataStoreEntry,
  deleteDataStoreEntry,
  getUserKeys,
  resolveRobloxUser,
  isConflict,
};
