import { Bans, Roles } from '@prisma/client';
import { Command } from '../../structures/Command';
import { sendError, sendSuccess } from '../../utils/messages';
import db from '../../utils/database';

export default new Command({
    name: 'export',
    description: 'Export VVarden data to database',
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction, client }) => {
        if (!interaction.guild) return sendError(interaction, 'Must be used in a guild');

        const settings = await db.getGuild({ id: interaction.guild.id }, { punishments: true });

        if (!settings) return sendError(interaction, 'Unable to find guild in the database');

        const punishRole = settings.punishments?.roleId;
        if (!punishRole) return sendError(interaction, 'Invalid punish role set');

        await interaction.guild.bans.fetch();
        await interaction.guild.members.fetch();

        const bans = interaction.guild.bans.cache.map(x => {
            return { id: x.user.id, reason: x.reason };
        });

        const members = interaction.guild.members.cache
            .filter(x => x.roles.cache.has(punishRole))
            .map(x => {
                const roles = x.roles.cache
                    .filter(a => a.id !== punishRole && a.id !== interaction.guild?.roles.everyone.id)
                    .map(b => b.id);
                return { id: x.id, roles: roles };
            });

        const bansImport: Bans[] = [];
        const roleImport: Roles[] = [];

        for (let index = 0; index < bans.length; index++) {
            const ban = bans[index];
            if (ban.reason?.includes('Warden - User Type')) {
                bansImport.push({ id: ban.id, guild: interaction.guild.id });
            }
        }

        for (let index = 0; index < members.length; index++) {
            const member = members[index];
            roleImport.push({
                id: member.id,
                guild: interaction.guild.id,
                roles: member.roles.join(','),
            });
        }

        // Override exception handling in interactionCreate
        try {
            await Promise.all([db.createBans(bansImport), db.createArchiveRoles(roleImport)]);

            return sendSuccess(
                interaction,
                `Successfully exported \`${bansImport.length}\` bans and \`${roleImport.length}\` role punishments`
            );
        } catch (e) {
            return sendError(interaction, 'Unable to export data\n> This command can only be used once');
        }
    },
});
