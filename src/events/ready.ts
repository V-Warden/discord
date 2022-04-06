import { Bot } from '../classes/Bot';

export default async function (client: Bot) {
    client.logger.info('Bot is ready!');

    const arr = client.commands.map(c => c);
    client.application.commands
        .set(arr)
        .then(() => client.logger.info('Loaded application commands successfully'))
        .catch(e => console.log(e));

    client.application.commands.fetch().then(async commands => {
        await commands.reduce(async (a, command) => {
            await a;
            if (command.name === 'badserver') {
                client.application.commands.delete(command.id);
                client.logger.info(`Deleting command ${command.name} - ${command.id}`);
            }
        }, Promise.resolve());
    });
}
