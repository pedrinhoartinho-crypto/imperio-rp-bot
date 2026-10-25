const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LEGACY_FILE = path.join(DATA_DIR, 'bateponto.json');

function fileFor(guildId) {
  if (!guildId || guildId === process.env.GUILD_ID) return LEGACY_FILE;
  return path.join(DATA_DIR, String(guildId), 'bateponto.json');
}

function loadShifts(guildId) {
  try {
    return JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8'));
  } catch {
    return {};
  }
}

function saveShifts(guildId, data) {
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = { loadShifts, saveShifts };
