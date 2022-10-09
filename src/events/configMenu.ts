import { ButtonInteraction, Message, MessageActionRow, MessageSelectOptionData } from 'discord.js';
import { Colours } from '../@types';
import { Bot } from '../classes';
import { updateGuildPunishment } from '../utils/db';

export default async function (client: Bot, interaction: ButtonInteraction): Promise<void> {
  const customId = interaction.customId.split('CONFIG_')[1];

  const message = await interaction.channel.messages.fetch(interaction.message.id);

  const guild = await client.db.guild.findUnique({
    where: { id: message.guild.id },
    select: { punishments: true },
  });

  delete guild.punishments.id;
  switch (customId) {
    case 'TOGGLE_ACTIONING': {
      if (guild.punishments.enabled) {
        await updateGuildPunishment(client, message.guild.id, { enabled: false });
      } else {
        await updateGuildPunishment(client, message.guild.id, { enabled: true });
      }
      break;
    }
    case 'TOGGLE_GLOBAL': {
      if (guild.punishments.globalCheck) {
        await updateGuildPunishment(client, message.guild.id, { globalCheck: false });
      } else {
        await updateGuildPunishment(client, message.guild.id, { globalCheck: true });
      }
      break;
    }
    case 'SET_ROLE': {
      const guildRoles: MessageSelectOptionData[] = [
        { label: 'Disable', value: 'no_role', emoji: '❌' },
        ...interaction.guild.roles.cache.map((role) => ({ label: role.name, value: role.id })),
      ].filter((role) => role.label !== '@everyone'); // Exclude the default @everyone role
      try {
        await interaction.reply({
          embeds: [
            {
              author: {
                name: 'Punishment role',
                iconURL: client.user.defaultAvatarURL,
              },
              description: 'Set a role for blacklisted users to receive upon joining',
              color: Colours.GREEN,
            },
          ],
          components: [
            new MessageActionRow().addComponents([
              {
                type: 'SELECT_MENU',
                customId: 'PUNISHMENT_ROLE',
                placeholder: 'Nothing selected',
                options: guildRoles,
              },
            ]),
          ],
        });

        await interaction.channel
          .awaitMessageComponent({
            filter: (i) => i.user.id === interaction.user.id,
            componentType: 'SELECT_MENU',
            time: 60000,
          })
          .then(async (i) => {
            const roleId = i.values[0];
            const message = await i.channel.messages.fetch(i.message.id);
            message.delete();
            updateGuildPunishment(client, message.guild.id, { roleId: roleId === 'no_role' ? null : roleId });
          })
          .catch((err) => console.log(err));
      } catch (e) {
        console.log(e);
        await interaction.reply({
          embeds: [
            {
              description:
                'This interaction has failed, please make sure you have channels, if you do report this in the Warden Discord',
              color: Colours.RED,
            },
          ],
        });
      }
      break;
    }
    case 'TOGGLE_UNBAN': {
      if (guild.punishments.unban) {
        await updateGuildPunishment(client, message.guild.id, { unban: false });
      } else {
        await updateGuildPunishment(client, message.guild.id, { unban: true });
      }
      break;
    }
    case 'LOG_CHANNEL': {
      try {
        await interaction.reply({
          embeds: [
            {
              author: {
                name: 'Log Channel!',
                iconURL: client.user.defaultAvatarURL,
              },
              description: '**Please respond with the channel you wish to send logs to!**\nEg; `#warden-logs`',
              color: Colours.GREEN,
            },
          ],
        });

        const filter = (m: Message) => {
          return m.author.id === interaction.user.id && m.member.permissions.has('ADMINISTRATOR');
        };

        await interaction.channel
          .awaitMessages({ filter, time: 60000, max: 1 })
          .then(async (m) => {
            const mentions = m.first().mentions.channels;
            m.first()
              .delete()
              .catch(() => console.log('unable to delete message'));
            if (mentions.size === 1) {
              await client.db.guild.update({
                where: { id: message.guild.id },
                data: { logChannel: mentions.first().id },
              });
            }
            interaction.deleteReply();
          })
          .catch((err) => console.log(err));
      } catch (e) {
        console.log(e);
        await interaction.reply({
          embeds: [
            {
              description:
                'This interaction has failed, please make sure you have channels, if you do report this in the Warden Discord',
              color: Colours.RED,
            },
          ],
        });
      }
      break;
    }
  }

  client.config.sendConfigMenu(interaction, interaction.guild.id);

  if (!interaction.deferred && !interaction.replied) return await interaction.deferUpdate();
  else return;
}
