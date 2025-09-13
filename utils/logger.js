const { createLogger, format, transports } = require("winston");

class Logger {
  constructor(moduleName = "App") {
    this.moduleName = moduleName;

    const logFormat = format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${this.moduleName}] [${level.toUpperCase()}] ${message}`;
    });

    this.logger = createLogger({
      level: process.env.LOG_LEVEL || "info",
      transports: [
        new transports.Console({
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            logFormat
          ),
        }),

        // Error log file
        new transports.File({
          filename: "logs/error.log",
          level: "error",
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            logFormat
          ),
        }),

        // Combined log file
        new transports.File({
          filename: "logs/combined.log",
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            logFormat
          ),
        }),
      ],
    });
  }

  log(level = "info", message) {
    this.logger.log(level, message);
  }

  info(message) { this.log("info", message); }
  error(message) { this.log("error", message); }
  warn(message) { this.log("warn", message); }
  debug(message) { this.log("debug", message); }
}

module.exports = Logger;
