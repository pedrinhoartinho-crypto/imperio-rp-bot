const crypto = require('node:crypto');

const OCR_ENDPOINT = 'https://api.ocr.space/parse/image';
const MAX_OCR_BYTES = 1024 * 1024;

function normalize(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

async function extractReceiptText({ buffer, filename, contentType, url }) {
  const apiKey = process.env.OCR_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error('OCR_API_KEY não configurada.');
    error.code = 'OCR_NOT_CONFIGURED';
    throw error;
  }

  const form = new FormData();
  form.append('apikey', apiKey);
  form.append('language', process.env.OCR_LANGUAGE || 'por');
  form.append('isOverlayRequired', 'false');
  form.append('scale', 'true');
  form.append('OCREngine', process.env.OCR_ENGINE || '2');

  if (buffer && buffer.length <= MAX_OCR_BYTES) {
    form.append('file', new Blob([buffer], { type: contentType || 'image/png' }), filename || 'comprovante.png');
  } else if (url) {
    form.append('url', url);
  } else {
    throw new Error('Comprovante muito grande para o OCR. Envie um print menor que 1 MB.');
  }

  const response = await fetch(OCR_ENDPOINT, { method: 'POST', body: form });
  const json = await response.json().catch(() => null);

  if (!response.ok || !json) {
    throw new Error(`OCR indisponível (HTTP ${response.status}).`);
  }

  if (json.IsErroredOnProcessing) {
    const detail = Array.isArray(json.ErrorMessage) ? json.ErrorMessage.join(' ') : json.ErrorMessage;
    throw new Error(`OCR não conseguiu ler o comprovante: ${detail || 'imagem ilegível'}.`);
  }

  const text = (json.ParsedResults ?? [])
    .map((result) => result.ParsedText ?? '')
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Não consegui ler nenhum texto no comprovante. Envie um print mais nítido.');
  }

  return { text, raw: json };
}

function parseAmounts(text) {
  const amounts = new Set();

  const decimal = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+)\s*[.,]\s*(\d{2})(?!\d)/g;
  for (const match of text.matchAll(decimal)) {
    const whole = match[1].replace(/\./g, '');
    amounts.add(Number(`${whole}.${match[2]}`));
  }

  const spaced = /R\$\s*(\d{1,3}(?:\.\d{3})*|\d+)\s+(\d{2})(?!\d)/g;
  for (const match of text.matchAll(spaced)) {
    const whole = match[1].replace(/\./g, '');
    amounts.add(Number(`${whole}.${match[2]}`));
  }

  const integer = /R\$\s*(\d{1,3}(?:\.\d{3})*)(?![\d,.])/g;
  for (const match of text.matchAll(integer)) {
    amounts.add(Number(match[1].replace(/\./g, '')));
  }

  return [...amounts].filter((value) => Number.isFinite(value) && value > 0);
}

function parseDate(text) {
  const br = text.match(/\b(\d{2})[/.-](\d{2})[/.-](\d{4})\b/);
  if (br) {
    const [, day, month, year] = br;
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
    if (!Number.isNaN(date.getTime()) && date.getDate() === Number(day)) return date;
  }

  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const [, year, month, day] = iso;
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
    if (!Number.isNaN(date.getTime()) && date.getDate() === Number(day)) return date;
  }

  return null;
}

