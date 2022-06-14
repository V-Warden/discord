import { CommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class AboutCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'about',
            description: 'Information about this bot, its purpose, and author',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
        sendEmbed({
            interaction,
            embed: {
                title: 'About Me',
                description: `Hello, my name is VVarden!
                    You can call me Warden or 5 Warden (V Warden).
                    \nI was created by Vampire#8144 in an effort to combat the prevalence of pirated code and cheating within the FiveM community.
                    \nI am the frontend for a database of users in Leaking and Cheating Discord servers, with settings to prevent those users from entering your discord server.
                    \nYou can join the Official Discord for more information: <https://discord.gg/jeFeDRasfs>
                    \nFeel free to contribute here: <https://github.com/V-Warden/discord>`,
                color: Colours.GREEN,
            },
        });
        return true;
    }
}
