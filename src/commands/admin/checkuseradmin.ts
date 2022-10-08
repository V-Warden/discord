import { capitalize } from 'lodash';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed, sendPagination } from '../../utils/messages';
import { CommandInteraction, MessageEmbed, Snowflake } from 'discord.js';
import _ from 'lodash';

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

  public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
    const id = (interaction.options.getUser('user')?.id || interaction.options.get('id')?.value) as Snowflake;

    if (id?.length < 17) {
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

        const names = badServers.map((x) => x.name);
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

    if (imports.length === 0 && ['PERM_BLACKLISTED', 'BLACKLISTED'].includes(user.status)) {
      await interaction.deferReply();
      let hasAppealed = false;

      for (let i = 0; i < dbHistory.length; i++) {
        const x = dbHistory[i];

        const result = await client.db.logs.findFirst({
          where: {
            AND: [
              { action: 'user_appealed' },
              { message: { contains: user.id } },
              { message: { contains: x.BadServer.id } },
            ],
          },
        });
        if (result) hasAppealed = true;
      }

      if (!hasAppealed) {
        await client.db.imports.updateMany({
          where: { id: user.id },
          data: { appealed: false },
        });
        this.run(client, interaction);
        return false;
      }
    }

    let historyResponse: string;
    if (history.length === 0) {
      historyResponse = 'No prior history';
    } else {
      historyResponse = await client.uploadText(JSON.stringify(history, null, 4), '1h');
    }

    const noteCount = await client.db.notes.count({ where: { id } });

    if (imports.length === 0) {
      sendEmbed({
        interaction,
        embed: {
          description: `\`🟢\` User has no outstanding servers to be appealed for\n\n> History: <${historyResponse}>\n> Notes: ${noteCount}`,
          color: Colours.GREEN,
        },
      });
      return false;
    }

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

        const names = badServers.map((x) => x.name);
        const roles = parsed['roles'].split(';');
        const newData = [{ names, roles }];

        const response = await client.uploadText(JSON.stringify(newData, null, 4), '1h');

        value.push(`Legacy Data\n> View data: <${response}>\n`);
      } else {
        realCount += 1;
        value.push(`${x.BadServer.name}\n> Type: ${x.type} \n> Roles: ${x.roles.split(';').join(', ')}\n`);
      }
    }

    let avatar = user.avatar;

    if (avatar === user.last_username) {
      avatar = client.user.defaultAvatarURL;
    }

    const mainEmbed = {
      author: {
        name: user.last_username,
        icon_url: avatar,
      },
      title: ':shield: User In Database',
      thumbnail: { url: avatar },
      description: `<@${user.id}> has been seen in ${realCount} bad Discord servers.`,
      color: Colours.RED,
    };

    if (value.length >= 5) {
      const chunked = _.chunk(value, 5);
      const pages: MessageEmbed[] = [];

      chunked.forEach((chunk) => {
        pages.push(
          new MessageEmbed({
            ...mainEmbed,
            fields: [
              {
                name: 'User Information',
                value: `> ID: ${user.id}\n> Status: ${capitalize(user.status)}\n> Type: ${capitalize(
                  user.type
                )}\n> History: ${historyResponse}\n> Notes: ${noteCount}\n> Appeals: ${user.appeals}`,
                inline: false,
              },
              ...[{ name: 'New Servers', value: chunk.join('\n') }],
            ],
          })
        );
      });
      sendPagination(client, interaction, pages, 180000);
    } else {
      sendEmbed({
        interaction,
        embed: {
          ...mainEmbed,
          fields: [
            {
              name: 'User Information',
              value: `> ID: ${user.id}\n> Status: ${capitalize(user.status)}\n> Type: ${capitalize(
                user.type
              )}\n> History: ${historyResponse}\n> Notes: ${noteCount}\n> Appeals: ${user.appeals}`,
              inline: false,
            },
            {
              name: 'New Servers',
              value: value.join('\n'),
            },
          ],
        },
      }).catch((e) => console.log(e));
    }

    return true;
  }
}
