import { BaseCommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class DonateCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'donate',
            description: 'Shares information on how to donate',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        sendEmbed({
            interaction,
            embed: {
                title: 'Donate',
                description:
                    "If you would like to donate to me, or the community that created Warden, you can do so via Ko-Fi.\nDonations don't get you anything except for a thank you message in the donations channel of the discord.\nDonations made will be used to upkeep the bots and offset living costs of the creators and maintainers.\n\n**Ko-Fi**: <https://ko-fi.com/vampuric>",
                color: Colours.GREEN,
                footer: {
                    text: 'VVarden by Vampire#8144',
                },
            },
        });
        return true;
    }
}
