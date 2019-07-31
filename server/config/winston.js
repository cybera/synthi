import { createLogger, transports, format } from 'winston'

const myFormat = format.printf((info) => {
  if (info instanceof Error) {
    return `${info.timestamp} ${info.level}: ${info.message}\n${info.stack}`;
  }

  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.splat(),
    myFormat
  ),
  transports: [
    new transports.Console()
  ],
  exceptionHandlers: [
    new transports.Console()
  ]
})

logger.morganStream = {
  write: (message) => {
    logger.info(message.trim())
  }
}

export default logger
