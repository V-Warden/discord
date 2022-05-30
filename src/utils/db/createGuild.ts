import { Guild, TextChannel } from 'discord.js';
import { Bot } from '../../classes';

/**
 * Create a guild and punishments
 */
export async function createGuild(client: Bot, guild: Guild) {
    const channel = (await guild.channels.fetch()).filter(chan => chan.isText()).first() as TextChannel;

    return await client.db.guild.upsert({
        where: {
            id: guild.id,
        },
        create: {
            id: guild.id,
            name: guild.name,
            logChannel: channel.id,
            punishments: {
                create: {},
            },
        },
        update: {},
    });
}
