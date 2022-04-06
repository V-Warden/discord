import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class CheckServerCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'checkserver',
            description: 'Check if a server is bad',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'id',
                    description: 'Server ID to check',
                    required: false,
                },
                {
                    type: 3,
                    name: 'name',
                    description: 'Server Name to check',
                    required: false,
                },
            ],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const sid = interaction.options.get('id')?.value as Snowflake;
        const sname = interaction.options.get('name')?.value as string;

        if (!sid && !sname) {
            sendEmbed({
                interaction,
                embed: {
                    description: '`🟡` You must provide either a name or id to check',
                    color: Colours.YELLOW,
                },
            });
            return false;
        }

        if (sid && sid.length !== 18) {
            sendEmbed({
                interaction,
                embed: {
                    description: '`🟡` Invalid server id provided',
                    color: Colours.YELLOW,
                },
            });
            return false;
        }

        if (sname && sname.length <= 3) {
            sendEmbed({
                interaction,
                embed: {
                    description: '`🟡` Name must be greater than 3 characters long',
                    color: Colours.YELLOW,
                },
            });
            return false;
        }

        if (sid) {
            client.db.badServers
                .findFirst({ where: { id: sid } })
                .then(server => {
                    const addedBy = /^\d+$/.test(server.addedBy)
                        ? `<@${server.addedBy}>`
                        : server.addedBy;
                    sendEmbed({
                        interaction,
                        embed: {
                            title: ':shield: Server Blacklisted',
                            color: Colours.RED,
                            fields: [
                                {
                                    name: 'Server Information',
                                    value: `**ID**: ${server.id} / **Name**: ${server.name}\n
                                **Details**: ${server.type.toLowerCase()}\n
                                **Date Added**: ${server.createdAt
                                    .toISOString()
                                    .replace(/T/, ' ')
                                    .replace(/\..+/, '')}\n
                                **Added By**: ${addedBy}`,
                                },
                            ],
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: '`🟢` Server ID not found in the database',
                            color: Colours.GREEN,
                        },
                    });
                });
        } else {
            client.db.badServers
                .findFirst({
                    where: {
                        name: {
                            contains: sname,
                        },
                    },
                })
                .then(server => {
                    const addedBy = /^\d+$/.test(server.addedBy)
                        ? `<@${server.addedBy}>`
                        : server.addedBy;
                    sendEmbed({
                        interaction,
                        embed: {
                            title: ':shield: Server Blacklisted',
                            color: Colours.RED,
                            fields: [
                                {
                                    name: 'Server Information',
                                    value: `**ID**: ${server.id} / **Name**: ${server.name}\n
                            **Details**: ${server.type.toLowerCase()}\n
                            **Date Added**: ${server.createdAt
                                .toISOString()
                                .replace(/T/, ' ')
                                .replace(/\..+/, '')}\n
                            **Added By**: ${addedBy}`,
                                },
                            ],
                        },
                    });
                })
                .catch(() => {
                    sendEmbed({
                        interaction,
                        embed: {
                            description: '`🟢` No servers containing that name appear in the database',
                            color: Colours.GREEN,
                        },
                    });
                });
        }

        return true;
    }
}
