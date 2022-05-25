import {
    BaseCommandInteraction,
    MessageActionRow,
    Modal,
    ModalActionRowComponent,
    TextInputComponent,
} from 'discord.js';
import { TextInputStyles } from 'discord.js/typings/enums';
import { Bot, SlashCommand } from '../../classes';

export default class TestCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'test',
            description: 'Just a dummy command',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: false,
            staffRole: 'DEV',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        client.processing.processData(interaction.user.id);

        //await createGuild(client, interaction.guild);

        return true;
    }
}
