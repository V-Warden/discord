import { UserType } from '@prisma/client';
import { ApplicationCommandType } from 'discord.js';
import { capitalize } from 'lodash';
import { Colours } from '../../@types/Colours';
import { ContextMenu } from '../../structures/ContextMenu';
import db from '../../utils/database';
import { sendSuccess } from '../../utils/messages';
import sendEmbed from '../../utils/messages/sendEmbed';

export default new ContextMenu({
    name: 'Check User Status',
    type: ApplicationCommandType.User,
    main: true,
    run: async ({ interaction }) => {
        const id = interaction.targetId;
        const data = await db.getUser(id);
        if (!data || data.status === 'WHITELISTED')
            return sendSuccess(
                interaction,
                'No results found for this ID.\n> They are either fine or not yet listed.'
            );

        const imports = await db.getImports(id);
        if (imports.length === 0 && data.status === 'APPEALED')
            return sendSuccess(
                interaction,
                'No results found for this ID.\n> They are either fine or not yet listed.'
            );

        const types: UserType[] = imports.map(x => x.type);
        const highest = db.findHighestType(types);

        return sendEmbed({
            interaction,
            embed: {
                title: ':shield: User Blacklisted',
                description: `<@${id}> has been seen in ${imports.length} blacklisted Discords.`,
                author: {
                    name: data.last_username,
                    icon_url: data.avatar,
                },
                thumbnail: {
                    url: data.avatar,
                },
                color: Colours.RED,
                fields: [
                    {
                        name: 'User Information',
                        value: `> ID: ${id}\n> Name: ${data.last_username}\n> Status: ${capitalize(
                            data.status
                        )}\n> Type: ${capitalize(highest)}`,
                    },
                ],
            },
        });
    },
});
