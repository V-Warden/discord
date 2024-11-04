import { ApplicationCommandOptionType, TextChannel } from 'discord.js';
import { Command } from '../../structures/Command';
import { sendError, sendSuccess } from '../../utils/messages';
import db from '../../utils/database';
import logger from '../../utils/logger';

export default new Command({
    name: 'globalmessage',
    description: 'Send a message to all servers',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'message',
            description: 'Message to send',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        sendSuccess(interaction, 'Starting global message');
        const smessage = interaction.options.get('message')?.value as string;
        if (!smessage) return sendError(interaction, 'Invalid message provided');

        if (!client.shard)
            return logger.warn({
                labels: { command: 'globalscan' },
                message: 'No shards online, unable to perform globalscan',
            });
    
        const guilds = await db.getAllGuilds(
            { punishments: { enabled: true, globalCheck: true } },
            { punishments: true, logChannel: true, id: true }
        );
    
        const result = await client.shard.broadcastEval(
            async (client, { dbGuilds, smessage }) => {
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
                const output: any[] = [];
    
                try {
                    await client.guilds.fetch();
                } catch (error) {
                    console.error('Error fetching guilds:', error);
                    return output;
                }
    
                const guilds = client.guilds.cache.map(x => x.id);
                const guildSettings = dbGuilds.filter(x => guilds.some(a => a === x.id));
    
                let count = 0;
                for (let i = 0; i < client.guilds.cache.size; i++) {
                    const guild = client.guilds.cache.at(i);
                    if (!guild) continue;
    
                    const settings = guildSettings.find(x => x.id === guild.id);
                    if (!settings) continue;
    
                    if (!settings.logChannel) continue;

                    const channel = (await guild.channels.fetch(settings.logChannel ?? '')) as TextChannel;
                    if (!channel) continue;

                    await delay(500);

                    if (count % 20 === 0) await delay(5000);

                    console.debug(`Sending message to ${guild.name} (${guild.id})`);

                    await channel.send({
                        embeds: [
                            {
                                title: ':shield: Notification from Warden management',
                                description: `${smessage}`,
                                color: 0xFFA500,
                            },
                        ],
                    });

                    count++;
                }
    
                return output;
            },
            { context: { dbGuilds: guilds, smessage } }
        );
    
        for (let index = 0; index < result.length; index++) {
            for (let i = 0; i < result.length; i++) {
                logger.info(result[index][i]);
            }
        }
    
        return sendSuccess(interaction, 'Global message sent to all servers');
    },
});
