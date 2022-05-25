import { User } from 'discord.js';

export interface LogInfo {
    type: LogTypes;
    author: User;
    message: string;
}

export enum LogTypes {
    APPEALED,
    ADD_USER,
    STATUS_UPDATE,
}
