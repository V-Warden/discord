import { ChannelType, GuildMember, TextChannel } from 'discord.js';
import { Event } from '../structures/Event';
import { client } from '../bot';
import actionUser from '../utils/actioning/actionUser';
import logger from '../utils/logger';
import db from '../utils/database';

export default new Event('guildMemberAdd', async (member: GuildMember) => {
    if (member.user.bot) return false;

    const { guild } = member;
    const settings = await db.getGuild({ id: guild.id }, { punishments: true, logChannel: true });

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

            await db.createGuild({
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
        return false;
    }

    if (!settings.logChannel || !settings.punishments)
        return logger.info({
            labels: { event: 'guildMemberAdd', guildId: guild.id },
            message: 'Guild has no settings or a log channel set',
        });

    if (!settings.punishments?.enabled)
        return logger.info({
            labels: { event: 'guildMemberAdd', guildId: guild.id },
            message: 'Guild has punishments disabled',
        });

    const user = await db.getUser(member.id);
    if (!user) return false;
    if (user.status === 'BLACKLISTED' || user.status === 'PERM_BLACKLISTED') {
        await actionUser(client, guild, settings.logChannel, settings.punishments, user);
    }

    return true;
});
