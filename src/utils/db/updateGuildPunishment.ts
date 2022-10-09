import { Punish } from '@prisma/client';
import { Bot } from '../../classes';

/**
 * Update a guild punishment
 */
export async function updateGuildPunishment(
  client: Bot,
  guildID: string,
  {
    owner,
    supporter,
    cheater,
    leaker,
    other,
    unban,
    enabled,
    globalCheck,
    roleId,
  }: {
    owner?: Punish;
    supporter?: Punish;
    cheater?: Punish;
    leaker?: Punish;
    other?: Punish;
    unban?: boolean;
    enabled?: boolean;
    globalCheck?: boolean;
    roleId?: string | null;
  }
) {
  return await client.db.guild.update({
    where: {
      id: guildID,
    },
    data: {
      punishments: {
        update: {
          unban,
          enabled,
          owner,
          supporter,
          cheater,
          leaker,
          other,
          globalCheck,
          roleId,
        },
      },
    },
  });
}
