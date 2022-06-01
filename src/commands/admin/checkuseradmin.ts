import FormData from 'form-data';
import { capitalize } from 'lodash';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';
import data from '../../config.json';
import axios from 'axios';
import { BaseCommandInteraction, EmbedFieldData, Snowflake } from 'discord.js';

export default class CheckUserAdminCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'checkuseradmin',
            description: 'Check user database status as an admin',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 'STRING',
                    name: 'id',
                    description: 'User ID',
                    required: false,
                },
                {
                    type: 'USER',
                    name: 'user',
                    description: 'User Mention',
                    required: false,
                },
            ],
            defaultPermission: false,
            staffRole: 'ADMIN',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = (interaction.options.getUser('user')?.id ||
            interaction.options.get('id')?.value) as Snowflake;

        if (id?.length !== 18) {
            sendEmbed({
                interaction,
                embed: {
                    description: '`🔴` You must provide either a user or user id',
                    color: Colours.RED,
                },
            });
            return false;
        }

        const dbHistory = await client.db.imports.findMany({
            where: { id, appealed: true },
            select: {
                BadServer: { select: { name: true, oldNames: true, id: true } },
                type: true,
                roles: true,
            },
        });

        const history = [];
        for (let i = 0; i < dbHistory.length; i++) {
            const x = dbHistory[i];

            if (x.roles.includes('"servers":')) {
                const parsed = JSON.parse(x.roles);
                const servers = parsed['servers'].split(';');

                const badServers = await client.db.badServers.findMany({
                    where: { id: { in: servers } },
                    select: { name: true },
                });

                const names = badServers.map(x => x.name);
                const roles = parsed['roles'].split(';');

                history.push({ name: 'Legacy Data', servers: names, roles });
            } else {
                history.push({ name: x.BadServer.name, roles: x.roles, type: x.type });
            }
        }

        const imports = await client.db.imports.findMany({
            where: { id, appealed: false },
            select: {
                BadServer: true,
                server: true,
                roles: true,
                type: true,
            },
        });

        const user = await client.db.users.findUnique({
            where: { id },
        });

        if (!user) {
            sendEmbed({
                interaction,
                embed: {
                    description: '`🟢` User not found in database',
                    color: Colours.GREEN,
                },
            });
            return false;
        }

        let historyResponse;
        if (history.length === 0) {
            historyResponse = 'No prior history';
        } else {
            historyResponse = await upload(history);
        }
        if (imports.length === 0) {
            sendEmbed({
                interaction,
                embed: {
                    description: `\`🟢\` User has no outstanding servers to be appealed for\n\n> History: <${historyResponse}>`,
                    color: Colours.GREEN,
                },
            });
            return false;
        }

        const fields: EmbedFieldData[] = [];
        const value = [];
        let realCount = 0;

        for (let i = 0, l = imports.length; i < l; ++i) {
            const x = imports[i];
            if (x.roles.includes('"servers":')) {
                const parsed = JSON.parse(x.roles);
                const servers = parsed['servers'].split(';');

                const badServers = await client.db.badServers.findMany({
                    where: { id: { in: servers } },
                    select: { name: true },
                });
                realCount += servers.length;

                const names = badServers.map(x => x.name);
                const roles = parsed['roles'].split(';');
                const newData = [{ names, roles }];

                const response = await upload(newData);

                value.push(`Legacy Data\n> View data: <${response}>\n`);
            } else {
                realCount += 1;
                value.push(
                    `${x.BadServer.name}\n> Type: ${x.type} \n> Roles: ${x.roles
                        .split(';')
                        .join(', ')}\n`
                );
            }
        }
        fields.push({
            name: 'New Servers',
            value: value.join('\n'),
        });
        let avatar = user.avatar;

        if (avatar === user.last_username) {
            avatar = client.user.defaultAvatarURL;
        }

        sendEmbed({
            interaction,
            embed: {
                title: ':shield: User In Database',
                description: `<@${user.id}> has been seen in ${realCount} bad Discord servers.`,
                author: {
                    name: user.last_username,
                    icon_url: avatar,
                },
                thumbnail: { url: avatar },
                color: Colours.RED,
                fields: [
                    {
                        name: 'User Information',
                        value: `> ID: ${user.id}\n> Status: ${capitalize(
                            user.status
                        )}\n> Type: ${capitalize(
                            user.type
                        )}\n> History: ${historyResponse}\n> Appeals: ${user.appeals}`,
                        inline: false,
                    },
                    ...fields,
                ],
            },
        }).catch(e => console.log(e));

        return true;
    }
}

async function upload(json: any) {
    const formData = new FormData();

    formData.append('lang', 'json');
    formData.append('expire', '1h');
    formData.append('password', '');
    formData.append('title', '');
    formData.append('text', JSON.stringify(json, null, 4));

    const response = await axios.request({
        url: data.POST_URL,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: formData,
    });

    return response.request.res.responseUrl;
}
