import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { Intents } from 'discord.js';
import { Logger, Bot } from './classes';

const logger = new Logger();
const db = new PrismaClient();

const client = new Bot(logger, db, {
  intents: new Intents(519),
  partials: ['CHANNEL', 'USER', 'GUILD_MEMBER'],
});

(async () => {
  await client.loadEvents(__dirname + '/events');
  await client.loadCommands(__dirname + '/commands');
  await client.login(process.env.TOKEN);
  client.startTimers();
  client.randomStatus();
})();

Error['stackTraceLimit'] = 25;

process.on('uncaughtException', (error: Error) => {
  console.log('----- Uncaught exception -----');
  console.log(error.stack);
  console.log('----- Exception origin -----');
  console.log(error.message);
  const date = new Date();
  fs.writeFileSync(`execption/${Math.floor(date.getTime() / 1000)}`, JSON.stringify({ error: error.stack, origin }));
});

process.on('unhandledRejection', (reason: Error, promise: Promise<unknown>) => {
  console.log('----- Unhandled Rejection at -----');
  console.log(promise);
  console.log('----- Reason -----');
  console.log(reason);
  const date = new Date();
  console.warn('Unhandled promise rejection:', promise, 'reason:', reason.stack);
  fs.writeFileSync(
    `rejections/${Math.floor(date.getTime() / 1000)}`,
    JSON.stringify({ promise, reason: reason.stack })
  );
});

export { client };
