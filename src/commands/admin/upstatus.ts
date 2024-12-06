import { UserType, UserStatus } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/database';
import logger from '../../utils/logger';
import { sendError, sendSuccess } from '../../utils/messages';
import { mapAnyType } from '../../utils/misc';

export default new Command({
    name: 'upstatus',
    description: 'Update a user in the database',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: 'user',
            description: 'User or ID',
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'type',
            description: 'User Type',
            required: true,
            choices: mapAnyType(UserType),
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'status',
            description: 'User Status',
            required: true,
            choices: mapAnyType(UserStatus),
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'reason',
            description: 'Reason for upstatus',
            required: true,
        },
        {
            type: ApplicationCommandOptionType.Integer,
            name: 'appeals',
            description: 'Amount of appeals',
            required: false,
        },
    ],
    run: async ({ interaction }) => {
        const member = interaction.options.getUser('user');
        const id = member?.id as string;
        const status = interaction.options.getString('status') as UserStatus;
        const type = interaction.options.getString('type') as UserType;
        const reason = interaction.options.getString('reason') as string;
        const appeals = interaction.options.getInteger('appeals') as number;

        const user = await db.getUser(id);

        if (!user) return sendError(interaction, 'User not found in the database');

        if (status === 'APPEALED' && user.status !== UserStatus.APPEALED)
            return sendError(interaction, 'You cannot appeal a user this way');

        if (appeals) {
            await db.updateUser(id, { status, type, reason, appeals });
        } else {
            await db.updateUser(id, { status, type, reason });
        }

        logger.info({
            labels: { command: 'upstatus', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) updated ${member?.tag} (${id}) to status: ${status}, type: ${type}${appeals ? `, appeals: ${appeals}` : ''}, with reason: ${reason}`,
        });
        
        return sendSuccess(
            interaction,
            ` Successfully changed <@${id}> (${id}) status to \`${status}\` and type to \`${type}\``
        );
    },
});
