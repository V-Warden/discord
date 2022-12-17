import { Punish, Punishments, UserType } from '@prisma/client';

export function getPunishment(type: UserType, punishments: Punishments): Punish {
    let toDo: Punish = 'WARN';
    switch (type) {
        case UserType.OWNER:
            toDo = punishments.owner;
            break;
        case UserType.SUPPORTER:
            toDo = punishments.supporter;
            break;
        case UserType.LEAKER:
            toDo = punishments.leaker;
            break;
        case UserType.CHEATER:
            toDo = punishments.cheater;
            break;
        case UserType.OTHER:
            toDo = punishments.other;
            break;
    }

    return toDo;
}
