import { ShardingManager } from 'discord.js';
import dotenv from 'dotenv';
import { Logger } from './classes';
dotenv.config();

/**
 * Sharding Manager
 */
export class Sharding {
    static start(): void {
        // Must be the compiled file
        const manager = new ShardingManager('./build/entry.bot.js', {
            token: process.env.TOKEN,
            totalShards: 'auto',
            respawn: true,
        });

        const logger = new Logger();

        manager.on('shardCreate', shard => {
            logger.debug(
                `Successfully launched shard ${shard.id} of ${(manager.totalShards as number) - 1}`
            );
            shard.on('death', process => {
                logger.error(
                    'Shard ' +
                        shard.id +
                        ' closed unexpectedly! PID: ' +
                        process.pid +
                        '; Exit code: ' +
                        process.exitCode +
                        '.'
                );

                if (process.exitCode === null) {
                    logger.info(
                        'WARNING: Shard ' +
                            shard.id +
                            ' exited with NULL error code. This may be a result of a lack of available system memory. Ensure that there is enough memory allocated to continue.'
                    );
                }
            });

            shard.on('reconnection', () => {
                logger.info('Shard ' + shard.id + ' is reconnecting...');
            });
        });

        manager.spawn();
    }
}
Sharding.start();
