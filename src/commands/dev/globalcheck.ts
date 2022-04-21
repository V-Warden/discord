import { BaseCommandInteraction, TextBasedChannel, TextChannel } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';
import data from '../../config.json';

export default class GlobalCheckCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'globalcheck',
            description: 'Global check on all guilds (Dev)',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        await interaction.editReply({ content: 'Now global checking..' });

        // Reduce database calls
        const guilds = await client.db.guild.findMany({});

        await client.guilds.fetch();
        const realGuilds = await client.guilds.cache.map(x => x);

        for await (const guild of realGuilds) {
            await guild.members
                .fetch()
                .then(async members => {
                    const memberMap = members.map(x => x.id);
                    const toAction = await client.db.users.findMany({
                        where: {
                            id: { in: memberMap },
                            status: { in: ['BLACKLIST', 'PERM_BLACKLIST'] },
                        },
                    });
                    if (toAction.length >= 1) {
                        const settings = guilds.find(g => g.id === guild.id);
                        if (!settings) {
                            client.logger.warn(
                                `globalCheck ${guild.name}: Invalid guild ${guild.id} - Owner ${guild.ownerId}`
                            );
                            return;
                        }

                        await toAction.reduce(async (a, member) => {
                            await a;
                            const realMember = members.get(member.id);
                            if (realMember.user.bot) return;
                            client.logger.debug(
                                `globalCheck ${guild.name}: Actioning ${realMember.user.username}#${realMember.user.discriminator} (${member.id})`
                            );
                            client.punish.actionUser(member, settings, realMember, false, false);
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }, Promise.resolve());
                        client.logger.debug(`globalCheck ${guild.name}: Finished actioning`);
                        return;
                    } else {
                        client.logger.debug(`globalCheck ${guild.name}: Skipping no one to action`);
                        return;
                    }
                })
                .catch(() => {
                    client.logger.debug(`globalCheck ${guild.name}: Skipping no one to action`);
                    return;
                });
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        client.logger.info(
            `globalCheck: Finished actioning on all ${
                client.guilds.cache.size
            } guilds,\nSuccessful: ${JSON.stringify(client.punish.success)}\nFailed: ${JSON.stringify(
                client.punish.failed
            )}\nSkipped ${client.punish.skipGuilds.length} guilds, log channel was invalid`
        );

        const chan: TextChannel = ((await client.channels.cache.get(data.CHANNEL_LOG)) ??
            (await client.channels.fetch(data.CHANNEL_LOG))) as TextChannel;

        sendEmbed({
            channel: chan as TextBasedChannel,
            embed: {
                description: `Finished actioning on ${client.guilds.cache.size} guilds`,
                color: Colours.GREEN,
            },
        });

        client.punish.reset();

        return true;
    }
}
