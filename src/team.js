const { Routes } = require('discord.js');

const TAG_KEY = 'asj';
const TAG_PREFIX = '𝔸𝕊𝕁 | ';
const TAG_PATTERN = /^(?:\[✦\s*𝔸𝕊𝕁\s*✦\]|\[\s*𝔸𝕊𝕁\s*\]|(?:𝔸𝕊𝕁|ASJ)\s*\|)\s*/iu;
const MAX_NICK = 32;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const warned = new Set();

function tagRoleFor(guild, cfg) {
  const name = cfg.ROLES.find((role) => role.key === TAG_KEY)?.name;
  return name ? guild.roles.cache.find((role) => role.name === name) : null;
}

function teamRoleNames(cfg) {
  return [...cfg.STAFF_KEYS, ...cfg.LEADER_KEYS]
    .map((key) => cfg.ROLES.find((role) => role.key === key)?.name)
    .filter(Boolean);
}

function truncate(text, max) {
  const chars = Array.from(String(text));
  return chars.length > max ? chars.slice(0, max).join('') : String(text);
}

function cleanTag(nickname) {
  if (!nickname) return null;
  let current = nickname;
  let matched = false;
  let match;
  while ((match = current.match(TAG_PATTERN))) {
    current = current.slice(match[0].length);
    matched = true;
  }
  return matched ? current : null;
}

function baseName(nickname, username) {
  const clean = cleanTag(nickname);
  if (clean !== null) return clean;
  return nickname ?? username;
}

function displayNameFor(nickname, username, isTeam) {
  if (isTeam) {
    const base = baseName(nickname, username) || username;
    return TAG_PREFIX + truncate(base, MAX_NICK - TAG_PREFIX.length);
  }
  const clean = cleanTag(nickname);
  if (clean !== null) return clean || username;
  return nickname;
}

async function syncMemberTag(member, cfg) {
  if (!member || member.user?.bot) return false;

  const tag = tagRoleFor(member.guild, cfg);
  if (!tag) return false;

  const names = teamRoleNames(cfg);
  const isTeam = member.roles.cache.some((role) => names.includes(role.name));
  const hasTag = member.roles.cache.has(tag.id);
  let changed = false;

  if (isTeam !== hasTag) {
    try {
      if (isTeam) await member.roles.add(tag, 'Tag ASJ automática (equipe)');
      else await member.roles.remove(tag, 'Tag ASJ automática (fora da equipe)');
      changed = true;
    } catch (error) {
      if (!warned.has(`role:${member.id}`)) {
        warned.add(`role:${member.id}`);
        console.warn(`[aviso] Não foi possível atualizar a tag ASJ de ${member.user.tag}: ${error.message}`);
      }
    }
  }

  const nickname = member.nickname;
  const desired = displayNameFor(nickname, member.user.username, isTeam);
  if (member.id !== member.guild.ownerId && desired !== nickname) {
    try {
      await member.setNickname(desired, 'Tag ASJ automática');
      changed = true;
    } catch (error) {
      if (!warned.has(`nick:${member.id}`)) {
        warned.add(`nick:${member.id}`);
        console.warn(`[aviso] Não foi possível colocar a tag ASJ no nome de ${member.user.tag}: ${error.message}`);
      }
    }
  }

  return changed;
}

async function syncGuildTags(guild, cfg) {
  const tag = tagRoleFor(guild, cfg);
  if (!tag) return { updated: 0 };

  const teamIds = new Set();
  for (const key of [...cfg.STAFF_KEYS, ...cfg.LEADER_KEYS]) {
    const name = cfg.ROLES.find((role) => role.key === key)?.name;
    const role = name ? guild.roles.cache.find((entry) => entry.name === name) : null;
    if (role) teamIds.add(role.id);
  }

  let after = null;
  let updated = 0;

  for (let page = 0; page < 20; page += 1) {
    const query = new URLSearchParams({ limit: '1000' });
    if (after) query.set('after', after);

    const members = await guild.client.rest
      .get(Routes.guildMembers(guild.id), { query })
      .catch(() => null);
    if (!members?.length) break;

    for (const raw of members) {
      if (raw.user.bot) continue;

      const isTeam = raw.roles.some((id) => teamIds.has(id));
      const hasTag = raw.roles.includes(tag.id);
      const nickname = raw.nick ?? null;
      const desired = displayNameFor(nickname, raw.user.username, isTeam);
      if (isTeam === hasTag && desired === nickname) continue;

      const member = await guild.members.fetch({ user: raw.user.id, force: true }).catch(() => null);
      if (!member) continue;

      if (await syncMemberTag(member, cfg)) updated += 1;
      await wait(300);
    }

    after = members[members.length - 1].user.id;
    if (members.length < 1000) break;
  }

  if (updated) console.log(`[ok] Tag ASJ: ${updated} membro(s) atualizado(s).`);
  return { updated };
}

module.exports = { TAG_KEY, TAG_PREFIX, displayNameFor, syncMemberTag, syncGuildTags };
