import { Punishments, UserType } from '@prisma/client'

export type HistoryResponse = {
    name: string
    roles: string
    servers?: string[]
    type?: UserType
}

export type ReturnGuild = {
    id?: string
    name?: string
    logChannel?: string
    punishments?: Punishments
    createdAt?: Date
    updatedAt?: Date
}
