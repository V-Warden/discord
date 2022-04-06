import { FilterType, UserStatus, UserType } from '@prisma/client';
import { Snowflake } from 'discord.js';

export enum noServerPerms {
    KICK,
    BAN,
    SEND_MESSAGE,
}
export interface ServerDataOptions {
    id: Snowflake;

    type: UserType;

    data: {};
}

export interface UserOptions {
    id: Snowflake;
    last_username: string;
    avatar: string;
    status: UserStatus;
    user_type: UserType;
    servers: string;
    roles: string;
    filter_type: FilterType;
    reason: string;
}
