import { createLogger, transports, format } from 'winston'

const myFormat = format.printf((info) => {
  if (info instanceof Error) {
    let message = `${info.timestamp} ${info.level}: ${info.message}\n`
    if (info.constructor.name === 'GraphQLError') {
      message += `${info.extensions.exception.stacktrace.join('\n')}`
    } else {
      message += `${info.stack}`
    }
    return message
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
