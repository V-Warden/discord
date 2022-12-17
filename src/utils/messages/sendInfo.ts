import { CommandInteraction, Message } from 'discord.js';
import { Colours } from '../../@types/Colours';
import logger from '../logger';
import sendEmbed from './sendEmbed';

export function sendSuccess(interaction: CommandInteraction, message: string): Promise<Message> {
    return sendEmbed({
        interaction,
        embed: {
            description: `\`🟢\` ${message}`,
            color: Colours.GREEN,
        },
        ephemeral: true,
    });
}

export function sendError(interaction: CommandInteraction, message: string): Promise<Message> {
    return sendEmbed({
        interaction,
        embed: {
            description: `\`🔴\` ${message}`,
            color: Colours.RED,
        },
        ephemeral: true,
    });
}
