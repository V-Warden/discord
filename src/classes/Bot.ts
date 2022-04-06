import * as fs from 'fs/promises';
import * as path from 'path';
import { Client, ClientOptions, Collection, Snowflake, TextChannel } from 'discord.js';
import { SlashCommand, Logger, Processing } from './';
import { PrismaClient } from '@prisma/client';
import { noServerPerms } from '../@types';
import * as cron from 'node-cron';

import glob from 'glob';
import { promisify } from 'util';
const globPromise = promisify(glob);

/**
 * Custom bot class
 */
class Bot extends Client {
    logger: Logger;
    processing: Processing;
    db: PrismaClient;

    /**
     * Collection for bot commands
     */
    commands: Collection<string, SlashCommand>;

    /**
     * Collection for all events
     */
    events: Collection<string, Event>;

    /**
     * Collection for caching guild log channels
     */
    logChans: Collection<Snowflake, TextChannel>;

    /**
     * Collection for caching no permissions to avoid rate limit
     * Cache resets every 5 minutes
     */
    noPerms: Collection<String, noServerPerms[]>;

    /**
     * Collection for command cooldown registration.
     */
    cooldowns: Collection<string, Collection<string, number>>;

    constructor(logger: Logger, processing: Processing, db: PrismaClient, options: ClientOptions) {
        super(options);

        this.commands = new Collection();
        this.events = new Collection();
        this.logChans = new Collection();
        this.cooldowns = new Collection();
        this.noPerms = new Collection();
        this.logger = logger;
        this.processing = processing;
        this.db = db;
    }

    /**
     * Loads all commands.
     */
    async loadCommands(dir: string): Promise<void> {
        const commandFiles = await globPromise(`${dir}/*/*{.ts,.js}`);
        for (const filePath of commandFiles) {
            const commandFile = require(filePath);
            const command = new commandFile.default(this);

            if (!command.name) return;
            this.commands.set(command.name, command);
            this.logger.debug(`Loaded command: ${command.name}`);
        }
    }

    /**
     * Loads all events.
     */
    async loadEvents(dir: string): Promise<void> {
        const items = await fs.readdir(dir);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const eventFile = require(path.join(dir, item));
            this.logger.debug(`Loaded event: ${item.split('.')[0]}`);
            this.on(item.split('.')[0], eventFile.default.bind(null, this));
        }
    }

    /**
     * Returns timestamps of the command.
     * @param commandName Name of the command
     */
    getCooldownTimestamps(commandName: string): Collection<string, number> {
        if (!this.cooldowns.has(commandName))
            this.cooldowns.set(commandName, new Collection<string, number>());
        return this.cooldowns.get(commandName) as Collection<string, number>;
    }

    hasNoPerms(guild: string, type: noServerPerms): boolean {
        if (this.noPerms.has(guild)) {
            return this.noPerms.get(guild).includes(type);
        } else {
            return false;
        }
    }

    addNoPerms(guild: string, type: noServerPerms) {
        let current = this.noPerms.get(guild);
        if (current) {
            current.push(type);
        } else {
            current = [type];
        }
        this.noPerms.set(guild, current);
    }

    resetNoPerms() {
        this.noPerms.clear();
        this.logger.debug('Cleared noPerms cache');
    }

    startTimers() {
        cron.schedule('*/5 * * * *', async () => {
            this.resetNoPerms();
        });

        this.logger.debug('Started timer');
    }

    /**
     * Retrieves channel by id from cache, if set otherwise set
     */
    async getChannelByID(channel: Snowflake, cache: boolean, guildID: Snowflake) {
        const chan = ((await this.channels.cache.get(channel)) ||
            (await this.channels.fetch(channel))) as TextChannel;
        if (cache) this.logChans.set(guildID, chan);
        return chan;
    }
}

export { Bot };
