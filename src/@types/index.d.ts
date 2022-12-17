export { sendEmbedOptions } from './sendEmbedOptions';
export { CommandType, MenuType } from './Command';
export { RegisterCommandsOptions } from './Client';

export enum Colours {
    YELLOW = 0xffff00,
    RED = 0x800000,
    GREEN = 0x008000,
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            guildId: string;
            enviroment: 'dev' | 'prod' | 'debug';
            DATABASE_URL: string;
        }
    }
}

export {};
