import { PrismaClientValidationError } from '@prisma/client/runtime';
import { CommandInteraction } from 'discord.js';
import { createLogger, transports, format } from 'winston';
import LokiTransport from 'winston-loki';
import { Colours } from '../@types/Colours';
import sendEmbed from './messages/sendEmbed';

const consoleFormat = format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}] | ${((message instanceof Object) ? JSON.stringify(message) : message)}`;
});

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [
        new transports.Console({
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.colorize(),
                format.splat(),
                consoleFormat
            ),
        }),
        new LokiTransport({
            host: 'https://logs-prod3.grafana.net',
            basicAuth:
                '297470:eyJrIjoiOGMxYzJhY2YyYjg3YzdiY2NmZGQwOTc4ZjUwYzZkYzA1MDNkYTQzOCIsIm4iOiJXYXJkZW4iLCJpZCI6NzIwNjgxfQ==',
            labels: { app: 'warden-test' },
            batching: true,
            interval: 10,
            json: true,
            replaceTimestamp: true,
            format: format.json(),
            onConnectionError: (err: any) => console.error(err),
        }),
    ],
    exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
    rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
});

/**
 * To be used when
 * @param interaction CommandInteraction
 * @param e Exception thrown
 * @returns Error ID
 */
export async function logException(interaction: CommandInteraction | null, e: any): Promise<string> {
    const errorId = (Math.random() + 1).toString(36).substring(3);
    e = e.message ?? e

    if (interaction) {
        const args = interaction.options.data.map(x => {
            return { name: x.name, value: x.value };
        });

        logger.error({
            labels: { command: interaction.commandName, errorId },
            message: { e, args },
        });

        try {
            sendEmbed({
                interaction,
                embed: {
                    description: `\`🔴\` An unexpected error has occured\n> Error ID: \`${errorId}\`\n> Please report this in the [Warden Discord](https://discord.gg/warden)`,
                    color: Colours.RED,
                },
                ephemeral: true,
            });
        } catch (e) {}
    } else {
        logger.error({
            labels: { errorId },
            message: { e },
        });
    }

    return errorId;
}

export default logger;
