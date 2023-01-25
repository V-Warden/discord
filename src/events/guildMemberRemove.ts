import { GuildMember } from 'discord.js';
import { Event } from '../structures/Event';
import db from '../utils/database';

export default new Event('guildMemberAdd', async (member: GuildMember) => {
    if (member.user.bot) return false;

    const roles = await db.getAllRoles({ id: member.id, guild: member.guild.id });
    if (roles.length === 0) return false;

    await db.removeAllRoles({ id: member.id, guild: member.guild.id });

    return true;
});
