import { ApplicationCommandOptionType, Invite } from 'discord.js';
import { BadServers } from '@prisma/client';
import { Command } from '../../structures/Command';
import { sendError, sendSuccess } from '../../utils/messages';
import db from '../../utils/database';
import logger from '../../utils/logger';

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

        let server: Invite | undefined;
        try {
            server = await client.isValidInvite(invite);
        } catch (e) {
            logger.error({
                labels: { command: 'updateservername', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            });
        }

        if (!server?.guild) return sendError(interaction, 'Unknown Server');

        const exists: BadServers | null = await db.getBadServer({ id: server.guild?.id });
        if (!exists) return sendError(interaction, 'Server does not exist in database');

        if (exists?.name === server.guild?.name) {
            await db.updateBadServer(server.guild?.id, {
                invite,
            });

            return sendError(interaction, 'Server name is the same, I have updated the invite.');
        }

        const newOldNames = exists?.oldNames ? exists.oldNames.split('<>') : [];
        newOldNames.push(exists?.name);
        await db.updateBadServer(server.guild?.id, {
            name: server.guild?.name,
            oldNames: newOldNames.join('<>'),
            invite,
        });

        logger.info({
            labels: { command: 'updateservername', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) updated server name ${exists.name} to ${server.guild?.name}`,
        });

        return sendSuccess(
            interaction,
            `Successfully updated the server name. \`\`\`New Name: ${server.guild?.name}\nOld Name: ${exists.name}\`\`\``
        );
    },
});
