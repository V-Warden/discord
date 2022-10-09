import { CommandInteraction, MessageEmbed } from 'discord.js';
import _ from 'lodash';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { createAuditLog } from '../../utils/db';
import { sendEmbed, sendPagination } from '../../utils/messages';

export default class NoteCommand extends SlashCommand {
  constructor(client: Bot) {
    super({
      client,
      name: 'note',
      description: 'Appeal a users status',
      type: 'CHAT_INPUT',
      options: [
        {
          type: 'SUB_COMMAND',
          name: 'add',
          description: 'Add a note',
          options: [
            {
              type: 'STRING',
              name: 'id',
              description: 'User ID',
              required: true,
            },
            {
              type: 'STRING',
              name: 'note',
              description: 'Note',
              required: true,
            },
          ],
        },
        {
          type: 'SUB_COMMAND',
          name: 'view',
          description: 'View a users notes',
          options: [
            {
              type: 'STRING',
              name: 'id',
              description: 'User ID',
              required: true,
            },
          ],
        },
        {
          type: 'SUB_COMMAND',
          name: 'remove',
          description: 'Remove a specific note',
          options: [
            {
              type: 'NUMBER',
              name: 'nid',
              description: 'Note ID',
              required: true,
            },
          ],
        },
      ],
      defaultPermission: false,
      staffRole: 'ADMIN',
    });
  }

  public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
    const name = interaction.options.data[0]?.name;

    if (name === 'remove') {
      const nId = interaction.options.get('nid')?.value as number;

      client.db.notes
        .delete({ where: { nId } })
        .then((note) => {
          createAuditLog(client, {
            executedBy: interaction.user.id,
            action: 'note_removed',
            message: JSON.stringify({
              nId: note.nId,
              note: note.note,
              addedBy: note.addedBy,
            }),
          });
          sendEmbed({
            interaction,
            embed: {
              description: '`🟢` Successfully deleted note',
              color: Colours.GREEN,
            },
          });
        })
        .catch(() =>
          sendEmbed({
            interaction,
            hidden: true,
            embed: {
              description: '`🔴` Invalid Note ID provided',
              color: Colours.RED,
            },
          })
        );
      return false;
    }

    const id = interaction.options.get('id')?.value as string;

    const user = await client.db.users.findUnique({ where: { id } });

    if (!user) {
      sendEmbed({
        interaction,
        hidden: true,
        embed: {
          description: '`🔴` The ID is either invalid or not in the database',
          color: Colours.RED,
        },
      });
      return false;
    }

    if (name === 'add') {
      const note = interaction.options.get('note')?.value as string;

      client.db.notes
        .create({
          data: {
            user: {
              connect: {
                id,
              },
            },
            note,
            staff: {
              connect: {
                id: interaction.user.id,
              },
            },
          },
        })
        .then((n) => {
          createAuditLog(client, {
            executedBy: interaction.user.id,
            action: 'note_added',
            message: JSON.stringify({
              nId: n.nId,
              note: n.note,
              addedBy: n.addedBy,
            }),
          });

          sendEmbed({
            interaction,
            embed: {
              description: `\`🟢\` Successfully added the following note to <@${id}>\`\`\`${note}\`\`\``,
              color: Colours.GREEN,
            },
          });
        });
    } else if (name === 'view') {
      const notes = await client.db.notes.findMany({
        where: { id },
        select: { user: true, staff: true, note: true, createdAt: true, nId: true },
      });

      if (notes.length === 0) {
        sendEmbed({
          interaction,
          embed: {
            description: '`🟢` This user has no notes',
            color: Colours.GREEN,
          },
        });
        return false;
      }

      const values: string[] = [];
      for (let i = 0; i < notes.length; i++) {
        const x = notes[i];

        values.push(`> ID: ${x.nId}\n> By: <@${x.staff.id}>\n> \`${x.note}\`\n`);
      }

      const chunks = _.chunk(values, 15);
      const pages: MessageEmbed[] = [];
      chunks.forEach((chunk) => {
        pages.push(
          new MessageEmbed({
            author: {
              name: `${notes[0].user.last_username}'s Notes`,
              icon_url: notes[0].user.avatar ?? 'http://cdn.mk3ext.dev/vh5NME2rgr.png',
            },
            description: `${chunk.join('\n')}`,
            color: Colours.RED,
          })
        );
      });
      sendPagination(client, interaction, pages, 60000);
    }

    return true;
  }
}
