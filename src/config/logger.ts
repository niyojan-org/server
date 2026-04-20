import winston from 'winston';
import LokiTransport from 'winston-loki';
import { env } from '@config/env';

const transports: winston.transport[] = [];

transports.push(
  new winston.transports.Console({
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp }) => {
        const msg = `${timestamp} [${level}]: ${message}`;
        return msg;
      }),
    ),
  }),
);

if (env.NODE_ENV === 'production') {
  transports.push(
    new LokiTransport({
      level: 'debug',
      host: env.LOKI_HOST,
      basicAuth: `${env.LOKI_USER}:${env.LOKI_API_KEY}`,
      labels: {
        app: env.APP_NAME,
        env: env.NODE_ENV,
      },
      json: true,
      replaceTimestamp: true,
    }),
  );
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: {
    service: env.APP_NAME,
  },
  transports,
});

export default logger;
