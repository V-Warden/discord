import { ServerType } from '@prisma/client';
import { CommandInteraction, Invite } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { createAuditLog } from '../../utils/db';
import { sendEmbed } from '../../utils/messages';

export default class BadServerManagementCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'bsm',
            description: 'Bad Servers Management',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 'SUB_COMMAND',
                    name: 'add',
                    description: 'Add a bad server',
                    options: [
                        {
                            type: 'STRING',
                            name: 'invite',
                            description: 'Server Invite',
                            required: true,
                        },
                        {
                            type: 'STRING',
                            name: 'type',
                            description: 'Server Type',
                            choices: [
                                {
                                    name: 'Cheating',
                                    value: 'CHEATING',
                                },
                                {
                                    name: 'Leaking',
                                    value: 'LEAKING',
                                },
                                {
                                    name: 'Reselling',
                                    value: 'RESELLING',
                                },
                                {
                                    name: 'Advertising',
                                    value: 'ADVERTISING',
                                },
                            ],
                            required: true,
                        },
                    ],
                },
                {
                    type: 'SUB_COMMAND',
                    name: 'remove',
                    description: 'Remove a bad server',
                    options: [
                        {
                            type: 'STRING',
                            name: 'id',
                            description: 'Server ID',
                            required: true,
                        },
                    ],
                },
            ],
            defaultPermission: false,
            staffRole: 'DEV',
        });
    }

    public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
        const name = interaction.options.data[0]?.name;

        if (name === 'add') {
            const invite = interaction.options.get('invite')?.value as string;
            const type = interaction.options.get('type')?.value as ServerType;
            let server: Invite = null;

            try {
                server = await client.fetchInvite(invite);
            } catch {
                sendEmbed({
                    interaction,
                    hidden: true,
                    embed: {
                        description: '`🔴` Invalid invite provided',
                        color: Colours.RED,
                    },
                });
                return false;
            }

            const exists = await client.db.badServers.findUnique({ where: { id: server.guild.id } });

            if (exists) {
                let message = '`🔴` This server already exists';
                if (exists.name !== server.guild.name) {
                    const newOldNames = exists.oldNames ? exists.oldNames.split('<>') : [];
                    newOldNames.push(exists.name);
                    await client.db.badServers.update({
                        where: { id: server.guild.id },
                        data: { name: server.guild.name, oldNames: newOldNames.join('<>'), invite },
                    });
                    createAuditLog(client, {
                        executedBy: interaction.user.id,
                        action: 'bad_server_updated',
                        message: JSON.stringify({
                            id: server.guild.id,
                            newName: server.guild.name,
                            oldName: exists.name,
                            invite,
                            type: 'AUTOMATIC',
                        }),
                    });

                    message = `\`🔴\` This server already exists but under a new name, I have automatically updated this. \`\`\`New Name: ${server.guild.name}\nOld Name: ${exists.name}\`\`\``;
                }
                sendEmbed({
                    interaction,
                    embed: {
                        description: message,
                        color: Colours.RED,
                    },
                });
            } else {
                client.db.badServers
                    .create({
                        data: {
                            id: server.guild.id,
                            name: server.guild.name,
                            type,
                            invite,
                            staff: {
                                connect: {
                                    id: interaction.user.id,
                                },
                            },
                        },
                    })
                    .then(() => {
                        sendEmbed({
                            interaction,
                            embed: {
                                description: `Successfully added \`${server.guild.id}\` - \`${server.guild.name}\` as a bad server`,
                                color: Colours.GREEN,
                            },
                        });
                        createAuditLog(client, {
                            executedBy: interaction.user.id,
                            action: 'bad_server_added',
                            message: JSON.stringify({
                                id: server.guild.id,
                                name: server.guild.name,
                            }),
                        });
                    });
            }
        } else if (name === 'remove') {
            const id = interaction.options.get('id')?.value as string;

            client.db.imports
                .deleteMany({ where: { server: id } })
                .then(() => {
                    client.db.badServers
                        .delete({ where: { id } })
                        .then(() => {
                            sendEmbed({
                                interaction,
                                embed: {
                                    description: `\`🟢\` Successfully removed \`${id}\` from the bad servers`,
                                    color: Colours.GREEN,
                                },
                            });

                            createAuditLog(client, {
                                executedBy: interaction.user.id,
                                action: 'bad_server_removed',
                                message: JSON.stringify({
                                    id: id,
                                }),
                            });
                        })
                        .catch(() => {
                            sendEmbed({
                                interaction,
                                embed: {
                                    description: '`🔴` That id is currently not listed as a bad server',
                                    color: Colours.RED,
                                },
                            });
                        });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: '`🔴` That id is currently not listed as a bad server',
                            color: Colours.RED,
                        },
                    });
                });
        }
        return true;
    }
}
