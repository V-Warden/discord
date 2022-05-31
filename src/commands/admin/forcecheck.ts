import { BaseCommandInteraction, Snowflake, TextChannel } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class ForceCheckCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'forcecheck',
            description: 'Checks the DB status of a user and global automods if needed',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 'STRING',
                    name: 'id',
                    description: 'User ID',
                    required: true,
                },
            ],
            defaultPermission: false,
            staffRole: 'ADMIN',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = interaction.options.get('id').value as Snowflake;

        if (id.length !== 18) {
            sendEmbed({
                interaction,
                hidden: true,
                embed: {
                    description: '`🔴` Invalid ID provided',
                    color: Colours.RED,
                },
            });
            return false;
        }

        const user = await client.db.users.findUnique({ where: { id } });

        if (!user) {
            sendEmbed({
                interaction,
                embed: {
                    description: '`🔴` User not found in database',
                    color: Colours.RED,
                },
            });
            return false;
        }

        sendEmbed({
            interaction,
            embed: {
                description: '`🟢` Force checking user..',
                color: Colours.YELLOW,
            },
        });

        const begin = Date.now();

        // Reduce database queries by grabbing all guilds
        const guilds = await client.db.guild.findMany({
            select: { logChannel: true, punishments: true },
        });

        client.logger.info(`forceCheck ${id}: Initiated by ${interaction.user.id}`);
        await client.guilds.fetch();
        await client.guilds.cache.reduce(async (a, guild) => {
            await a;
            await guild.members
                .fetch(id)
                .then(async member => {
                    const settings = guilds.find(g => g.punishments.id === guild.id);
                    client.actioning.doAction(
                        user,
                        settings.logChannel,
                        settings.punishments,
                        member,
                        false,
                        false,
                        false
                    );

                    client.logger.debug(`forceCheck ${id}: Finished actioning ${guild.name}`);
                })
                .catch(() =>
                    client.logger.debug(`forceCheck ${id}: Skipping ${guild.name} not in guild`)
                );
        }, Promise.resolve());

        const end = Date.now();
        client.logger.info(
            `forceCheck ${id}: Finished actioning on ${client.guilds.cache.size} guilds, took ${
                (end - begin) / 1000
            }s`
        );

        sendEmbed({
            channel: interaction.channel as TextChannel,
            embed: {
                description: `\`🟢\` User has been force checked in ${client.guilds.cache.size} guilds`,
                color: Colours.YELLOW,
            },
        }).catch();

        return true;
    }
}
