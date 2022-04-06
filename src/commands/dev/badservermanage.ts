import { ServerType } from '@prisma/client';
import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { enumToMap } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';

const map = enumToMap(ServerType);
const choices = Array.from(map.entries()).map(m => ({
    name: m[0],
    value: `${m[1]}`,
}));

export default class BadServerManagementCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'bsm',
            description: 'Bad Servers Management',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 1,
                    name: 'add',
                    description: 'Add a bad server (Dev)',
                    options: [
                        {
                            type: 3,
                            name: 'sid',
                            description: 'Server ID',
                            required: true,
                        },
                        {
                            type: 3,
                            name: 'name',
                            description: 'Server Name',
                            required: true,
                        },
                        {
                            type: 3,
                            name: 'type',
                            description: 'Server Type',
                            choices,
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'remove',
                    description: 'Remove a server (Dev)',
                    options: [
                        {
                            type: 3,
                            name: 'sid',
                            description: 'Server ID',
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    name: 'edit',
                    description: 'Edit a server (Dev)',
                    options: [
                        {
                            type: 3,
                            name: 'sid',
                            description: 'Server ID',
                            required: true,
                        },
                        {
                            type: 3,
                            name: 'name',
                            description: 'New Name',
                            required: true,
                        },
                    ],
                },
            ],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const name = interaction.options.data[0]?.name;
        const sid = interaction.options.get('sid')?.value as Snowflake;

        if (['add', 'remove', 'edit'].includes(name) && sid.length !== 18) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'Invalid server id provided',
                    color: 0xffff00,
                },
            });
            return false;
        }

        if (name === 'add') {
            const type = interaction.options.get('type')?.value as ServerType;
            const serverName = interaction.options.get('name')?.value as string;
            client.db.badServers
                .create({
                    data: {
                        id: sid,
                        name: serverName,
                        type,
                        addedBy: interaction.user.id,
                    },
                })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `Successfully added \`${sid}\` as a bad server`,
                            color: Colours.GREEN,
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: 'This server already exists',
                            color: Colours.YELLOW,
                        },
                    });
                });
        } else if (name === 'remove') {
            client.db.badServers
                .delete({
                    where: {
                        id: sid,
                    },
                })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `Successfully removed \`${sid}\` as a bad server`,
                            color: Colours.GREEN,
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `The server \`${sid}\` is not listed`,
                            color: Colours.YELLOW,
                        },
                    });
                });
        } else if (name === 'edit') {
            const newName = interaction.options.get('name')?.value as string;

            client.db.badServers
                .update({
                    where: {
                        id: sid,
                    },
                    data: {
                        name: newName,
                    },
                })
                .then(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `Successfully updated \`${sid}\``,
                            color: Colours.GREEN,
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `The server \`${sid}\` is not listed`,
                            color: Colours.YELLOW,
                        },
                    });
                });
        }
        return true;
    }
}
