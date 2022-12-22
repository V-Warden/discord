import { ApplicationCommandOptionType, ChannelType, TextChannel } from 'discord.js';
import { Command } from '../../structures/Command';
import db from '../../utils/database';
import { sendError, sendSuccess } from '../../utils/messages';

export default new Command({
    name: 'fixguild',
    description: 'replies with pong',
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

        const guild = await client.guilds.fetch(id);
        if (!guild) return sendError(interaction, 'Invalid guild id provided');

        await guild.channels.fetch();
        const channel = guild.channels.cache
            .filter(chan => chan?.type === ChannelType.GuildText)
            .first() as TextChannel;
        if (!channel) return sendError(interaction, 'Unable to find a channel in guild');

        await db.createGuild({
            id: guild.id,
            name: guild.name,
            logChannel: channel.id,
            punishments: {
                create: {},
            },
        });
        return sendSuccess(interaction, `Successfully created guild ${guild.name} (${guild.id})`);
    },
});
