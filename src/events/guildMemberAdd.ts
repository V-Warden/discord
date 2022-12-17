import { ChannelType, GuildMember, TextChannel } from 'discord.js';
import { ExtendedClient } from '../structures/Client';
import { Event } from '../structures/Event';
import { client } from '../bot';
import actionUser from '../utils/actioning/actionUser';
import logger from '../utils/logger';

export default new Event('guildMemberAdd', async (member: GuildMember) => {
    if (member.user.bot) return;

    const guild = member.guild;
    const settings = await client.prisma.getGuild({ id: guild.id }, { punishments: true, logChannel: true });

    if (!settings) {
        try {
            logger.error({ guildId: guild.id, message: 'Guild has no settings, creating' });
            await guild.channels.fetch();
            const channel = guild.channels.cache
                .filter(chan => chan?.type === ChannelType.GuildText)
                .first() as TextChannel;
            if (!channel)
                return logger.error({
                    guildId: guild.id,
                    message: 'Guild has no text channels, cancelling creation',
                });

            await client.prisma.createGuild({
                id: guild.id,
                name: guild.name,
                logChannel: channel.id,
                punishments: {
                    create: {},
                },
            });
        } catch (e) {
            logger.error({
                labels: { guildId: guild.id },
                message: e,
            });
        }
        return;
    }

    const user = await client.prisma.getUser(member.id);
    if (!user) return;
    if (!settings.logChannel || !settings.punishments) return;
    if (user.status === 'BLACKLISTED' || user.status === 'PERM_BLACKLISTED') {
        await actionUser(client, guild, settings.logChannel, settings.punishments, user);
        return true;
    }

    return;
});
