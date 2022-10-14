import { Punish, UserType } from '@prisma/client';
import {
  ButtonInteraction,
  Interaction,
  MessageActionRow,
  MessageSelectOptionData,
  SelectMenuInteraction,
} from 'discord.js';
import { Colours } from '../@types';
import { Bot } from '../classes/Bot';
import { updateGuildPunishment } from '../utils/db';
import { sendEmbed } from '../utils/messages';

export default async function (client: Bot, interaction: Interaction) {
  try {
    if (interaction.isCommand()) {
      const slashCommand = client.commands.find((c) => c.name === interaction.commandName);
      if (!slashCommand) {
        await interaction.reply({
          content: 'An error has occurred',
          ephemeral: true,
        });
        client.logger.error(`interactionCreate ${interaction.commandName}: Not a registered command`);
        return false;
      }

      let has = false;
      if (slashCommand?.staffRole) {
        const staff = await client.db.staff.findUnique({ where: { id: interaction.user.id } });
        if (staff && (staff.role === 'DEV' || staff.role === slashCommand.staffRole)) {
          has = true;
        } else {
          has = false;
        }
      } else {
        has = true;
      }

      try {
        if (has && slashCommand.cooldown) {
          const now = Date.now();
          const timestamps = client.getCooldownTimestamps(slashCommand.name);
          const cooldownAmount = slashCommand.cooldown ? slashCommand.cooldown * 1000 : 0;
          if (timestamps.has(interaction.guildId)) {
            const currentTime = timestamps.get(interaction.guildId);
            if (currentTime) {
              const expiration = currentTime + cooldownAmount;

              if (now < expiration) {
                const timeLeft = (expiration - now) / 1000;
                has = false;
                sendEmbed({
                  interaction,
                  hidden: true,
                  embed: {
                    description: `⏰ You must wait \`${Math.floor(timeLeft)}s\` to use this comand`,
                    color: Colours.YELLOW,
                  },
                }).catch();
              }
            }
          } else {
            timestamps.set(interaction.guildId, now);
            setTimeout(() => timestamps.delete(interaction.guildId), cooldownAmount);
          }
        }

        if (has) await slashCommand.run(client, interaction);
        else {
          sendEmbed({
            interaction,
            hidden: true,
            embed: {
              description: `\`❌\` You must be a \`${slashCommand.staffRole}\` to use this command`,
              color: Colours.RED,
            },
          });
          return false;
        }
      } catch (e) {
        console.log(e);
        client.logger.error(`Unknown interaction - ${slashCommand.name}`);
      }
    } else {
      if (interaction.isButton()) {
        const bInt = interaction as ButtonInteraction;

        if (bInt.customId.includes('CONFIG_')) {
          client.emit('configMenu', bInt);
          return false;
        } else if (bInt.customId === 'PUNISHMENT_PANEL') {
          await interaction
            .reply({
              embeds: [
                {
                  author: {
                    name: 'Punishment Menu!',
                    iconURL: client.user.defaultAvatarURL,
                  },
                  description: 'Select the type to update',
                  color: Colours.GREEN,
                },
              ],
              components: [
                new MessageActionRow().addComponents([
                  {
                    type: 'SELECT_MENU',
                    customId: 'TYPE_OF_PUNISHMENT',
                    placeholder: 'Nothing selected',
                    options: [
                      {
                        label: 'Other',
                        value: UserType.OTHER,
                      },
                      {
                        label: 'Leaker',
                        value: UserType.LEAKER,
                      },
                      {
                        label: 'Cheater',
                        value: UserType.CHEATER,
                      },
                      {
                        label: 'Supporter',
                        value: UserType.SUPPORTER,
                      },
                      {
                        label: 'Owner',
                        value: UserType.OWNER,
                      },
                    ],
                  },
                ]),
              ],
            })
            .then(async () => {
              const filter = (i: SelectMenuInteraction) => {
                return i.user.id === interaction.user.id && i.memberPermissions.has('ADMINISTRATOR');
              };

              let userType;
              await interaction.channel
                .awaitMessageComponent({
                  filter,
                  componentType: 'SELECT_MENU',
                  time: 60000,
                })
                .then(async (i) => {
                  userType = i.values[0];
                  const message = await i.channel.messages.fetch(i.message.id);
                  message.delete();
                })
                .catch((err) => console.log(err));

              const punishment: Punish = await sendPunish(client, bInt, userType);

              switch (userType) {
                case 'OTHER': {
                  await updateGuildPunishment(client, interaction.guild.id, {
                    other: punishment,
                  });
                  break;
                }
                case 'LEAKER': {
                  await updateGuildPunishment(client, interaction.guild.id, {
                    leaker: punishment,
                  });
                  break;
                }
                case 'CHEATER': {
                  await updateGuildPunishment(client, interaction.guild.id, {
                    cheater: punishment,
                  });
                  break;
                }
                case 'SUPPORTER': {
                  await updateGuildPunishment(client, interaction.guild.id, {
                    supporter: punishment,
                  });
                  break;
                }
                case 'OWNER': {
                  await updateGuildPunishment(client, interaction.guild.id, {
                    owner: punishment,
                  });
                  break;
                }
              }

              client.config.sendConfigMenu(interaction, interaction.guild.id);
            })
            .catch((e: string) => console.log(e));
        }
      }
    }
    return true;
  } catch (e) {
    console.log('failed');
  }
}

async function sendPunish(client: Bot, interaction: ButtonInteraction, type: string): Promise<Punish> {
  const punishments: MessageSelectOptionData[] = Object.keys(Punish)
    .map((x) => {
      return <MessageSelectOptionData>{ label: `${x}`, value: x };
    })
    .filter((x) => {
      if (Object.keys(x).length === 0) return false;
      else return true;
    });

  await interaction.channel.send({
    embeds: [
      {
        author: {
          name: 'Punishment Menu!',
          iconURL: client.user.defaultAvatarURL,
        },
        description: `Update the punishment type for people with type of \`${type}\``,
        color: Colours.GREEN,
      },
    ],
    components: [
      new MessageActionRow().addComponents([
        {
          type: 'SELECT_MENU',
          customId: 'CONFIG_PUNISHMENTS',
          placeholder: 'Nothing selected',
          options: punishments,
        },
      ]),
    ],
  });

  const filter = (i: SelectMenuInteraction) => {
    return i.user.id === interaction.user.id;
  };

  let punishment;
  await interaction.channel
    .awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
    .then(async (i) => {
      punishment = i.values[0];
      const message = await i.channel.messages.fetch(i.message.id);
      message.delete();
    })
    .catch((err) => console.log(err));

  return punishment;
}
