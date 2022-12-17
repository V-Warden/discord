import { Message } from 'discord.js';
import { sendEmbedOptions } from '../../@types';

export default async function ({ interaction, channel, content, embed, components, ephemeral }: sendEmbedOptions): Promise<Message> {
    const sendOpts: any = {
        embeds: [embed],
        components,
        ephemeral: ephemeral ?? false
    };

    if (content) sendOpts.content = content;
    if (channel) return await channel.send(sendOpts);
    if (interaction) {
        if (interaction.deferred || interaction.replied) {
            return await interaction.editReply(sendOpts)
        } else {
            return await interaction.reply(sendOpts)
        }
    }

    throw new Error('Interaction or channel not set');
}
