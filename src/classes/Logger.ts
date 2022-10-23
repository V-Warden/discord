import * as winston from 'winston';
import { LeveledLogMethod } from 'winston';
// eslint-disable-next-line node/no-extraneous-import
import { grey, gray, white } from 'chalk';
import LokiTransport from 'winston-loki';
import dotenv from 'dotenv';
import DailyRotateFile from 'winston-daily-rotate-file';
dotenv.config();

const customLevels = {
  levels: {
    info: 0,
    warn: 1,
    error: 2,
    debug: 3,
    prisma: 4,
  },
  colors: {
    prisma: 'blue',
  },
};

export class Logger {
  logger: winston.Logger;

  info: LeveledLogMethod;
  debug: LeveledLogMethod;
  error: LeveledLogMethod;
  warn: LeveledLogMethod;

  constructor() {
    winston.addColors(customLevels.colors);
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      levels: customLevels.levels,
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.colorize(),
            winston.format.splat(),
            this.consoleFormat
          ),
        }),
        new LokiTransport({
          host: process.env.LOKI_URL,
          basicAuth: process.env.LOKI_AUTH,
          labels: { app: 'warden' },
          batching: false,
          json: true,
          format: winston.format.json(),
          onConnectionError: (err) => console.error(err),
        }),
        new DailyRotateFile({
          filename: 'logs/%DATE%.log',
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.splat(),
            this.fileFormat
          ),
        }),
      ],
      exceptionHandlers: [new winston.transports.File({ filename: 'logs/exceptions.log' })],
      rejectionHandlers: [new winston.transports.File({ filename: 'logs/rejections.log' })],
    });

    this.debug = this.logger.debug.bind(this.logger);
    this.info = this.logger.info.bind(this.logger);
    this.error = this.logger.error.bind(this.logger);
    this.warn = this.logger.warn.bind(this.logger);
  }

  prisma(message: string) {
    this.logger.log('prisma', message);
  }

  consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
    const opening = gray('[');
    const closing = gray(']');
    const seperator = grey('-');

    return `${opening}${grey(timestamp)}${closing} ${opening}${level}${closing} ${seperator} ${white(`${message}`)}`;
  });

  fileFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}] - ${message}`;
  });
}
