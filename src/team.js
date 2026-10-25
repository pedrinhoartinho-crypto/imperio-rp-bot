const { Routes } = require('discord.js');

const TAG_KEY = 'asj';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function tagRoleFor(guild, cfg) {
  const name = cfg.ROLES.find((role) => role.key === TAG_KEY)?.name;
  return name ? guild.roles.cache.find((role) => role.name === name) : null;
}

function teamRoleNames(cfg) {
  return [...cfg.STAFF_KEYS, ...cfg.LEADER_KEYS]
    .map((key) => cfg.ROLES.find((role) => role.key === key)?.name)
    .filter(Boolean);
}

async function syncMemberTag(member, cfg) {
  if (!member || member.user?.bot) return false;

  const tag = tagRoleFor(member.guild, cfg);
  if (!tag) return false;

  const names = teamRoleNames(cfg);
  const isTeam = member.roles.cache.some((role) => names.includes(role.name));
  const hasTag = member.roles.cache.has(tag.id);
  if (isTeam === hasTag) return false;

  try {
    if (isTeam) await member.roles.add(tag, 'Tag ASJ automática (equipe)');
    else await member.roles.remove(tag, 'Tag ASJ automática (fora da equipe)');
    return true;
  } catch (error) {
    console.warn(`[aviso] Não foi possível atualizar a tag ASJ de ${member.user.tag}: ${error.message}`);
    return false;
  }
}

async function syncGuildTags(guild, cfg) {
  const tag = tagRoleFor(guild, cfg);
  if (!tag) return { added: 0, removed: 0 };

  const teamIds = new Set();
  for (const key of [...cfg.STAFF_KEYS, ...cfg.LEADER_KEYS]) {
    const name = cfg.ROLES.find((role) => role.key === key)?.name;
    const role = name ? guild.roles.cache.find((entry) => entry.name === name) : null;
    if (role) teamIds.add(role.id);
  }

  let after = null;
  let added = 0;
  let removed = 0;

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
      if (isTeam === hasTag) continue;

      const member = await guild.members.fetch(raw.user.id).catch(() => null);
      if (!member) continue;

      try {
        if (isTeam) {
          await member.roles.add(tag, 'Tag ASJ automática (equipe)');
          added += 1;
        } else {
          await member.roles.remove(tag, 'Tag ASJ automática (fora da equipe)');
          removed += 1;
        }
      } catch (error) {
        console.warn(`[aviso] Não foi possível atualizar a tag ASJ de ${raw.user.username}: ${error.message}`);
      }
      await wait(300);
    }

    after = members[members.length - 1].user.id;
    if (members.length < 1000) break;
  }

  if (added || removed) console.log(`[ok] Tag ASJ: ${added} adicionada(s), ${removed} removida(s).`);
  return { added, removed };
}

module.exports = { TAG_KEY, syncMemberTag, syncGuildTags };
