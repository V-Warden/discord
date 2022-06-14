import { CommandInteraction } from 'discord.js';
import { capitalize } from 'lodash';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class RankCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'rank',
            description: 'Responds with your bot command rank',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
        const staff = await client.db.staff.findUnique({ where: { id: interaction.user.id } });

        const embed = {
            description: '',
            color: Colours.GREEN,
        };

        if (staff && staff.role !== 'EXSTAFF') {
            embed.description = `Your wish is my command **Bot ${capitalize(staff.role)}**`;
        } else if (interaction.memberPermissions?.has('ADMINISTRATOR')) {
            embed.description = 'Your wish is my command **Discord Admin**!';
        } else {
            embed.description = "You're a **Bot User**";
        }
        embed.description = `<@${interaction.user.id}> ${embed.description}`;
        sendEmbed({ interaction, embed });

        return true;
    }
}
