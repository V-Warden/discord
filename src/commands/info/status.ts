import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { formatSeconds } from '../../utils/misc';
import { sendError } from '../../utils/messages';
import { totalQueue, processedMessage } from '../../utils/queues/queueActionReceive';
import db from '../../utils/database';
import logger from '../../utils/logger';
import sendEmbed from '../../utils/messages/sendEmbed';

// Store the bot start time
const botStartTime = Date.now();

export default new Command({
    name: 'status',
    description: 'Shows bot status and stats about its services',
    run: async ({ interaction, client }) => {
        const uptime = Math.floor((Date.now() - botStartTime) / 1000);

        // Could optimise this by caching result and storing for x minutes?
        const blacklistedUsersPromise = db.countAllBlacklistedUsers();
        const blacklistedServersPromise = db.countAllBlacklistedServers();

        const [blacklistedUsers, blacklistedServers] = await Promise.all([
            blacklistedUsersPromise,
            blacklistedServersPromise,
        ]);
        // ---- //

        const res = await client.shard?.broadcastEval(client => {
            return {
                guilds: client.guilds.cache.size,
            };
        });

        if (!res) return sendError(interaction, 'No shards available..?');

        const guilds = res.reduce((a, b) => a + b.guilds, 0);

        logger.info({
            labels: { command: 'status', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} requested bot status`,
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
                        value: `I have ${await totalQueue()} users in the queue`,
                        inline: false,
                    },
                    {
                        name: 'Queue Processed',
                        value: `I have processed ${await processedMessage()} users`,
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
