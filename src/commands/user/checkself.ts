import { BaseCommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class CheckSelfCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'checkself',
            description: 'Find out which servers you were scanned in!',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const user = await client.db.users.findUnique({ where: { id: interaction.user.id } });

        if (user) {
            const badServerDB = await client.db.badServers.findMany({
                where: { id: { in: user.servers.split(';') } },
            });

            const badServers: string[] = badServerDB.map(x => x.name);

            sendEmbed({
                hidden: true,
                interaction,
                embed: {
                    description: `You were found in the following servers:\`\`\`${badServers.join(
                        '\n'
                    )}\`\`\``,
                    color: Colours.RED,
                },
            });
        } else {
            sendEmbed({
                hidden: true,
                interaction,
                embed: {
                    description: 'You have not been found in any servers',
                    color: Colours.GREEN,
                },
            });
        }
        return true;
    }
}
