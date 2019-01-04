import { createLogger, transports, format } from 'winston'

const myFormat = format.printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: 'debug',
  format: format.combine(format.colorize(), format.timestamp(), myFormat),
  transports: [
    new transports.Console()
  ],
  exceptionHandlers: [
    new transports.Console()
  ]
})

logger.morganStream = {
  write: (message) => {
    logger.info(message)
  }
}

export default logger
