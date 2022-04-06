import { Guild } from 'discord.js';
import { Bot } from '../../classes';

export async function createGuild({
    client,
    guild,
    logchan,
}: {
    client: Bot;
    guild: Guild;
    logchan: string;
}) {
    const exists = await client.db.guild.findUnique({ where: { id: guild.id } });
    if (!exists) {
        return await client.db.guild
            .create({
                data: {
                    id: guild.id,
                    name: guild.name,
                    logchan: logchan,
                },
            })
            .catch();
    } else {
        return false;
    }
}
