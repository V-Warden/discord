import {
    BaseCommandInteraction,
    MessageActionRow,
    MessageActionRowOptions,
    MessageEmbed,
    MessageEmbedOptions,
    TextBasedChannel,
} from 'discord.js';

export interface EmbedOptions {
    interaction?: BaseCommandInteraction;

    channel?: TextBasedChannel;

    content?: string;

    embed: MessageEmbed | MessageEmbedOptions;

    components?: (MessageActionRow | MessageActionRowOptions)[] | undefined;
}
