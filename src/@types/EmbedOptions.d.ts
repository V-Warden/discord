import {
    CommandInteraction,
    MessageActionRow,
    MessageActionRowOptions,
    MessageEmbed,
    MessageEmbedOptions,
    TextBasedChannel,
} from 'discord.js';

export interface EmbedOptions {
    interaction?: CommandInteraction;

    channel?: TextBasedChannel;

    content?: string;

    embed: MessageEmbed | MessageEmbedOptions;

    components?: (MessageActionRow | MessageActionRowOptions)[] | undefined;

    hidden?: boolean;
}
