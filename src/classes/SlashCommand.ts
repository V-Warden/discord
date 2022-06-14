import { StaffRoles } from '@prisma/client';
import {
    ApplicationCommandOptionData,
    ApplicationCommandType,
    PermissionString,
    CommandInteraction,
} from 'discord.js';
import { CommandOptions } from '../@types/CommandOptions';
import { Bot } from './Bot';

/**
 * SlashCommand Class
 * This is the base of all commands
 */
export abstract class SlashCommand implements CommandOptions {
    client: Bot;
    name: string;
    description: string;
    type: ApplicationCommandType;
    options: ApplicationCommandOptionData[];
    defaultPermission: boolean;
    staffRole?: StaffRoles;
    permission?: PermissionString;
    cooldown?: number;

    constructor(opts: CommandOptions) {
        this.client = opts.client;
        this.name = opts.name;
        this.description = opts.description;
        this.type = opts.type;
        this.options = opts.options;
        this.defaultPermission = opts.defaultPermission;
        this.staffRole = opts.staffRole;
        this.permission = opts.permission;
        this.cooldown = opts.cooldown;
    }
    public abstract run(client: Bot, interaction: CommandInteraction): Promise<boolean>;
}
