import { Bot } from '../classes/Bot';
import express, { Request, Response } from "express";
import data from '../config.json';

export default async function (client: Bot) {
    client.logger.info('Bot is ready!');

    const arr = client.commands.filter(c => !c.staffRole).map(c => c);
    client.application.commands
        .set(arr)
        .then(() => client.logger.info('Loaded application commands successfully'))
        .catch(e => console.log(e));

    const staffcmds = client.commands
        .filter(c => c.staffRole && (c.staffRole === 'ADMIN' || c.staffRole === 'DEV'))
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

    const app = express();
    app.use(express.json());
    app.listen(3000, () => { // The port for the application to listen on (Default: 3000)
        client.logger.info('API listening on port 3000');
    });
    app.get('/firewallgg/checkuser/:userid', async function(req: Request, res: Response) {
        res.set('Access-Control-Allow-Origin', '*');
        if(!req?.params?.userid) return res.redirect('/');
        req.params.userid == req.params.userid.replaceAll('`', '').replaceAll('"', '');
        let id = req.params.userid
        const user = await client.db.users.findUnique({ where: { id } })
        if (!user) {
            let json_ = {
                "active": false, // This means that the user is not banned
            }
            return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
        const imports = await client.db.imports.findMany({
            where: { id, appealed: false },
            select: {
                BadServer: { select: { name: true, oldNames: true, id: true } },
                type: true,
                roles: true,
            },
        });
        if (imports.length === 0 && ['PERM_BLACKLISTED', 'BLACKLISTED'].includes(user.status)) {
            let hasAppealed = false;

            for (let i = 0; i < imports.length; i++) {
                const x = imports[i];

                const result = await client.db.logs.findFirst({
                    where: {
                        AND: [
                            { action: 'user_appealed' },
                            { message: { contains: user.id } },
                            { message: { contains: x.BadServer.id } },
                        ],
                    },
                });
                if (result) hasAppealed = true;
            }

            if (!hasAppealed) {
                await client.db.imports.updateMany({
                    where: { id: user.id },
                    data: { appealed: false },
                });
            }
        }

        if (imports.length > 0 && user.status !== 'WHITELISTED') {
            // is bad person
            let json_: object = {
                "active": true,
                "userid": user.id,
                "reason": `<@${user.id}> has been seen in ${imports.length} blacklisted Discords.`,
                "proof": 'None provided...',
                "time": 'N/A'
            }
            return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
        } else {
            let json_ = {
                "active": false, // This means that the user is not banned
            }
            return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    });

    await (await client.guilds.fetch(data.MAIN_GUILD)).commands.set(staffcmds).then(() => {
        client.logger.info(
            `Successfully set ${staffcmds.map(c => c.name).join(', ')} to ${data.MAIN_GUILD}`
        );
    });
}
