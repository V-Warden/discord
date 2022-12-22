import { Message } from 'discord.js';
import { sendEmbedOptions } from '../../@types';
import logger from '../logger';

export default async function ({ interaction, channel, content, embed, components, ephemeral }: sendEmbedOptions): Promise<Message> {
    const sendOpts: any = {
        embeds: [embed],
        components,
        ephemeral: ephemeral ?? false
    };
    try {
        if (content) sendOpts.content = content;

        if (channel) {
            return await channel.send(sendOpts)
        } else if (interaction) {
            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply(sendOpts)
            } else {
                return await interaction.reply(sendOpts)
            }
        }

        throw new Error('Interaction or channel not set');
    } catch (e) {
        logger.error({
            labels: { action: 'sendEmbed', channelId: channel?.id },
            message: e
        })

        throw new Error('Invalid channel or missing permission');
    }
}
