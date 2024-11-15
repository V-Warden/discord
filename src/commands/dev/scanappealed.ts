import { ApplicationCommandOptionType, ChannelType, TextChannel } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/database';
import { sendError, sendSuccess } from '../../utils/messages';
import logger from '../../utils/logger';
import { Users } from '@prisma/client';

export default new Command({
    name: 'scanappealed',
    description: 'Removes all bans in a specified guild for appealed users (fixes legacy)',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'id',
            description: 'Guild ID',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        const id = interaction.options.get('id')?.value as string;
        if (!client.shard) {
            logger.warn({
                labels: { command: 'scanappealed', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: 'No shards online, unable to run this command',
            });
            return sendError(interaction, 'No shards online, unable to run this command');
        }

        const settings = await db.getGuild({ id: id }, { punishments: true });
        if (!settings) return sendError(interaction, 'Unable to find guild in the database');

        const result = await client.shard.broadcastEval(
            async (c, { guildId }) => {
                await c.guilds.fetch().catch(e => {
                    logger.error({
                        labels: { command: 'scanappealed', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    });
                });

                const guild = c.guilds.cache.find(x => x.id === guildId);
                if (!guild) return { guild: false };

                await guild.bans.fetch().catch(e => {
                    logger.error({
                        labels: { command: 'scanappealed', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    });
                });
                await guild.members.fetch().catch(e => {
                    logger.error({
                        labels: { command: 'scanappealed', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    });
                });

                const bans = guild.bans.cache.map(x => {
                    return { id: x.user.id, reason: x.reason };
                });

                const bannedUsers: string[] = [];

                for (let index = 0; index < bans.length; index++) {
                    const ban = bans[index];
                    if (!ban.reason) continue;
                    if (ban.reason.includes('Warden - User Type')) {
                        bannedUsers.push(ban.id);
                    }
                }

                return { bannedUsers, guild: true };
            },
            { context: { guildId: id } }
        );

        let users: Users[] = [];

        for (let i = 0; i < result.length; i++) {
            if (!result[i].guild) continue;

            users = await db.getManyUsers({
                id: { in: result[i].bannedUsers },
                status: 'APPEALED',
            });
            if (users.length === 0) {
                return sendError(interaction, 'Guild has no people appealed who are banned');
            }
        }
        if (users.length === 0) return false;

        const res = await client.shard.broadcastEval(
            async (c, { guildId, users }) => {
                await c.guilds.fetch().catch(e => {
                    logger.error({
                        labels: { command: 'scanappealed', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    });
                });

                const guild = c.guilds.cache.find(x => x.id === guildId);
                if (!guild) return { guild: false };

                let count = 0;
                const unbanned: string[] = [];
                for (let index = 0; index < users.length; index++) {
                    const user = users[index];
                    try {
                        await guild.bans.remove(user.id, 'Appealed');
                        unbanned.push(user.id);
                        count += 1;
                    } catch (e) {
                        logger.warn({
                            labels: { command: 'scanappealed', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                            message: e instanceof Error ? e.message : JSON.stringify(e),
                        });
                    }
                }

                let message = `Unbanned ${count} users`;
                if (users.length - count > 0)
                    message = `${message}, ${users.length - count} were unable to be unbanned`;

                return { guild: true, message, unbanned };
            },
            { context: { guildId: id, users: users } }
        );

        for (let x = 0; x < res.length; x++) {
            if (!res[x].guild) continue;

            try {
                await db.removeAllBans({ id: { in: res[x].unbanned }, guild: id });

                logger.info({
                    labels: { command: 'scanappealed', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: res[x].message,
                });

                sendSuccess(interaction, `${res[x].message}`);
            } catch (e) {
                sendSuccess(
                    interaction,
                    `${res[x].message}, however I could not remove these from the database; please run the following manually to double check
\`\`\`sql
SELECT b.id, b.guild FROM Bans b INNER JOIN Users u WHERE u.id = b.id AND b.guild = '${id}' AND u.\`status\` = 'APPEALED'
\`\`\``
                );
                logger.warn({
                    labels: { command: 'scanappealed', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                });
            }
        }

        return false;
    },
});
