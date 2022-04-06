import { Bot } from '../../classes';

export async function assignAdmin({ client, id }: { client: Bot; id: string }) {
    return await client.db.staff.create({
        data: {
            id,
            admin: true,
        },
    });
}
