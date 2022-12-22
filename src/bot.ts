import { ExtendedClient } from './structures/Client';
import actionAppeal from './utils/actioning/actionAppeal';
import actionGlobal from './utils/actioning/actionGlobal';
import actionUserGlobal from './utils/actioning/actionUserGlobal';

export const client = new ExtendedClient();

client.start();

client.on('warn', e => console.warn(e));
client.on('debug', e => console.debug(e));
client.on('error', e => console.error(e));

process.on('unhandledRejection', e => console.error(e));
process.on('uncaughtException', e => console.error(e));

// process.on('message', async (m: any) => {
//     try {
//         console.log(m)
//         if (typeof m === 'object') {
//             console.log(`Received ${m?.action}`)
//             if (m?.action === 'actionGlobal') {
//                 await actionGlobal(client);
//             } else if (m?.action === 'forcecheck') {
//                 if (!m.userid) return;
//                 await actionUserGlobal(client, m.userid);
//             } else if (m?.action === 'appeal') {
//                 if (!m.userid) return console.log('No user id found in appealing action');
//                 await actionAppeal(client, m.userid);
//             }
//         } else {
//             console.log('not an object');
//         }
//     } catch (e) {
//         console.log(e);
//     }
//     //Manager.broadcast(m);
// });
