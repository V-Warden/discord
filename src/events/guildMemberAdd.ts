import { GuildMember } from 'discord.js';
import { Bot } from '../classes/Bot';

export default async function (client: Bot, member: GuildMember) {
    const guild = member.guild;
    const settings = await client.db.guild.findUnique({
        where: { id: guild.id },
        select: { punishments: true, logChannel: true },
    });
    if (!settings) {
        client.logger.error(`guildMemberAdd ${guild.name}: Unknown guild - Owner is: ${guild.ownerId}`);
        client.logger.error(
            `CRITICAL: GUILD HAS NO SETTINGS ${guild.name} ${guild.id} - OWNER: ${member.guild.ownerId}`
        );
        return false;
    }

    if (member.user.bot) return false;

    const user = await client.db.users.findUnique({ where: { id: member.id } });
    if (!user) {
        return false;
    }
    if (user.status === 'BLACKLISTED' || user.status === 'PERM_BLACKLISTED') {
        client.logger.debug(`guildMemberAdd ${guild.name}: ${member.id} - ${user.status}`);
        client.actioning.doAction(
            user,
            settings.logChannel,
            settings.punishments,
            member,
            true,
            false,
            false
        );
        return true;
    }

    return false;
}
