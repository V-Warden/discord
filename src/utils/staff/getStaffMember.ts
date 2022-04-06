import { Bot } from '../../classes';

export async function getStaffMember({ client, id }: { client: Bot; id: string }) {
    return await client.db.staff.findUnique({
        where: {
            id,
        },
    });
}
