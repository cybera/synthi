import { createLogger, transports, format } from 'winston'
import { GraphQLError } from 'graphql'
import { omit, compact } from 'lodash'

function extraErrorInfoString(error) {
  let cleanedError = omit(error, ['timestamp', 'level', 'message'])
  let { stack } = error
  if (error instanceof GraphQLError) {
    if (error.originalError) {
      ({ stack } = error.originalError)
    }

    // We're already getting the stack from originalError, and the other info
    // in it is redundant. We also don't need extensions.exception.stacktrace
    // because we're already getting the stack from the originalError. Why from
    // originalError? It's coming from the 'graphql' package itself, which is
    // supposed to be a reference implementation to the spec (although the spec
    // itself does not mention originalError). While extensions are also there,
    // there's nothing saying that they'll be populated with an exception or a
    // stacktrace within that. There are some extra parameters apollo lets you
    // add that get put in the exception, though, so we'll leave that to be
    // printed out with any of the rest of the full error information. We're
    // basically just pulling out and highlighting the standard parts and not
    // trying to guess absolutely everything that might be in there.
    cleanedError = omit(cleanedError, ['originalError', 'extensions.exception.stacktrace'])
  }
  const extra = `Extra info: ${JSON.stringify(cleanedError, undefined, 2)}`
  return compact([stack, extra]).join('\n')
}

const myFormat = format.printf((info) => {
  let message = `${info.timestamp} ${info.level}: ${info.message}`

  if (info instanceof Error) {
    message += `\n${extraErrorInfoString(info)}`
  }

  return message
});

const logger = createLogger({
  level: 'info',
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
