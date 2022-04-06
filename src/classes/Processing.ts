/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import { FilterType, UserStatus, UserType } from '@prisma/client';
import { Colours, UserData } from '../@types';
import { sendEmbed } from '../utils/messages';
import { BaseCommandInteraction, TextChannel } from 'discord.js';

export class Processing {
    processState: number;
    serverCount: number;
    blacklisted: number;
    permblacklisted: number;

    constructor() {
        this.processState = 0;
        this.serverCount = 0;
        this.blacklisted = 0;
        this.permblacklisted = 0;
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

    async processData(): Promise<UserData[]> {
        const dir = await this.getFiles();
        if (!dir) {
            return [];
        }
        const userData: UserData[] = [];
        const guilds: string[] = [];

        for await (const filename of dir) {
            const fileData = fs.readFileSync(`./imports/${filename}`);
            const json = JSON.parse(fileData.toString());

            for (const u in json) {
                const user = json[u];
                if (!guilds.includes(user['guild'])) guilds.push(user['guild']);
                let user_type;
                if (
                    user['permissions'].includes('ADMINISTRATOR') ||
                    user['permissions'].includes('KICK_MEMBERS') ||
                    user['permissions'].includes('BAN_MEMBERS') ||
                    user['permissions'].includes('MANAGE_GUILD')
                )
                    user_type = UserType.OWNER;
                else if (user['is_boosting'] && user['type'] !== 'RESELLING')
                    user_type = UserType.SUPPORTER;
                else if (user['type'] === 'LEAKING') user_type = UserType.LEAKER;
                else if (user['type'] === 'CHEATING') user_type = UserType.CHEATER;
                else user_type = UserType.OTHER;

                userData.push({
                    id: user['id'],
                    avatar: user['avatar'],
                    last_username: user['last_username'],
                    user_type,
                    status: UserStatus.BLACKLIST,
                    roles: user['roles'].join(';'),
                    servers: user['guild'],
                    reason: 'Auto: Member of Blacklisted Discord',
                    filter_type: FilterType.AUTO,
                });
            }
        }

        this.serverCount = guilds.length;

        return userData;
    }
}
