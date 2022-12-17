import { UserType, UserStatus } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
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
    ],
    run: async ({ interaction, client }) => {
        const id = interaction.options.getUser('user')?.id as string;
        const status = interaction.options.get('status')?.value as UserStatus;
        const type = interaction.options.get('type')?.value as UserType;
        const reason = interaction.options.get('reason')?.value as string;

        const user = await client.prisma.getUser(id);

        if (!user) return sendError(interaction, 'User not found in the database');

        await client.prisma.updateUser(id, { status, type, reason });
        return sendSuccess(
            interaction,
            ` Successfully changed ${user.last_username} (${id}) status to \`${status}\` and type to \`${type}\``
        );
    },
});
