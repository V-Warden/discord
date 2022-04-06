import { Bot } from '../../classes';

export async function getAllBadServers({ client }: { client: Bot }) {
    return await client.db.badServers.findMany({});
}
