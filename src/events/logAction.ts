import { MessageEmbedOptions, TextBasedChannel } from 'discord.js';
import { Bot } from '../classes/Bot';
import { sendEmbed } from '../utils/messages';
import data from '../config.json';
import { Colours, LogInfo, LogTypes } from '../@types';

export default async function (client: Bot, info: LogInfo) {
    let channel: TextBasedChannel;

    const embed: MessageEmbedOptions = {
        author: {
            name: `${info.author.username}#${info.author.discriminator}`,
            icon_url: info.author.displayAvatarURL(),
        },
        description: info.message,
        color: Colours.GREEN,
    };

    if (info.type === LogTypes.ADD_USER) {
        channel = await getChannel(client, data.CHANNEL_ADDUSERS);
    } else if (info.type in [LogTypes.APPEALED, LogTypes.STATUS_UPDATE]) {
        channel = await getChannel(client, data.CHANNEL_LOG);
    }

    if (!channel) return false;
    sendEmbed({
        channel,
        embed,
    }).catch(() => `logAction: Unable to send message in ${channel.id}`);
    return true;
}

async function getChannel(client: Bot, chan: string) {
    const channel = (await client.channels.fetch(chan)) as TextBasedChannel;
    if (!channel) {
        client.logger.error(`logAction: ${chan} channel not set or found`);
        return null;
    }
    return channel;
}
