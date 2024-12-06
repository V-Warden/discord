import { ApplicationCommandOptionType } from 'discord.js';
import { Bans, Roles } from '@prisma/client';
import { Command } from '../../structures/Command';
import { logException } from '../../utils/logger';
import { sendError, sendSuccess } from '../../utils/messages';
import db from '../../utils/database';
import logger from '../../utils/logger';

export default new Command({
    name: 'forceexport',
    description: 'Forcefully runs export on a specific guild',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'id',
            description: 'Guild ID',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        const id = interaction.options.get('id')?.value as string;

        if (!client.shard) {
            logger.warn({
                labels: { command: 'forceexport', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: 'No shards online, unable to run this command',
            });
            return sendError(interaction, 'No shards online, unable to run this command');
        }

        const settings = await db.getGuild({ id: id }, { punishments: true });
        if (!settings) return sendError(interaction, 'Unable to find guild in the database');

        const punishRole = settings.punishments?.roleId;
        if (!punishRole) return sendError(interaction, 'Invalid punish role set');

        await db.removeAllBans({ guild: id });
        await db.removeAllRoles({ guild: id });

        const result = await client.shard.broadcastEval(
            async (c, { guildId, punishRole }) => {
                await c.guilds.fetch();

                const guild = c.guilds.cache.find(x => x.id === guildId);
                if (!guild) return { bans: [], roles: [] };

                await guild.bans.fetch();
                await guild.members.fetch();

                const bans = guild.bans.cache.map(x => {
                    return { id: x.user.id, reason: x.reason };
                });

                const members = guild.members.cache
                    .filter(x => x.roles.cache.has(punishRole))
                    .map(x => {
                        const roles = x.roles.cache
                            .filter(a => a.id !== punishRole && a.id !== guild?.roles.everyone.id)
                            .map(b => b.id);
                        return { id: x.id, roles: roles };
                    });

                const bansImport: Bans[] = [];
                const roleImport: Roles[] = [];

                for (let index = 0; index < bans.length; index++) {
                    const ban = bans[index];
                    if (!ban.reason) continue;
                    if (ban.reason.includes('Warden - User Type')) {
                        bansImport.push({ id: ban.id, guild: guildId });
                    }
                }

                for (let index = 0; index < members.length; index++) {
                    const member = members[index];
                    roleImport.push({
                        id: member.id,
                        guild: guildId,
                        roles: member.roles.join(','),
                    });
                }

                return { bans: bansImport, roles: roleImport };
            },
            { context: { guildId: id, punishRole: punishRole } }
        );

        for (let index = 0; index < result.length; index++) {
            for (let i = 0; i < result.length; i++) {
                if (result[i].bans.length === 0) continue;
                if (result[i].roles.length === 0) continue;

                try {
                    const bansPromise = db.createBans(result[i].bans);
                    const rolesPromise = db.createArchiveRoles(result[i].roles);
                    await Promise.all([bansPromise, rolesPromise]);

                    logger.info({
                        labels: { command: 'forceexport', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: `${interaction?.user?.tag} (${interaction?.user?.id}) forcefully exported ${result[i].bans.length} bans and ${result[i].roles.length} role punishments`,
                    });

                    sendSuccess(
                        interaction,
                        `Successfully exported \`${result[i].bans.length}\` bans and \`${result[i].roles.length}\` role punishments`
                    );
                    break;
                } catch (e) {
                    logger.warn({
                        labels: { command: 'forceexport', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    });
                }
            }
        }

        return false;
    },
});
