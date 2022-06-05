import { BaseCommandInteraction, Guild } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import { createAuditLog } from '../../utils/db';

export default class GlobalScan extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'globalscan',
            description: 'Scan all guilds',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 'BOOLEAN',
                    name: 'rescan',
                    description: 'Rescan (does not warn)',
                    required: false,
                },
            ],
            defaultPermission: false,
            staffRole: 'DEV',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        client.actioning.reset();
        const rescan = (interaction.options.get('rescan')?.value as boolean) ?? false;

        await interaction.reply({ content: 'Now global checking..' });
        const start = process.hrtime.bigint();

        createAuditLog(client, {
            executedBy: interaction.user.id,
            action: 'globalscan_start',
            message: 'Starting global scan',
        });

        // Reduce database calls
        const guilds = await client.db.guild.findMany({
            where: {
                punishments: {
                    enabled: true,
                    globalCheck: true,
                },
            },
            select: { punishments: true, logChannel: true },
        });

        await client.guilds.fetch();

        for (let i = 0; i < guilds.length; i++) {
            const db = guilds[i];
            const guild = client.guilds.cache.get(guilds[i].punishments.id);

            if (!guild) continue;

            await guild?.members
                .fetch()
                .then(async members => {
                    const memberMap = members.map(x => x.id);

                    const toAction = await client.db.users.findMany({
                        where: { id: { in: memberMap }, status: { notIn: ['APPEALED', 'WHITELISTED'] } },
                    });

                    if (toAction.length > 0) {
                        const settings = guilds.find(a => a.punishments.id === guild.id);
                        if (!settings) {
                            client.logger.warn(
                                `${this.constructor.name}: ${guild.name} - Invalid guild ${guild.id} - Owner ${guild.ownerId}`
                            );
                            return;
                        }

                        client.logger.info(
                            `${this.constructor.name}: ${guild.name} - Actioning ${toAction.length} users`
                        );

                        await toAction.reduce(async (a, member) => {
                            await a;
                            const realMember = members.get(member.id);
                            if (realMember.user.bot) return;

                            client.actioning.doAction(
                                member,
                                db.logChannel,
                                db.punishments,
                                realMember,
                                false,
                                true,
                                rescan
                            );
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }, Promise.resolve());
                        client.logger.debug(
                            `${this.constructor.name}: ${guild.name} - Finished actioning`
                        );
                    } else {
                        client.logger.debug(
                            `${this.constructor.name}: ${guild.name} - Skipping no one to action`
                        );
                        return;
                    }
                })
                .catch(() => {
                    client.logger.debug(
                        `${this.constructor.name}: ${guild.name} - Skipping no one to action`
                    );
                    return;
                });
            await new Promise(resolve => setTimeout(resolve, 500));

            client.logger.info(
                `${this.constructor.name}: ${guild.name} - Successful: ${JSON.stringify(
                    client.actioning.success
                )} - Failed: ${JSON.stringify(client.actioning.failed)}`
            );

            client.actioning.reset();
        }
        const end = Number(process.hrtime.bigint() - start);
        createAuditLog(client, {
            executedBy: interaction.user.id,
            action: 'globalscan_finish',
            message: JSON.stringify({
                took: `${end / 1000000000}s`,
                skippedGuilds: client.actioning.skipGuilds.length,
            }),
        });

        client.actioning.init();

        return true;
    }
}
