import { Bot } from '../classes/Bot';
import data from '../config.json';

export default async function (client: Bot) {
    client.logger.info('Bot is ready!');

    const arr = client.commands.filter(c => !c.staffRole).map(c => c);
    client.application.commands
        .set(arr)
        .then(() => client.logger.info('Loaded application commands successfully'))
        .catch(e => console.log(e));

    const staffcmds = client.commands
        .filter(c => c.staffRole && (c.staffRole === 'admin' || c.staffRole === 'dev'))
        .map(c => c);
    const toDisable = staffcmds.map(c => c.name);

    client.application.commands.fetch().then(async commands => {
        await commands.reduce(async (a, command) => {
            await a;
            if (command.name === 'badserver' || command.name === 'reload' || command.name in toDisable) {
                client.application.commands.delete(command.id);
                client.logger.info(`Deleting command ${command.name} - ${command.id}`);
            }
        }, Promise.resolve());
    });

    await (await client.guilds.fetch(data.MAIN_GUILD)).commands.set(staffcmds).then(() => {
        client.logger.info(
            `Successfully set ${staffcmds.map(c => c.name).join(', ')} to ${data.MAIN_GUILD}`
        );
    });
}
