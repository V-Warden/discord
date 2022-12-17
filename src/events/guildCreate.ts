import { ChannelType, TextChannel } from 'discord.js';
import { Colours } from '../@types/Colours';
import { client } from '../bot';
import { Event } from '../structures/Event';
import logger from '../utils/logger';
import sendEmbed from '../utils/messages/sendEmbed';

export default new Event('guildCreate', async guild => {
    try {
        await guild.channels.fetch();
        const channel = guild.channels.cache
            .filter(chan => chan?.type === ChannelType.GuildText)
            .first() as TextChannel;

        if (!channel) return;

        await client.prisma.createGuild({
            id: guild.id,
            name: guild.name,
            logChannel: channel.id,
            punishments: {
                create: {},
            },
        });

        await sendEmbed({
            channel,
            embed: {
                title: `Hello ${guild.name}!`,
                description: `My name is VVarden!
                      You can call me Warden or 5 Warden (V Warden).
                      \nThank you for inviting me to your Discord Server!
                      I'm trying to make the CFX Community a better place.
                      \nMake sure to check my configuration settings by using \`/config\` command!
                      I also need to have the permissions to kick and ban members, with a role higher than them!
                      \nIf you want to contribute to the project, use the Official Discord: <https://discord.gg/jeFeDRasfs>`,
                color: Colours.GREEN,
            },
        });
    } catch (e) {
        logger.error({
            labels: { guildId: guild.id },
            message: e,
        });
    }
    return;
});
