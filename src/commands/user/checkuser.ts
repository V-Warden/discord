import { ApplicationCommandOptionType } from 'discord.js';
import { UserType } from '@prisma/client';
import { Command } from '../../structures/Command';
import { sendSuccess } from '../../utils/messages';
import sendEmbed from '../../utils/messages/sendEmbed';
import { Colours } from '../../@types/Colours';
import { capitalize } from '../../utils/misc';
import db from '../../utils/database';
import actionAppeal from '../../utils/actioning/actionAppeal';

export default new Command({
    name: 'checkuser',
    description: 'See if a user is blacklisted',
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: 'user',
            description: 'User or ID',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        const id = interaction.options.getUser('user')?.id as string;
        const bot = interaction.options.getUser('user')?.bot as boolean;

        if (bot === true)
          return sendSuccess(
              interaction,
              'No results are provided to bot accounts.\n> Please access this command as a standard user.'
          );

        const data = await db.getUser(id);
        if (!data || data.status === 'WHITELISTED')
            return sendSuccess(
                interaction,
                'No results found for this ID.\n> They are either fine or not yet listed.'
            );

        const importsPromise = db.getImports(data.id);
        const allImportsPromise = db.getAllImports(data.id);
        const appealedImportsPromise = db.getAppealedImports(data.id);

        const [imports, allImports, appealedImports] = await Promise.all([
            importsPromise,
            allImportsPromise,
            appealedImportsPromise,
        ]);

        if (imports.length === 0 && data.status === 'APPEALED')
            return sendSuccess(
                interaction,
                'No results found for this ID.\n> They are either fine or not yet listed.'
            );

        if (
            data.status === 'BLACKLISTED' &&
            data.reason === 'Unspecified' &&
            allImports.length === appealedImports.length
        ) {
            await db.updateUser(data.id, { status: 'APPEALED', appeals: { increment: 1 } });
            await actionAppeal(client, data.id);
            return sendSuccess(
                interaction,
                'No results found for this ID.\n> They are either fine or not yet listed.'
            );
        }

        const types: UserType[] = imports.map(x => x.type);
        types.push(data.type);
        const highest = db.findHighestType(types);

        let reason = '';
        if (imports.length > 0) {
            reason = `seen in ${imports.length} blacklisted Discords.`;
        } else {
            reason = 'blacklisted by Warden.';
        }

        return sendEmbed({
            interaction,
            embed: {
                title: ':shield: User Blacklisted',
                description: `<@${id}> has been ${reason}`,
                color: Colours.RED,
                fields: [
                    {
                        name: 'User Information',
                        value: `> ID: ${id}\n> Status: ${capitalize(
                            data.status
                        )}\n> Type: ${capitalize(highest)}`,
                    },
                ],
            },
        });
    },
});
