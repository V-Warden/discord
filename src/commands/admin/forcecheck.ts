import { BaseCommandInteraction, Snowflake, TextChannel } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';
import { getUser } from '../../utils/users';
import { punishUser } from '../../utils/users/punishUser';

export default class ForceCheckCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'forcecheck',
            description: 'Checks the DB status of a user and global automods if needed',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'userid',
                    description: 'User ID to check',
                    required: false,
                },
                {
                    type: 6,
                    name: 'user',
                    description: 'User Mention to check',
                    required: false,
                },
            ],
            defaultPermission: true,
            staffRole: 'admin',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = (interaction.options.getUser('user')?.id ||
            interaction.options.get('userid')?.value) as Snowflake;

        if (!id) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'You must provided either a user or user id',
                    color: Colours.YELLOW,
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

        const oldUser = await getUser({ client, id });

        const begin = Date.now();

        // Reduce database queries by grabbing all guilds
        const guilds = await client.db.guild.findMany({});

        client.logger.info(`forceCheck ${id}: Initiated by ${interaction.user.id}`);
        await client.guilds.fetch();
        await client.guilds.cache.reduce(async (a, guild) => {
            await a;
            await guild.members
                .fetch(id)
                .then(async member => {
                    const settings = guilds.find(g => g.id === guild.id);
                    punishUser({
                        client,
                        member,
                        oldUser,
                        guildInfo: settings,
                        toDM: false,
                    });
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
