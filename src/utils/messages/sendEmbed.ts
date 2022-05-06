import { EmbedOptions } from '../../@types';

export async function sendEmbed({
    interaction,
    channel,
    content,
    embed,
    components,
    hidden,
}: EmbedOptions) {
    const options: any = {
        embeds: [{ ...embed }],
        components,
    };

    if (content) options.content = content;
    if (channel) return await channel.send(options);
    else {
        if (interaction.deferred || interaction.replied)
            return await interaction.editReply({ ...options, ...{ ephemeral: hidden } });
        else return await interaction.reply({ ...options, ...{ ephemeral: hidden } });
    }
}
