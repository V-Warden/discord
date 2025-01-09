import { ApplicationCommandType } from 'discord.js'
import { CommandType } from '../@types'

export class Command {
    constructor(commandOptions: CommandType) {
        Object.assign(this, {
            ...commandOptions,
            ...{
                type: ApplicationCommandType.ChatInput,
            },
        })
    }
}
