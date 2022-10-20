import { UserStatus, UserType } from '@prisma/client';
import { CommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { createAuditLog } from '../../utils/db';
import { mapAnyType } from '../../utils/helpers';
import { sendEmbed } from '../../utils/messages';

export default class AddUserCommand extends SlashCommand {
  constructor(client: Bot) {
    super({
      client,
      name: 'adduser',
      description: 'Add a user to the database',
      type: 'CHAT_INPUT',
      options: [
        {
          type: 'STRING',
          name: 'id',
          description: 'User ID',
          required: true,
        },
        {
          type: 'STRING',
          name: 'type',
          description: 'User Type',
          required: true,
          choices: mapAnyType(UserType),
        },
        {
          type: 'STRING',
          name: 'status',
          description: 'User Status',
          required: true,
          choices: mapAnyType(UserStatus),
        },
        {
          type: 'STRING',
          name: 'server',
          description: 'Linked Server',
          required: true,
        },
        {
          type: 'STRING',
          name: 'reason',
          description: 'Reason',
          required: true,
        },
      ],
      defaultPermission: false,
      staffRole: 'DEV',
    });
  }

  public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
    const id = interaction.options.get('id')?.value as Snowflake;
    const status = interaction.options.get('status')?.value as UserStatus;
    const type = interaction.options.get('type')?.value as UserType;
    const server = interaction.options.get('server')?.value as string;
    const reason = interaction.options.get('reason')?.value as string;

    if (id?.length < 17) {
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

    client.users
      .fetch(id)
      .then(async (user) => {
        const isBadServer = await client.db.badServers.count({ where: { id: server } });

        if (isBadServer === 0) {
          sendEmbed({
            interaction,
            hidden: true,
            embed: {
              description: '`🔴` That server is not blacklisted',
              color: Colours.RED,
            },
          });
          return false;
        }

        const count = await client.db.users.count({ where: { id } });

        if (count === 1) {
          await client.db.imports.create({
            data: {
              User: {
                connect: {
                  id: id,
                },
              },
              BadServer: {
                connect: {
                  id: server,
                },
              },
              type,
              roles: 'Undefined',
              appealed: false,
            },
          });
          await client.db.users.update({ where: { id }, data: { status, type, reason } });
        } else {
          await client.db.users.create({
            data: {
              id,
              last_username: user?.username ? `${user.username}#${user.discriminator}` : 'unknown#0000',
              avatar: user.avatarURL() ?? 'https://cdn.mk3ext.dev/yuva7/HaXeYOBA30.png',
              type,
              status,
              reason,
              servers: {
                connectOrCreate: {
                  where: {
                    id_server: {
                      id,
                      server,
                    },
                  },
                  create: {
                    BadServer: {
                      connect: {
                        id: server,
                      },
                    },
                    roles: 'Undefined',
                    type,
                    appealed: false,
                  },
                },
              },
            },
          });
        }

        createAuditLog(client, {
          executedBy: interaction.user.id,
          action: 'user_created',
          message: JSON.stringify({ id, type, status, server }),
        });

        sendEmbed({
          interaction,
          embed: {
            description: `\`🟢\` Successfully created user ${user.username}#${user.discriminator} (${id})`,
            color: Colours.GREEN,
          },
        });

        return true;
      })
      .catch((e) => {
        console.log(e);
        sendEmbed({
          interaction,
          embed: {
            description: '`🔴` Could not retrieve this user from Discords API',
            color: Colours.RED,
          },
        });
      });

    return true;
  }
}
