import amqp from 'amqplib';

const USERNAME = process.env.RABBITMQ_USER
const PASSWORD = process.env.RABBITMQ_PASS
const HOST = process.env.RABBITMQ_HOST
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;
let inactivityTimer: NodeJS.Timeout | null = null;

async function getChannel() {
    if (!connection) {
        connection = await amqp.connect(`amqp://${USERNAME}:${PASSWORD}@${HOST}`!);
    }
    if (!channel) {
        channel = await connection.createChannel();
        const queue = 'actionUser';
        await channel.assertQueue(queue, { durable: true });
    }
    return channel;
}

function resetInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    inactivityTimer = setTimeout(async () => {
        await closeConnection();
    }, INACTIVITY_TIMEOUT);
}

/**
 * Sends a message to the queue to action a user
 * @param server server id
 * @param user user id
 */
export default async function (
    id: string,
    guildId: string,
    punishment: string,
) {
    const channel = await getChannel();
    const queue = 'actionUser';
    channel.sendToQueue(queue, Buffer.from(JSON.stringify({ "id": id, "guildId": guildId, "punishment": punishment })), { persistent: true });
    resetInactivityTimer();
}

export async function closeConnection() {
    if (channel) {
        await channel.close();
        channel = null;
    }
    if (connection) {
        await connection.close();
        connection = null;
    }
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}
