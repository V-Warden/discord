/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import { Colours, ProcessingData } from '../@types';
import { sendEmbed } from '../utils/messages';
import { BaseCommandInteraction, TextChannel } from 'discord.js';
import { UserType } from '@prisma/client';
import { Bot } from './Bot';
import { createAuditLog } from '../utils/db';
import { findHighestType } from '../utils/helpers';

export class Processing {
    client: Bot;
    processState: number;
    serverCount: number;
    blacklisted: number;
    permblacklisted: number;

    constructor(client: Bot) {
        this.processState = 0;
        this.serverCount = 0;
        this.blacklisted = 0;
        this.permblacklisted = 0;
        this.client = client;
    }

    isProcessing() {
        return this.processState === 1;
    }

    setProcessing(int: number) {
        this.processState = int;
    }

    setBlacklisted(int: number) {
        this.blacklisted = int;
    }

    setPermBlacklisted(int: number) {
        this.permblacklisted = int;
    }

    reset() {
        this.serverCount = 0;
        this.processState = 0;
    }

    getServerCount() {
        return this.serverCount;
    }

    getFiles() {
        try {
            const dir = fs.readdirSync('./imports');
            return dir;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    async processData(executedBy: string): Promise<boolean> {
        const start = process.hrtime.bigint();
        const dir = await this.getFiles();
        if (!dir) {
            return false;
        }
        this.processState = 1;
        const guilds: string[] = [];
        for await (const filename of dir) {
            fs.readFile(`./imports/${filename}`, 'utf8', async (err, response) => {
                if (err) {
                    console.error(err);
                    return;
                }
                const data = JSON.parse(response);
                for (let i = 0, l = data.length; i < l; ++i) {
                    const user: ProcessingData = data[i];
                    let user_type;
                    if (!guilds.includes(user.server)) guilds.push(user.server);

                    if (
                        user['permissions'].includes('ADMINISTRATOR') ||
                        user['permissions'].includes('KICK_MEMBERS') ||
                        user['permissions'].includes('BAN_MEMBERS') ||
                        user['permissions'].includes('MANAGE_GUILD')
                    )
                        user_type = UserType.OWNER;
                    else if (user['is_boosting'] !== false && user['server_type'] !== 'RESELLING')
                        user_type = UserType.SUPPORTER;
                    else if (user['server_type'] === 'LEAKING') user_type = UserType.LEAKER;
                    else if (user['server_type'] === 'CHEATING') user_type = UserType.CHEATER;
                    else user_type = UserType.OTHER;
                    const exists = await this.client.db.users.findUnique({ where: { id: user.id } });
                    const allImports = (
                        await this.client.db.imports.findMany({
                            where: { id: user.id, appealed: false },
                            select: { type: true },
                        })
                    ).map(x => x.type);
                    allImports.push(user_type);

                    const highest = findHighestType(allImports);
                    if (!exists) {
                        await this.client.db.users.create({
                            data: {
                                id: user.id,
                                last_username: user.username,
                                avatar: user.avatar,
                                type: user_type,
                                status: 'BLACKLISTED',
                            },
                        });
                    } else {
                        await this.client.db.users.update({
                            where: {
                                id: user.id,
                            },
                            data: {
                                last_username: user.username,
                                avatar: user.avatar,
                                status:
                                    exists.status === 'APPEALED' ? 'PERM_BLACKLISTED' : 'BLACKLISTED',
                                type: highest,
                            },
                        });
                    }
                    await this.client.db.imports.upsert({
                        where: {
                            id_server: {
                                id: user.id,
                                server: user.server,
                            },
                        },
                        create: {
                            id: user.id,
                            server: user.server,
                            roles: user.roles,
                            type: user_type,
                            appealed: false,
                        },
                        update: {
                            roles: user.roles,
                            type: highest,
                            appealed: false,
                        },
                    });
                    if (i === data.length - 1) {
                        this.processState = 0;
                        const end = Number(process.hrtime.bigint() - start);
                        createAuditLog(this.client, {
                            executedBy,
                            action: 'procfile_finish',
                            message: JSON.stringify({
                                took: `${end / 1000000000}s`,
                            }),
                        });
                    }
                }

                this.serverCount = guilds.length;
            });
        }
        return false;
    }

    sendCompletionMsg(interaction: BaseCommandInteraction, chan: TextChannel) {
        sendEmbed({
            channel: chan,
            embed: {
                description: `:shield: Sucessfully completed imports for ${this.getServerCount()} servers.\n+ ${
                    this.blacklisted
                } users have been added.\n+ ${this.permblacklisted} users were permanently blacklisted.`,
                author: {
                    name: `${interaction.user.username}#${interaction.user.discriminator}`,
                    icon_url: interaction.user.displayAvatarURL(),
                },
                color: Colours.GREEN,
            },
        });
    }

    disabledMessage(interaction: BaseCommandInteraction) {
        sendEmbed({
            interaction,
            embed: {
                description:
                    'This command is currently disabled while VVarden processes new information.',
                author: {
                    name: `${interaction.user.username}#${interaction.user.discriminator}`,
                    icon_url: interaction.user.displayAvatarURL(),
                },
                color: 0xffff00,
            },
        }).catch();
    }
}
