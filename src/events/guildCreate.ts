import { Guild, TextChannel } from 'discord.js';
import { Colours } from '../@types';
import { Bot } from '../classes/Bot';
import { createGuild } from '../utils/db';
import { sendEmbed } from '../utils/messages';

export default async function (client: Bot, guild: Guild) {
  client.logger.info(`Joined new guild ${guild.name} with ${guild.memberCount} members. Owner is ${guild.ownerId}`);

  await createGuild(client, guild);

  try {
    const channel = (await guild.channels.fetch()).filter((chan) => chan.isText()).first() as TextChannel;
    if (channel) {
      sendEmbed({
        channel,
        embed: {
          title: `Hello ${guild.name}!`,
          description: `My name is VVarden!
                You can call me Warden or 5 Warden (V Warden).
                \nThank you for inviting me to your Discord Server!
                I'm trying to make the CFX Community a better place.
                \nMake sure to check my configuration settings by using \`/config\` command!
                I also need to have the permissions to kick and ban members, with a role higher than them!
                \nI'm already acting on new member joins.
                \nIf you want to contribute to the project, use the Official Discord: <https://discord.gg/jeFeDRasfs>`,
          color: Colours.GREEN,
        },
      }).catch((e) => client.logger.error(`guildCreate: ${guild.name} - ${e}`));
    }
  } catch (e) {
    console.log(e);
  }
}
