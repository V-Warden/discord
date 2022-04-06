import { FilterType, UserStatus, UserType } from '@prisma/client';
import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Colours, LogTypes } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { enumToMap } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';
import { createUser } from '../../utils/users';

const map = enumToMap(UserStatus);
const choices = Array.from(map.entries()).map(m => ({
    name: m[0],
    value: `${m[1]}`,
}));

const mapa = enumToMap(UserType);
const choicesa = Array.from(mapa.entries()).map(m => ({
    name: m[0],
    value: `${m[1]}`,
}));
export default class AddUserCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'adduser',
            description: 'Add a user to the database (Dev)',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'id',
                    description: 'User ID',
                    required: true,
                },
                {
                    type: 3,
                    name: 'reason',
                    description: 'Reason for adding user',
                    required: false,
                },
                {
                    type: 3,
                    name: 'server',
                    description: 'Linked Server ID',
                    required: false,
                },
                {
                    type: 3,
                    name: 'status',
                    description: 'Status of User',
                    choices,
                    required: false,
                },
                {
                    type: 3,
                    name: 'type',
                    description: 'User Type',
                    choices: choicesa,
                    required: false,
                },
            ],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = interaction.options.get('id')?.value as Snowflake;
        const reason =
            interaction.options.get('reason')?.value.toString() ||
            'Manual: Member of Blacklisted Discord Server';

        const user_type = (interaction.options.get('type')?.value as UserType) || UserType.LEAKER;
        const status = (interaction.options.get('status')?.value || UserStatus.BLACKLIST) as UserStatus;
        const server = (interaction.options.get('server')?.value || interaction.guildId) as Snowflake;

        client.users
            .fetch(id)
            .then(user => {
                createUser({
                    client,
                    info: {
                        id,
                        avatar: user.displayAvatarURL(),
                        last_username: `${user.username}#${user.discriminator}`,
                        status,
                        user_type,
                        servers: server,
                        reason,
                        filter_type: FilterType.MANUAL,
                    },
                })
                    .then(async () => {
                        sendEmbed({
                            interaction,
                            embed: {
                                description: 'Successfully added user to the database',
                                color: Colours.GREEN,
                            },
                        });

                        client.emit('logAction', {
                            type: LogTypes.ADD_USER,
                            author: interaction.user,
                            message: `${interaction.user.username}#${
                                interaction.user.discriminator
                            } added ${
                                user.username
                            } (${id}) to the database with: \`\`\`${JSON.stringify(
                                { user_type, status, guild: server, reason },
                                null,
                                2
                            )}\`\`\``,
                        });
                    })
                    .catch(async () => {
                        sendEmbed({
                            interaction,
                            embed: {
                                description:
                                    ':shield: User is already in database\nChange status if nessary using /upstatus',
                                color: Colours.YELLOW,
                            },
                        });
                    });
            })
            .catch(() => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: 'Invalid user id provided',
                        color: Colours.YELLOW,
                    },
                });
            });

        return true;
    }
}
