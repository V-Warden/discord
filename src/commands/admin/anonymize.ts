import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class AnonymizeCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'anonymize',
            description: 'Anonymize a user in the database',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'userid',
                    description: 'User ID to check',
                    required: false,
                },
                {
                    type: 6,
                    name: 'user',
                    description: 'User Mention to check',
                    required: false,
                },
            ],
            defaultPermission: true,
            staffRole: 'admin',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = (interaction.options.getUser('user')?.id ||
            interaction.options.get('userid')?.value) as Snowflake;

        if (!id) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'You must provided either a user or user id',
                    color: Colours.YELLOW,
                },
            });
            return false;
        }

        client.db.users
            .update({
                where: {
                    id,
                },
                data: {
                    avatar: 'http://cdn.mk3ext.dev/AqFvdbUWmp.png',
                    last_username: 'unknown#0000',
                    servers: '860760302227161118',
                    roles: '',
                },
            })
            .then(async () => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: `Anonymized ${id}`,
                        author: {
                            name: `${interaction.user.username}#${interaction.user.discriminator}`,
                            icon_url: interaction.user.displayAvatarURL(),
                        },
                        color: Colours.GREEN,
                    },
                });
            })
            .catch(async () => {
                sendEmbed({
                    interaction,
                    embed: {
                        description:
                            ':white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.',
                        color: Colours.YELLOW,
                    },
                });
            });

        return true;
    }
}
