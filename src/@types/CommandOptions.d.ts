import { ApplicationCommandOptionData, ApplicationCommandType, PermissionString } from 'discord.js';
import { Bot } from '../classes';

export interface CommandOptions {
    client: Bot;

    name: string;

    description: string;

    /**
     * NAME         TYPE    DESCRIPTION
     * CHAT_INPUT	1	    Slash commands; a text-based command that shows up when a user types /
     * USER	        2	    A UI-based command that shows up when you right click or tap on a user
     * MESSAGE	    3	    A UI-based command that shows up when you right click or tap on a message
     */
    type: ApplicationCommandType;

    options: Array<ApplicationCommandOptionData>;

    defaultPermission: boolean;

    /**
     * Staff Role Types
     * dev
     * admin
     */
    staffRole?: string;

    /**
     * This is for in built discord permissions
     */
    permission?: PermissionString;

    /**
     * Cooldown in seconds
     */
    cooldown?: number;
}
