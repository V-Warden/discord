import { BadServers, ServerType } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/database';
import { sendError, sendSuccess } from '../../utils/messages';

// Priority - LOW
//TODO when unblacklisting a server, unban all people and such

export default new Command({
    name: 'bsm',
    description: 'Bad Servers Management',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Add a bad server',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'invite',
                    description: 'Server Invite',
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'type',
                    description: 'Server Type',
                    choices: [
                        {
                            name: 'Cheating',
                            value: 'CHEATING',
                        },
                        {
                            name: 'Leaking',
                            value: 'LEAKING',
                        },
                        {
                            name: 'Reselling',
                            value: 'RESELLING',
                        },
                        {
                            name: 'Advertising',
                            value: 'ADVERTISING',
                        },
                    ],
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'reason',
                    description: 'Reason',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remove a bad server',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'id',
                    description: 'Server ID',
                    required: true,
                },
            ],
        },
    ],
    run: async ({ interaction, client }) => {
        const name = interaction.options.data[0]?.name as string;
        if (!name) return sendError(interaction, 'Sub command must be provided');

        if (name === 'add') {
            const invite = interaction.options.get('invite')?.value as string;
            const type = interaction.options.get('type')?.value as ServerType;
            const reason = interaction.options.get('reason')?.value as string;
            const server = await client.isValidInvite(invite);

            if (!server?.guild) return sendError(interaction, 'Unknown Server');

            const exists: BadServers | null = await db.getBadServer({ id: server.guild?.id });
            if (exists) {
                if (exists?.name === server.guild?.name)
                    return sendError(interaction, 'Server is already blacklisted');

                const newOldNames = exists?.oldNames ? exists.oldNames.split('<>') : [];
                newOldNames.push(exists?.name);
                await db.updateBadServer(server.guild?.id, {
                    name: server.guild?.name,
                    oldNames: newOldNames.join('<>'),
                    invite,
                });

                return sendError(
                    interaction,
                    `This server already exists but under a new name, I have automatically updated this. \`\`\`New Name: ${server.guild?.name}\nOld Name: ${exists.name}\`\`\``
                );
            } else {
                await db.createBadServer({
                    id: server.guild?.id,
                    name: server.guild?.name,
                    type,
                    invite,
                    reason,
                    staff: {
                        connectOrCreate: {
                            where: {
                                id: interaction.user.id,
                            },
                            create: {
                                id: interaction.user.id,
                                role: 'ADMIN',
                            },
                        },
                    },
                });

                return sendSuccess(
                    interaction,
                    `Successfully added \`${server.guild.id}\` - \`${server.guild.name}\` as a \`${type}\` bad server`
                );
            }
        } else if (name === 'remove') {
            const id = interaction.options.get('id')?.value as string;

            const exists = await db.getBadServer({ id });
            if (!exists) return sendError(interaction, 'That ID is not a bad server');

            await db.deleteBadServer(id);
            return sendSuccess(interaction, 'Successfully removed as a bad server');
        } else return sendError(interaction, 'Invalid sub command');
    },
});
