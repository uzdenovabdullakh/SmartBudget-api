import { createLogger, format, transports } from 'winston';

const customFormat = format.printf(({ timestamp, level, stack, message }) => {
  return `${timestamp} - [${level.toUpperCase().padEnd(7)}] - ${stack || message}`;
});

const options = {
  file: {
    filename: 'error.log',
    level: 'error',
  },
  console: {
    level: 'silly',
  },
};

const logger = {
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    customFormat,
  ),
  transports: [
    new transports.Console(options.console),
    new transports.File(options.file),
    new transports.File({
      filename: 'combine.log',
      level: 'info',
    }),
  ],
};

export const instance = createLogger(logger);
