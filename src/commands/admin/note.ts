import { APIEmbed, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import { sendError, sendSuccess } from '../../utils/messages';
import { chunk } from 'lodash';
import { Colours } from '../../@types/Colours';
import sendPagination from '../../utils/messages/sendPagination';
import db from '../../utils/database';

export default new Command({
    name: 'note',
    description: 'Note Management',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Add a note',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'id',
                    description: 'User ID',
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'note',
                    description: 'Note',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'view',
            description: 'View a users notes',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'id',
                    description: 'User ID',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remove a specific note',
            options: [
                {
                    type: ApplicationCommandOptionType.Number,
                    name: 'nid',
                    description: 'Note ID',
                    required: true,
                },
            ],
        },
    ],
    run: async ({ interaction }) => {
        const subcommand = interaction.options.data[0]?.name;
        if (subcommand === 'add') {
            const note = interaction.options.get('note')?.value as string;
            const id = interaction.options.get('id')?.value as string;
            const exists = await db.userExist(id);
            if (!exists) return sendError(interaction, 'That user is not in the database');

            await db.createNote(id, note, interaction.user.id);

            return sendSuccess(
                interaction,
                `Successfully added the following note to <@${id}>\`\`\`${note}\`\`\``
            );
        } else if (subcommand === 'remove') {
            const nId = interaction.options.get('nid')?.value as number;

            await db.deleteNote(nId);

            return sendSuccess(interaction, 'Successfully deleted note');
        } else if (subcommand === 'view') {
            const id = interaction.options.get('id')?.value as string;
            const notes = await db.getUserNotes(id);

            if (notes.length === 0) return sendSuccess(interaction, 'User has no notes');

            const values: string[] = [];
            for (let i = 0; i < notes.length; i++) {
                const x = notes[i];

                values.push(`> ID: ${x.nId}\n> By: <@${x.staff.id}>\n> \`${x.note}\`\n`);
            }

            const chunks = chunk(values, 15);
            const pages: APIEmbed[] = [];
            chunks.forEach((chunk: string[]) => {
                pages.push({
                    author: {
                        name: `${notes[0].user.last_username}'s Notes`,
                        icon_url: notes[0].user.avatar ?? 'http://cdn.mk3ext.dev/vh5NME2rgr.png',
                    },
                    description: `${chunk.join('\n')}`,
                    color: Colours.RED,
                });
            });

            return sendPagination(interaction, pages, 60000);
        }

        return;
    },
});
