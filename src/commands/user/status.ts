import { BaseCommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';
import { countBlacklisted } from '../../utils/users';

export default class StatusCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'status',
            description: 'Shows bot status and stats about its services',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const uptime = process.uptime();

        const blacklistedUsers = await countBlacklisted({ client });
        const guildCache = client.guilds.cache.size;
        sendEmbed({
            interaction,
            embed: {
                title: ':desktop: Bot Status',
                color: Colours.GREEN,
                fields: [
                    {
                        name: 'Shard Count',
                        value: 'I am using 1 shard(s)',
                        inline: false,
                    },
                    {
                        name: 'Protected Guilds',
                        value: `I am watching ${guildCache} guilds`,
                        inline: false,
                    },
                    {
                        name: 'Blacklisted Accounts',
                        value: `I am blocking ${blacklistedUsers} discord accounts`,
                        inline: false,
                    },
                    {
                        name: 'Bot Uptime',
                        value: `I have been up for ${format(uptime)}`,
                        inline: false,
                    },
                    {
                        name: 'Memory Usage',
                        value: `I am currently using ${
                            Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
                        } MB.`,
                        inline: false,
                    },
                ],
                footer: {
                    text: 'VVarden by Vampire#8144',
                },
            },
        });
        return true;
    }
}

function format(seconds: number) {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    const time = [];
    if (hours >= 1) time.push(`${hours}h`);
    if (minutes >= 1) time.push(`${minutes}m`);
    if (seconds >= 1) time.push(`${secs}s`);

    return time.join(' ');
}
