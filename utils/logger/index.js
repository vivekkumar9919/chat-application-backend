const Logger = require('./logger'); // your Logger class

const appLogger = new Logger("App");
const databaseLogger = new Logger("Database");
const redisLogger = new Logger("Redis");
const socketLogger = new Logger('Socket');

module.exports = {
  appLogger,
  databaseLogger,
  redisLogger,
  socketLogger
};
