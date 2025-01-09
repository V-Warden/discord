declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string
            guildId: string
            enviroment: 'dev' | 'prod' | 'debug'
            DATABASE_URL: string
            LOKI_URL: string
            LOKI_AUTH: string
        }
    }
}

export { }
