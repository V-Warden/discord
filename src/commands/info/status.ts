import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { formatSeconds } from '../../utils/misc';
import { sendError } from '../../utils/messages';
import db from '../../utils/database';
import logger from '../../utils/logger';
import sendEmbed from '../../utils/messages/sendEmbed';
import {lruInfinity, lru1Hour, setCache, getCache, hasCache} from '../../utils/cache';

export default new Command({
    name: 'status',
    description: 'Shows bot status and stats about its services',
    run: async ({ interaction, client }) => {
        const botStartTime = Number(await getCache('botStartTime', lruInfinity));
        const uptime = Math.floor((Date.now() - botStartTime) / 1000);

        const getBlacklistedData = async () => {
            const hasBlacklistedUsers = await hasCache('blacklistedUsers', lru1Hour) 
            const hasBlacklistedServers = await hasCache('blacklistedServers', lru1Hour);

            if (!hasBlacklistedUsers || !hasBlacklistedServers) {
                logger.info({
                    labels: { command: 'status', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: `Blacklisted data not found in cache, fetching from database`,
                });
                const blacklistedUsersPromise = db.countAllBlacklistedUsers();
                const blacklistedServersPromise = db.countAllBlacklistedServers();

                const [blacklistedUsers, blacklistedServers] = await Promise.all([
                    blacklistedUsersPromise,
                    blacklistedServersPromise,
                ]);

                await setCache('blacklistedUsers', blacklistedUsers, lru1Hour);
                await setCache('blacklistedServers', blacklistedServers, lru1Hour);
            }
        }
        await getBlacklistedData();

        const blacklistedUsers = Number(await getCache('blacklistedUsers', lru1Hour));
        const blacklistedServers = Number(await getCache('blacklistedServers', lru1Hour));

        const res = await client.shard?.broadcastEval(client => {
            return {
                guilds: client.guilds.cache.size,
            };
        });

        if (!res) return sendError(interaction, 'No shards available..?');

        const guilds = res.reduce((a, b) => a + b.guilds, 0);

        logger.info({
            labels: { command: 'status', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) requested bot status`,
        });

        return sendEmbed({
            interaction,
            embed: {
                title: ':desktop: Bot Status',
                color: Colours.BLUE,
                fields: [
                    {
                        name: 'Shard Count',
                        value: `I am using ${client.shard?.count ?? 0} shard(s)`,
                        inline: false,
                    },
                    {
                        name: 'Protected Guilds',
                        value: `I am watching ${guilds} guilds`,
                        inline: false,
                    },
                    {
                        name: 'Blacklisted Accounts',
                        value: `I am blocking ${blacklistedUsers.toLocaleString()} discord accounts`,
                        inline: false,
                    },
                    {
                        name: 'Blacklisted Servers',
                        value: `I have ${blacklistedServers.toLocaleString()} blacklisted servers`,
                        inline: false,
                    },
                    {
                        name: 'Queue Length',
                        value: `I have ${(await getCache('actionQueue', lruInfinity) || 0) + (await getCache('consumerCount', lruInfinity) || 0)} users in the queue`,
                        inline: false,
                    },
                    {
                        name: 'Queue Processed',
                        value: `I have processed ${await getCache('actionMessages', lruInfinity) || 0} users`,
                        inline: false,
                    },
                    {
                        name: 'Bot Uptime',
                        value: `I have been up for ${formatSeconds(uptime)}`,
                        inline: false,
                    },
                    {
                        name: 'Memory Usage',
                        value: `I am currently using ${
                            Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
                        } MB.`,
                        inline: false,
                    },
                ],
                footer: {
                    text: `Shard: ${client.shard?.ids[0]}`,
                },
            },
        });
    },
});
