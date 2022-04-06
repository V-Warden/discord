import dotenv from 'dotenv';
dotenv.config();

import * as prisma from '@prisma/client';

import { Intents } from 'discord.js';
import { Logger, Bot, Processing } from './classes';

const logger = new Logger();
const processing = new Processing();
const db = new prisma.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});

const client = new Bot(logger, processing, db, {
    intents: new Intents(515),
    partials: ['CHANNEL', 'USER', 'GUILD_MEMBER'],
});

(async () => {
    await client.loadEvents(__dirname + '/events');
    await client.loadCommands(__dirname + '/commands');
    client.startTimers();
    await client.login(process.env.TOKEN);
})();

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

process.on('uncaughtException', err => {
    console.error('Unhandled Exception: ', err);
});

/**
 *
 * Database events
 */

db.$on('info', (e: prisma.Prisma.LogEvent) => {
    client.logger.prisma(e.message);
});

db.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    if (params.action === 'findUnique') return result;
    if (client.processing.isProcessing()) return result;
    const after = Date.now();
    client.logger.prisma(`Query - ${params.model}.${params.action} took ${after - before}ms`);

    return result;
});

db.$on('warn', (e: prisma.Prisma.LogEvent) => {
    client.logger.prisma(e.message);
});

db.$on('error', (e: prisma.Prisma.LogEvent) => {
    client.logger.prisma(e.message);
});

export { client };
