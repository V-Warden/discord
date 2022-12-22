// eslint-disable-next-line node/no-unpublished-require
require('dotenv').config();
import { ShardingManager } from 'discord.js';

const manager = new ShardingManager(__dirname + '/bot.js', {
    token: process.env.token,
});

manager.on('shardCreate', shard => {
    console.log(`Launched shard ${shard.id}`);
});

manager.spawn({ timeout: -1 });
