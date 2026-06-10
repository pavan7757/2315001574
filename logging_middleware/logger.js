const LEVELS = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG',
};

function timestamp() {
  return new Date().toISOString();
}

function format(level, message) {
  return `[${timestamp()}] [${LEVELS[level]}] ${message}`;
}

function logInfo(message) {
  console.log(format('info', message));
}

function logWarn(message) {
  console.warn(format('warn', message));
}

function logError(message) {
  console.error(format('error', message));
}

function logDebug(message) {
  console.debug(format('debug', message));
}

module.exports = {
  logInfo,
  logWarn,
  logError,
  logDebug,
};
