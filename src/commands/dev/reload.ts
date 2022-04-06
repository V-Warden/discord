import { BaseCommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import * as simpleGit from 'simple-git';
import path from 'path';

import glob from 'glob';
import { promisify } from 'util';
const globPromise = promisify(glob);
export default class ProcfileCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'reload',
            description: 'Reload the bot (Dev)',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    /**
     * WIP
     */
    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        if (client.processing.isProcessing()) {
            client.processing.disabledMessage(interaction);
            return false;
        }

        const progress = ({ method, stage, progress }: simpleGit.SimpleGitProgressEvent) => {
            console.log(`reload: git ${method} ${stage} stage ${progress}% complete`);
        };

        const baseDir = path.join(__dirname, '../../../');
        const git = simpleGit.default({ baseDir, progress });
        await git.checkout('ts-refactor');
        await git.pull();

        client.commands.sweep(() => true);
        const commandFiles = await globPromise(`${path.join(baseDir, '../../commands')}/*/*{.ts,.js}`);
        for (const filePath of commandFiles) {
            const commandFile = require(filePath);
            const command = new commandFile.default(this);

            if (!command.name) return false;
            client.commands.set(command.name, command);
        }

        const eventFiles = await globPromise(`${path.join(baseDir, '../../events')}/*/*{.ts,.js}`);

        for (const filePath of eventFiles) {
            const eventFile = require(filePath);
            client.on(filePath.split('.')[0], eventFile.default.bind(null, this));
        }
        return true;
    }
}
