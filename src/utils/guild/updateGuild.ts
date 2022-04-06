import { Punish } from '.prisma/client';
import { Bot } from '../../classes';

export async function updateGuild({
    client,
    id,
    name,
    logchan,
    punown,
    puncheat,
    punleak,
    punsupp,
    appealunban,
}: {
    client: Bot;
    id: string;
    name?: string;
    logchan?: string;
    punown?: Punish;
    puncheat?: Punish;
    punleak?: Punish;
    punsupp?: Punish;
    appealunban?: boolean;
}) {
    return await client.db.guild.update({
        where: {
            id: id,
        },
        data: {
            name,
            logchan,
            punown,
            puncheat,
            punleak,
            punsupp,
            appealunban,
        },
        select: null,
    });
}
