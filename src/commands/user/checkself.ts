import { CommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class CheckSelfCommand extends SlashCommand {
  constructor(client: Bot) {
    super({
      client,
      name: 'checkself',
      description: 'Find out which servers you were scanned in!',
      type: 'CHAT_INPUT',
      options: [],
      defaultPermission: true,
    });
  }

  public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
    const imports = await client.db.imports.findMany({
      where: { id: interaction.user.id, appealed: false },
      select: { BadServer: true },
    });

    if (imports.length > 0) {
      const badServers: string[] = [];

      for (let i = 0, l = imports.length; i < l; ++i) {
        const x = imports[i];
        badServers.push(x.BadServer.name);
      }

      sendEmbed({
        hidden: true,
        interaction,
        embed: {
          description: `\`🔴\` You were found in the following servers:\`\`\`${badServers.join('\n')}\`\`\``,
          color: Colours.RED,
        },
      });
    } else {
      sendEmbed({
        hidden: true,
        interaction,
        embed: {
          description: '`🟢` You have not been found in any servers',
          color: Colours.GREEN,
        },
      });
    }
    return true;
  }
}