function parseE2E(text) {
  const direct = text.match(/\bE[0-9]{8}[A-Z0-9]{10,40}\b/i);
  if (direct) return direct[0].toUpperCase();

  const line = text.match(/(?:E2E|ID DA TRANSACAO|ID DA TRANSFERENCIA|AUTENTICACAO)[^\n]{0,24}?[:#]?\s*([A-Z0-9]{12,40})/i);
  return line ? line[1].toUpperCase() : null;
}

function matchesPayee(text) {
  const payeeName = process.env.PIX_NAME?.trim() ?? '';
  const pixKey = process.env.PIX_KEY?.trim() ?? '';

  if (!payeeName && !pixKey) {
    return { ok: false, detail: 'PIX_NAME e PIX_KEY não configurados no bot.' };
  }

  const normalizedText = normalize(text);
  const nameTokens = normalize(payeeName)
    .split(/[^A-Z0-9]+/)
    .filter((token) => token.length >= 3);
  const nameOk = nameTokens.length > 0 && nameTokens.every((token) => normalizedText.includes(token));

  let keyOk = false;
  if (pixKey.includes('@')) {
    keyOk = normalizedText.includes(normalize(pixKey));
  } else {
    const digits = pixKey.replace(/\D/g, '');
    if (digits.length >= 8) {
      keyOk = text.replace(/\D/g, '').includes(digits);
    }
  }

  if (nameOk) return { ok: true, detail: `Favorecido reconhecido (${payeeName}).` };
  if (keyOk) return { ok: true, detail: 'Chave Pix reconhecida no comprovante.' };
  return { ok: false, detail: `Favorecido esperado: ${payeeName || pixKey}.` };
}

function validateReceipt(text, product) {
  const amounts = parseAmounts(text);
  const expected = Number(product.price);
  const amountOk = amounts.some((value) => Math.abs(value - expected) <= 0.01);
  const payee = matchesPayee(text);

  const date = parseDate(text);
  const maxAgeDays = Number(process.env.RECEIPT_MAX_AGE_DAYS || 7);
  let dateOk = true;
  let dateDetail = 'Data não encontrada (confira manualmente).';
  if (date) {
    const ageDays = (Date.now() - date.getTime()) / 86400000;
    if (ageDays < -1) {
      dateOk = false;
      dateDetail = `Data no futuro: ${date.toLocaleDateString('pt-BR')}.`;
    } else if (ageDays > maxAgeDays) {
      dateOk = false;
      dateDetail = `Comprovante com ${Math.floor(ageDays)} dias (limite: ${maxAgeDays}).`;
    } else {
      dateDetail = `Data válida: ${date.toLocaleDateString('pt-BR')}.`;
    }
  }

  const e2e = parseE2E(text);
  const textOk = text.trim().length >= 20;

  const checks = [
    {
      key: 'valor',
      ok: amountOk,
      detail: amountOk
        ? `Valor confere: ${amounts.map((v) => v.toFixed(2).replace('.', ',')).join(' / ')}`
        : `Valor não confere. Esperado R$ ${expected.toFixed(2).replace('.', ',')}. Lido: ${
            amounts.length ? amounts.map((v) => `R$ ${v.toFixed(2).replace('.', ',')}`).join(' / ') : 'nenhum valor'
          }.`,
    },
    { key: 'favorecido', ok: payee.ok, detail: payee.detail },
    { key: 'data', ok: dateOk, detail: dateDetail, warn: !date },
    {
      key: 'texto',
      ok: textOk,
      detail: textOk ? 'Comprovante legível.' : 'Texto insuficiente no comprovante.',
    },
  ];

  return {
    ok: checks.every((check) => check.ok),
    checks,
    amounts,
    amount: amounts.find((value) => Math.abs(value - expected) <= 0.01) ?? amounts[0] ?? null,
    date: date ? date.toISOString() : null,
    e2e,
    text,
  };
}

function receiptFingerprint(buffer, e2e) {
  const imageHash = crypto.createHash('sha256').update(buffer).digest('hex');
  const imageId = `R${imageHash.slice(0, 30)}`;
  const e2eId = e2e
    ? `E${crypto.createHash('sha256').update(String(e2e).toUpperCase()).digest('hex').slice(0, 30)}`
    : null;
  return { imageId, e2eId, imageHash, e2e: e2e ?? null };
}

function describeValidation(validation) {
  return validation.checks
    .map((check) => `${check.ok ? '✅' : check.warn ? '⚠️' : '❌'} ${check.detail}`)
    .join('\n');
}

module.exports = {
  extractReceiptText,
  validateReceipt,
  receiptFingerprint,
  describeValidation,
  parseAmounts,
  parseDate,
  parseE2E,
  normalize,
};
