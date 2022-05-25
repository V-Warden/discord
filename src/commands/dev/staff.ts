import { BaseCommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { createAuditLog } from '../../utils/db';
import { sendEmbed } from '../../utils/messages';

export default class StaffCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'staff',
            description: 'Manage Bot Staff',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 1,
                    name: 'add',
                    description: 'Add a Bot Admin',
                    options: [
                        {
                            type: 'USER',
                            name: 'user',
                            description: 'User',
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'remove',
                    description: 'Remove a Bot Admin',
                    options: [
                        {
                            type: 'USER',
                            name: 'user',
                            description: 'User',
                            required: true,
                        },
                    ],
                },
            ],
            defaultPermission: false,
            staffRole: 'DEV',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const name = interaction.options.data[0]?.name;
        const id = interaction.options.getUser('user').id;

        if (name === 'add') {
            client.db.staff
                .create({ data: { id, role: 'ADMIN' } })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `\`🟢\` Successfully added <@${id}>`,
                            color: Colours.GREEN,
                        },
                    });

                    createAuditLog(client, {
                        executedBy: interaction.user.id,
                        action: 'staff_member_added',
                        message: JSON.stringify({
                            added: `${id}`,
                            role: 'ADMIN',
                        }),
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: '`🔴` That user is already an admin',
                            color: Colours.RED,
                        },
                    });
                });
        } else if (name === 'remove') {
            client.db.staff
                .update({ where: { id }, data: { role: 'EXSTAFF' } })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `\`🟢\` Successfully removed <@${id}>`,
                            color: Colours.GREEN,
                        },
                    });
                    createAuditLog(client, {
                        executedBy: interaction.user.id,
                        action: 'staff_member_removed',
                        message: JSON.stringify({
                            added: `${id}`,
                            newRole: 'EXSTAFF',
                        }),
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: '`🔴` That user is not an admin',
                            color: Colours.RED,
                        },
                    });
                });
        }

        return true;
    }
}
