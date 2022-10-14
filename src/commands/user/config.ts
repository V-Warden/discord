import { CommandInteraction } from 'discord.js';
import { updateGuildPunishment } from '../../utils/db';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';

export default class ConfigCommand extends SlashCommand {
  constructor(client: Bot) {
    super({
      client,
      name: 'config',
      description: 'Adjust this Guilds Settings for Warden',
      type: 'CHAT_INPUT',
      options: [
        {
          type: 'SUB_COMMAND',
          name: 'settings',
          description: 'All bot settings',
        },
        {
          type: 'SUB_COMMAND',
          name: 'logs',
          description: 'Log Channel Settings',
          options: [
            {
              type: 'STRING',
              name: 'logchan',
              description: 'Log Channel ID',
              required: true,
            },
          ],
        },
        {
          type: 'SUB_COMMAND',
          name: 'punish',
          description: 'Punishment role settings',
          options: [
            {
              type: 'BOOLEAN',
              name: 'enable',
              description: 'Enable/disable punishment with role',
              required: true,
            },
            {
              type: 'ROLE',
              name: 'role',
              description: 'Role that the blacklisted user will receive',
            },
          ],
        },
      ],
      defaultPermission: false,
      permission: 'ADMINISTRATOR',
    });
  }

  public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
    const logchan = interaction.options.get('logchan')?.value as string;
    const rolePunish = interaction.options.get('enable')?.value as boolean;
    const roleId = interaction.options.get('role')?.value as string;

    if (rolePunish !== undefined) {
      if (!rolePunish) {
        await updateGuildPunishment(client, interaction.guild.id, { roleId: null });
        await interaction.reply({
          ephemeral: true,
          embeds: [
            {
              description: 'Successfully `disabled` role punishment',
              color: Colours.GREEN,
            },
          ],
        });
        return true;
      }
      if (!roleId) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            {
              description: 'No punishment role was specified.',
              color: Colours.RED,
            },
          ],
        });
        return false;
      }
      const guildRole = interaction.guild.roles.cache.find((role) => role.id === roleId);
      if (guildRole.name === '@everyone') {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            {
              description: "Can't assign blacklist role to the default `everyone` role.",
              color: Colours.RED,
            },
          ],
        });
        return false;
      }
      await updateGuildPunishment(client, interaction.guild.id, { roleId: guildRole.id });
      await interaction.reply({
        ephemeral: true,
        embeds: [
          {
            description: `Successfully \`enabled\` role punishment. \n\n Punishment role: <@&${guildRole.id}>`,
            color: Colours.GREEN,
          },
        ],
      });
      return true;
    }

    if (logchan) {
      interaction.guild.channels
        .fetch(logchan)
        .then(async () => {
          await client.db.guild
            .update({
              where: { id: interaction.guild.id },
              data: { logChannel: logchan },
            })
            .then(async () => {
              await interaction.reply({
                ephemeral: true,
                embeds: [
                  {
                    description:
                      'Successfully updated the log channel, make sure I can `SEND_MESSAGES` in that channel',
                    color: Colours.GREEN,
                  },
                ],
              });
            })
            .catch(async () => {
              await interaction.reply({
                ephemeral: true,
                embeds: [
                  {
                    description: 'An unexpected error has occured, please open a support ticket in Warden discord',
                    color: Colours.RED,
                  },
                ],
              });
            });
        })
        .catch(async () => {
          await interaction.reply({
            ephemeral: true,
            embeds: [
              {
                description: 'Unknown Channel ID',
                color: Colours.RED,
              },
            ],
          });
          return false;
        });
    }

    if (!rolePunish && !logchan) {
      await interaction.reply({ ephemeral: true, content: 'Sent configuration menu' });
      client.config.sendConfigMenu(interaction, interaction.guild.id);
    }

    return true;
  }
}
