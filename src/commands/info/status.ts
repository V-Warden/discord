import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import sendEmbed from '../../utils/messages/sendEmbed';
import { formatSeconds } from '../../utils/misc';
import db from '../../utils/database';
import { sendError } from '../../utils/messages';

export default new Command({
    name: 'status',
    description: 'Shows bot status and stats about its services',
    run: async ({ interaction, client }) => {
        const uptime = process.uptime();

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
        return sendEmbed({
            interaction,
            embed: {
                title: ':desktop: Bot Status',
                color: Colours.GREEN,
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
