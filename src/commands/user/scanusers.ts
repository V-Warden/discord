import { UserStatus } from '@prisma/client';
import { BaseCommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { getGuild } from '../../utils/guild';
import { sendEmbed } from '../../utils/messages';

export default class ScanUsers extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'scanusers',
            description: 'Scans your discord users and punishes them if blacklisted',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: false,
            permission: 'ADMINISTRATOR',
            cooldown: 3600,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        if (client.processing.isProcessing()) {
            client.processing.disabledMessage(interaction);
            return false;
        }

        const begin = Date.now();
        interaction.guild.members.fetch().then(async () => {
            const settings = await getGuild({
                client,
                id: interaction.guildId,
            });

            if (!settings) {
                client.logger.error(
                    `guildMemberAdd ${interaction.guild.name}: Unknown guild - Owner is: ${interaction.guild.ownerId}`
                );
                return false;
            }

            if (!settings.enabled) {
                sendEmbed({
                    interaction,
                    embed: {
                        description:
                            '`🔴` Actioning is disabled on this server, you can enable it using `/config`',
                        color: Colours.RED,
                    },
                });
                return false;
            }

            client.logger.debug(
                `scanUsers ${interaction.guild.name}: Initiated by ${interaction.user.id}`
            );

            sendEmbed({
                interaction,
                embed: {
                    description:
                        "Now scanning users. This may take awhile so be patient.\nBe aware this is resource intensive, and shouldn't be used often.\nAbuse of this command will result in punishment.",
                    color: Colours.YELLOW,
                },
            });

            // Reduce database calls from one per member to one
            // Bulk grab all blacklisted then check if exists
            // Rather than checking database per member
            const ids = interaction.guild.members.cache.map(u => u.id);
            const users = await client.db.users.findMany({
                where: {
                    status: {
                        in: [UserStatus.BLACKLIST, UserStatus.PERM_BLACKLIST],
                    },
                    id: {
                        in: ids,
                    },
                },
            });

            await Promise.all(
                users.map(async user => {
                    client.punish.actionUser(
                        user,
                        settings,
                        interaction.guild.members.cache.get(user.id),
                        false,
                        false
                    );
                })
            );
            const actioned = users.length === 0 ? 0 : users.length - 1;
            sendEmbed({
                channel: interaction.channel,
                embed: {
                    description: `Scanning completed, \`${actioned} users\` have been actioned`,
                    color: Colours.GREEN,
                },
            }).catch(e => console.log(e));

            const end = Date.now();
            client.logger.info(
                `scanUsers ${interaction.guild.name}: actioned ${actioned} users, took ${
                    (end - begin) / 1000
                }s`
            );
            return true;
        });

        return true;
    }
}
