import { Message, TextChannel, DMChannel, NewsChannel } from 'discord.js'
import { sendEmbedOptions } from '../../@types'
import logger from '../logger'

export default async function ({ interaction, channel, content, embed, components, ephemeral }: sendEmbedOptions): Promise<Message | undefined> {
    const sendOpts: any = {
        embeds: [embed],
        components,
        ephemeral: ephemeral ?? false
    }
    try {
        if (content) sendOpts.content = content

        if (channel) {
            if (channel instanceof TextChannel || channel instanceof DMChannel || channel instanceof NewsChannel) {
                return await channel.send(sendOpts)
            } else {
                throw new Error('Channel is not a text-based channel and cannot send messages.')
            }
        } else if (interaction) {
            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply(sendOpts)
            } else {
                return await interaction.reply(sendOpts)
            }
        }
    } catch (e) {
        logger.error({
            labels: { action: 'sendEmbed', channelId: channel?.id },
            message: e
        })
    }

    return
}
