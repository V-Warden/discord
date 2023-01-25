import { BadServers } from '@prisma/client';
import { ApplicationCommandOptionType, Invite } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/database';
import { sendError, sendSuccess } from '../../utils/messages';

export default new Command({
    name: 'updateservername',
    description: 'Update a servers name',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'invite',
            description: 'Server Invite',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        const invite = interaction.options.get('invite')?.value as string;

        const server: undefined | Invite = await client.isValidInvite(invite);

        if (!server?.guild) return sendError(interaction, 'Unknown Server');

        const exists: BadServers | null = await db.getBadServer({ id: server.guild?.id });
        if (!exists) return sendError(interaction, 'Server does not exist in database');

        if (exists?.name === server.guild?.name) return sendError(interaction, 'Server name is the same');

        const newOldNames = exists?.oldNames ? exists.oldNames.split('<>') : [];
        newOldNames.push(exists?.name);
        await db.updateBadServer(server.guild?.id, {
            name: server.guild?.name,
            oldNames: newOldNames.join('<>'),
            invite,
        });

        return sendSuccess(
            interaction,
            `Successfully updated the server name. \`\`\`New Name: ${server.guild?.name}\nOld Name: ${exists.name}\`\`\``
        );
    },
});
