import { EmbedOptions } from '../../@types';

export async function sendEmbed({ interaction, channel, content, embed, components }: EmbedOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
        embeds: [{ ...embed }],
        components,
    };

    try {
        if (content) options.content = content;
        if (channel) return await channel.send(options);
        else if (interaction) {
            if (!interaction.deferred) await interaction?.deferReply();
            return await interaction.editReply(options);
        }
        return null;
    } catch (e) {
        console.log(e);
        console.log(`sendEmbed: Unknown interaction ${interaction}`);
        return null;
    }
}
