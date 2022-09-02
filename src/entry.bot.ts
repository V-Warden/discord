import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

import { Intents } from 'discord.js';
import { Logger, Bot } from './classes';

const logger = new Logger();
const db = new PrismaClient();

const client = new Bot(logger, db, {
    intents: new Intents(33287),
    partials: ['CHANNEL', 'USER', 'GUILD_MEMBER'],
});

(async () => {
    await client.loadEvents(__dirname + '/events');
    await client.loadCommands(__dirname + '/commands');
    await client.login(process.env.TOKEN);
    client.startTimers();
    client.randomStatus();
})();

Error['stackTraceLimit'] = 20;

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

process.on('uncaughtException', err => {
    console.error('Unhandled Exception: ', err);
});

export { client };
