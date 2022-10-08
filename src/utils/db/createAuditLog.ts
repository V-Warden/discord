import { LogActions } from '@prisma/client';
import { Bot } from '../../classes';

/**
 * Log an action
 */
export async function createAuditLog(
  client: Bot,
  {
    executedBy,
    action,
    message,
  }: {
    executedBy: string;
    action: LogActions;
    message: string;
  }
) {
  return await client.db.logs.create({
    data: {
      action,
      message,
      staffMember: {
        connect: {
          id: executedBy,
        },
      },
    },
  });
}
