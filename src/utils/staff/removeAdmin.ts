import { Bot } from '../../classes';

export async function removeAdmin({ client, id }: { client: Bot; id: string }) {
    return await client.db.staff.delete({
        where: {
            id,
        },
    });
}
