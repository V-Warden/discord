import { UserStatus, UserType } from '@prisma/client';
import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { enumToMap } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';
import { updateStatus } from '../../utils/users';

const map = enumToMap(UserStatus);
const choices = Array.from(map.entries()).map(m => ({
    name: m[0],
    value: `${m[1]}`,
}));

const mapa = enumToMap(UserType);
const choicesa = Array.from(mapa.entries()).map(m => ({
    name: m[0],
    value: `${m[1]}`,
}));

export default class UpstatusCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'upstatus',
            description: 'Update user status in the database',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'userid',
                    description: 'User ID to check',
                    required: false,
                },
                {
                    type: 6,
                    name: 'user',
                    description: 'User Mention to check',
                    required: false,
                },
                {
                    type: 3,
                    name: 'status',
                    description: 'New Status of User',
                    choices,
                    required: false,
                },
                {
                    type: 3,
                    name: 'type',
                    description: 'New User Type',
                    choices: choicesa,
                    required: false,
                },
                {
                    type: 3,
                    name: 'reason',
                    description: 'Reason for upstatus',
                    required: false,
                },
                {
                    type: 3,
                    name: 'appeals',
                    description: 'Appeal count',
                    required: false,
                },
            ],
            defaultPermission: true,
            staffRole: 'admin',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        if (client.processing.isProcessing()) {
            client.processing.disabledMessage(interaction);
            return false;
        }

        const id = (interaction.options.getUser('user')?.id ||
            interaction.options.get('userid')?.value) as Snowflake;

        const status = interaction.options.get('status')?.value as UserStatus;
        const user_type = interaction.options.get('type')?.value as UserType;
        const reason = interaction.options.get('reason')?.value as string;
        const appeals = interaction.options.get('appeals')?.value as string;

        if (!id) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'You must provided either a user or user id',
                    color: 0xffff00,
                },
            });
            return false;
        }

        if (!status || !reason || !user_type) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'You must provided all arguments',
                    color: 0xffff00,
                },
            });
            return false;
        }

        let promise;
        if (!appeals) {
            promise = updateStatus({ client, id, status, user_type, reason });
        } else {
            promise = updateStatus({
                client,
                id,
                status,
                user_type,
                reason,
                appeals: parseInt(appeals),
            });
        }
        promise
            .then(u => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: `Updated ${u.last_username} (${id}) to status \`${status}\`, type \`${user_type}\` with reason: \`${reason}\``,
                        author: {
                            name: `${interaction.user.username}#${interaction.user.discriminator}`,
                            icon_url: interaction.user.displayAvatarURL(),
                        },
                        color: Colours.GREEN,
                    },
                });
                client.emit('logAction', {
                    type: 'STATUS_UPDATE',
                    author: interaction.user,
                    details: `${interaction.user.username}#${interaction.user.discriminator} updated status for ${u.last_username} (${id})
                    User Status: ${status}
                    User Type: ${user_type}
                    Reason: ${reason}`,
                });
            })
            .catch(() => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: '`🟡` That user was not found in the database.',
                        color: Colours.YELLOW,
                    },
                });
            });
        return true;
    }
}
