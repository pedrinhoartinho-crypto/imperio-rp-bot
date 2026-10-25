const imperio = require('./configs/imperio');
const assault = require('./configs/assault');

const BY_KEY = { imperio, assault };
const CONFIGS = new Map();

if (process.env.GUILD_ID) CONFIGS.set(process.env.GUILD_ID, imperio);
CONFIGS.set(assault.GUILD_ID, assault);

const getConfig = (guildId) => CONFIGS.get(guildId) ?? null;

const getConfigByKey = (key) => {
  if (!key) return null;
  if (BY_KEY[key]) return BY_KEY[key];
  return [...CONFIGS.values()].find((cfg) => cfg.GUILD_ID === key) ?? null;
};

module.exports = { CONFIGS, BY_KEY, getConfig, getConfigByKey, ...imperio };
