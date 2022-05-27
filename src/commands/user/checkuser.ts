import { UserType } from '@prisma/client';
import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { capitalize } from 'lodash';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { findHighestType } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';

export default class CheckUserCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'checkuser',
            description: 'Check user database status',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 'STRING',
                    name: 'id',
                    description: 'User ID',
                    required: false,
                },
                {
                    type: 'USER',
                    name: 'user',
                    description: 'User',
                    required: false,
                },
            ],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id =
            ((interaction.options.getUser('user')?.id ||
                interaction.options.get('id')?.value) as Snowflake) ?? interaction.user.id;

        const isNumber = /^\d+$/.test(id);
        if (id.length !== 18 || !isNumber) {
            sendEmbed({
                interaction,
                hidden: true,
                embed: {
                    description: '`🔴` Invalid ID provided',
                    color: Colours.RED,
                },
            });
            return false;
        }
        const user = await client.db.users.findUnique({ where: { id } });
        const imports = await client.db.imports.findMany({
            where: { id, appealed: false },
        });

        if (imports.length > 0 && user.status !== 'WHITELISTED') {
            // is bad person
            const types: UserType[] = imports.map(x => x.type);
            const highest = findHighestType(types);
            sendEmbed({
                interaction,
                embed: {
                    title: ':shield: User Blacklisted',
                    description: `<@${user.id}> has been seen in ${imports.length} blacklisted Discords.`,
                    author: {
                        name: user.last_username,
                        icon_url: user.avatar,
                    },
                    thumbnail: {
                        url: user.avatar,
                    },
                    color: Colours.RED,
                    fields: [
                        {
                            name: 'User Information',
                            value: `> ID: ${user.id}\n> Name: ${
                                user.last_username
                            }\n> Status: ${capitalize(user.status)}\n> Type: ${capitalize(highest)}`,
                        },
                    ],
                },
            });
        } else {
            sendEmbed({
                interaction,
                embed: {
                    description:
                        '`🟢` No results found for this ID.\n> They are either fine or not yet listed.',
                    color: Colours.GREEN,
                },
            });
        }
        return true;
    }
}
