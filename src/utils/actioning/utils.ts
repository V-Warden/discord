import { Punish, Punishments, UserType } from '@prisma/client'

export function getPunishment(userType: UserType, punishments: Punishments, BadServersType: string[]): Punish {
    const punishmentOrder: Punish[] = ['WARN', 'ROLE', 'KICK', 'BAN']

    // Get the punishment for the userType
    let toDo: Punish = 'WARN'
    if (userType === UserType.OWNER) {
        toDo = punishments.owner
    } else if (userType === UserType.SUPPORTER) {
        toDo = punishments.supporter
    } else if (userType === UserType.LEAKER) {
        toDo = punishments.leaker
    } else if (userType === UserType.CHEATER) {
        toDo = punishments.cheater
    } else if (userType === UserType.OTHER) {
        toDo = punishments.other
    }

    // Get the highest punishment from BadServersType
    for (const type of BadServersType) {
        let punishment: Punish = 'WARN'
        if (type === 'OWNER') {
            punishment = punishments.owner
        } else if (type === 'SUPPORTER') {
            punishment = punishments.supporter
        } else if (type === 'LEAKER') {
            punishment = punishments.leaker
        } else if (type === 'CHEATER') {
            punishment = punishments.cheater
        } else if (type === 'OTHER') {
            punishment = punishments.other
        }

        // Compare and get the highest punishment
        if (punishmentOrder.indexOf(punishment) > punishmentOrder.indexOf(toDo)) {
            toDo = punishment
        }
    }

    return toDo
}

export function convertServersTypeToUsersType(BadServersType: string[]): UserType[] {
    return BadServersType.map(type => {
        if (type === 'CHEATING') {
            return 'CHEATER'
        } else if (type === 'RESELLING' || type === 'ADVERTISING' || type === 'OTHER') {
            return 'OTHER'
        } else if (type === 'LEAKING') {
            return 'LEAKER'
        }
        return type as UserType
    })
}
