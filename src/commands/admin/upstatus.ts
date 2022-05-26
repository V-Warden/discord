import { UserStatus, UserType } from '@prisma/client';
import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { createAuditLog } from '../../utils/db';
import { mapAnyType } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';

export default class UpStatusCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'upstatus',
            description: 'Upstatus a user in the database',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 'STRING',
                    name: 'id',
                    description: 'User ID',
                    required: true,
                },
                {
                    type: 'STRING',
                    name: 'type',
                    description: 'User Type',
                    required: true,
                    choices: mapAnyType(UserType),
                },
                {
                    type: 'STRING',
                    name: 'status',
                    description: 'User Status',
                    required: true,
                    choices: mapAnyType(UserStatus),
                },
                {
                    type: 'STRING',
                    name: 'reason',
                    description: 'Reason for upstatus',
                    required: true,
                },
            ],
            defaultPermission: false,
            staffRole: 'ADMIN',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = interaction.options.get('id')?.value as Snowflake;
        const status = interaction.options.get('status')?.value as UserStatus;
        const type = interaction.options.get('type')?.value as UserType;
        const reason = interaction.options.get('reason')?.value as string;

        if (id.length !== 18) {
            sendEmbed({
                interaction,
                hidden: true,
                embed: {
                    description: '`🔴` Invalid ID provided',
                    color: Colours.RED,
                },
            });
            return false;
        }

        const user = await client.db.users.findUnique({
            where: { id },
        });

        if (!user) {
            sendEmbed({
                interaction,
                embed: {
                    description: '`🔴` User not found in database',
                    color: Colours.RED,
                },
            });
            return false;
        }

        await client.db.users.update({ where: { id }, data: { status, type, reason } });

        sendEmbed({
            interaction,
            embed: {
                description: `\`🟢\` Successfully changed ${user.last_username} (${id}) status to \`${status}\` and type to \`${type}\``,
                color: Colours.GREEN,
            },
        });

        createAuditLog(client, {
            executedBy: interaction.user.id,
            action: 'user_updated',
            message: JSON.stringify({
                status: `${user.status} -> ${status}`,
                type: `${user.type} -> ${type}`,
                reason,
            }),
        });

        return true;
    }
}
