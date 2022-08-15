import { UserType } from '@prisma/client';
import { CommandInteraction, Snowflake } from 'discord.js';
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
            cooldown: 60,
        });
    }

    public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
        const id =
            ((interaction.options.getUser('user')?.id ||
                interaction.options.get('id')?.value) as Snowflake) ?? interaction.user.id;

        const isNumber = /^\d+$/.test(id);
        if (id.length < 17 || !isNumber) {
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

        if (!user) {
            sendEmbed({
                interaction,
                embed: {
                    description:
                        '`🟢` No results found for this ID.\n> They are either fine or not yet listed.',
                    color: Colours.GREEN,
                },
            });
            return false;
        }

        const imports = await client.db.imports.findMany({
            where: { id, appealed: false },
            select: {
                BadServer: { select: { name: true, oldNames: true, id: true } },
                type: true,
                roles: true,
            },
        });

        if (imports.length === 0 && ['PERM_BLACKLISTED', 'BLACKLISTED'].includes(user.status)) {
            await interaction.deferReply();
            let hasAppealed = false;

            for (let i = 0; i < imports.length; i++) {
                const x = imports[i];

                const result = await client.db.logs.findFirst({
                    where: {
                        AND: [
                            { action: 'user_appealed' },
                            { message: { contains: user.id } },
                            { message: { contains: x.BadServer.id } },
                        ],
                    },
                });
                if (result) hasAppealed = true;
            }

            if (!hasAppealed) {
                await client.db.imports.updateMany({
                    where: { id: user.id },
                    data: { appealed: false },
                });
                this.run(client, interaction);
                return false;
            }
        }

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
