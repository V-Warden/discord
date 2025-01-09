import { CommandInteraction } from 'discord.js'
import { createLogger, transports, format } from 'winston'
import LokiTransport from 'winston-loki'
import { Colours } from '../@types/Colours'
import sendEmbed from './messages/sendEmbed'
import { generateErrorID } from './misc'

require('dotenv').config()

const consoleFormat = format.printf(({ level, labels, message, timestamp }) => {
    const labelString = labels ? Object.entries(labels).map(([key, value]) => `${key}: ${value}`).join(', ') : ''
    return `[${timestamp}] [${level}] | ${JSON.stringify(`${labelString ? `${labelString}, message: ` : ''}${message}`)}`
})

const transport_logs: any = [
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
]

if (process.env.LOKI_URL) {
    transport_logs.push(
        new LokiTransport({
            host: process.env.LOKI_URL ?? '',
            basicAuth: process.env.LOKI_AUTH ?? '',
            labels: { app: `warden-${process.env.enviroment}` },
            batching: true,
            interval: 10,
            json: true,
            replaceTimestamp: true,
            format: format.json(),
            onConnectionError: (err: any) => console.error(err),
        })
    )
}

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: transport_logs,
    exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
    rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
})

/**
 * To be used when
 * @param interaction CommandInteraction
 * @param e Exception thrown
 * @returns Error ID
 */
export async function logException(interaction: CommandInteraction | null, e: any): Promise<string> {
    const errorId = generateErrorID()
    e = e.message ?? e

    if (interaction) {
        const args = interaction.options.data.map(x => {
            return { name: x.name, value: x.value }
        })

        logger.error({
            labels: { command: interaction.commandName, errorId },
            message: { e, args },
        })

        try {
            sendEmbed({
                interaction,
                embed: {
                    description: `\`🔴\` An unexpected error has occured\n> Error ID: \`${errorId}\`\n> Please report this in the [Warden Discord](https://discord.gg/MVNZR73Ghf)`,
                    color: Colours.RED,
                },
                ephemeral: true,
            })
        } catch (e) { }
    } else {
        logger.error({
            labels: { errorId },
            message: { e },
        })
    }

    return errorId
}

export default logger
