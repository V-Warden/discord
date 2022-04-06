import { UserStatus } from '@prisma/client';
import { GuildMember } from 'discord.js';
import { Bot } from '../classes/Bot';
import { getGuild } from '../utils/guild';
import { getUser } from '../utils/users';
import { punishUser } from '../utils/users/punishUser';

export default async function (client: Bot, member: GuildMember) {
    const guild = member.guild;
    const settings = await getGuild({ client, id: guild.id });

    if (!settings) {
        client.logger.error(`guildMemberAdd ${guild.name}: Unknown guild - Owner is: ${guild.ownerId}`);
        client.logger.error(
            `CRITICAL: GUILD HAS NO SETTINGS ${guild.name} ${guild.id} - OWNER: ${member.guild.ownerId}`
        );
        return false;
    }

    const user = await getUser({ client, id: member.id });
    if (!user) {
        return false;
    }

    // Dynamically set this in future?
    if (user.status === UserStatus.BLACKLIST || user.status === UserStatus.PERM_BLACKLIST) {
        client.logger.debug(`guildMemberAdd ${guild.name}: ${member.id} - ${user.status}`);
        punishUser({
            client,
            member,
            guildInfo: settings,
            oldUser: user,
            toDM: true,
        });
        return true;
    }

    return false;
}
