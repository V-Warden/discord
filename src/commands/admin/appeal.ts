import { UserStatus } from '@prisma/client';
import { CommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { createAuditLog } from '../../utils/db';
import { sendEmbed } from '../../utils/messages';

export default class AppealCommand extends SlashCommand {
  constructor(client: Bot) {
    super({
      client,
      name: 'appeal',
      description: 'Appeal a users status',
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
          description: 'User',
          required: false,
        },
      ],
      defaultPermission: false,
      staffRole: 'ADMIN',
    });
  }

  public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
    if (client.processing.isProcessing()) {
      client.processing.disabledMessage(interaction);
      return false;
    }

    await interaction.deferReply();

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

    const imports = await client.db.imports.findMany({
      where: { id, appealed: false },
    });
    const servers = imports.map((x) => x.server);

    if (imports.length === 0) {
      sendEmbed({
        interaction,
        hidden: true,
        embed: {
          description: '`🔴` That user has no new servers',
          color: Colours.RED,
        },
      });
      return false;
    }

    await client.db.imports.updateMany({
      where: {
        id,
        appealed: false,
      },
      data: {
        appealed: true,
      },
    });

    await client.db.users.update({
      where: {
        id,
      },
      data: {
        status: UserStatus.APPEALED,
        appeals: {
          increment: 1,
        },
      },
    });

    await client.db.staff.update({
      where: {
        id: interaction.user.id,
      },
      data: {
        appeals: { increment: 1 },
      },
    });

    createAuditLog(client, {
      executedBy: interaction.user.id,
      action: 'user_appealed',
      message: JSON.stringify({ user: id, servers }),
    });

    sendEmbed({
      interaction,
      embed: {
        description: `\`🟢\` Successfully appealed <@${id}> (${id})`,
        color: Colours.GREEN,
      },
    });

    const guilds = await client.db.guild.findMany({
      where: {
        punishments: {
          unban: true,
          enabled: true,
        },
      },
    });

    let unbanned = 0;

    for (let i = 0, l = guilds.length; i < l; ++i) {
      const guild = guilds[i];

      client.guilds
        .fetch(guild.id)
        .then((g) => {
          g.bans
            .fetch(id)
            .then((b) => {
              if (b.reason.includes('Warden')) {
                g.bans
                  .remove(id)
                  .then(() => {
                    client.logger.debug(`apeal ${id}: ${guild.name} - Unbanned`);
                    unbanned++;
                  })
                  .catch(() => client.logger.warn(`appeal ${id}: ${guild.name} - Unable to unban`));
              }
            })
            .catch(() => client.logger.warn(`appeal ${id}: ${guild.name} - Invalid ban`));
        })
        .catch(() => client.logger.warn(`appeal ${id}: Bot not in guild ${guild.id}`));
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    client.logger.debug(`appeal ${id}: Finished, unbanned on ${unbanned} guilds`);

    return true;
  }
}
