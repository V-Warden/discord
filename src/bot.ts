import { ExtendedClient } from './structures/Client'

export const client = new ExtendedClient()

client.start()

client.on('warn', e => console.warn(e))
client.on('debug', e => console.debug(e))
client.on('error', e => console.error(e))

process.on('unhandledRejection', e => console.error(e))
process.on('uncaughtException', e => console.error(e))
