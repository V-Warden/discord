import { UserStatus } from '@prisma/client';
import { BaseCommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { getGuild } from '../../utils/guild';
import { sendEmbed } from '../../utils/messages';
import { punishUser } from '../../utils/users/punishUser';

export default class ScanUsers extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'scanusers',
            description: 'Scans your discord users and punishes them if blacklisted',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
            permission: 'ADMINISTRATOR',
            cooldown: 3600,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        if (client.processing.isProcessing()) {
            client.processing.disabledMessage(interaction);
            return false;
        }

        client.logger.debug(`scanUsers ${interaction.guild.name}: Initiated by ${interaction.user.id}`);

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
                    punishUser({
                        client,
                        member: interaction.guild.members.cache.get(user.id),
                        guildInfo: settings,
                        oldUser: user,
                        toDM: false,
                    }).catch(e => console.log(e));
                })
            );
            sendEmbed({
                channel: interaction.channel,
                embed: {
                    description: `Scanning completed, ${users.length} have been actioned`,
                    color: Colours.GREEN,
                },
            }).catch(e => console.log(e));

            const end = Date.now();
            client.logger.info(
                `scanUsers ${interaction.guild.name}: actioned ${users.length} users, took ${
                    (end - begin) / 1000
                }s`
            );
            return true;
        });

        return true;
    }
}
