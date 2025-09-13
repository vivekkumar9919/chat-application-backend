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
        // Console transport
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

  log(level = "info", ...args) {
    const message = args
      .map(arg => {
        if (typeof arg === "object") {
          try { return JSON.stringify(arg); }
          catch { return String(arg); }
        }
        return String(arg);
      })
      .join(" ");
    
    this.logger.log(level, message);
  }

  info(...args) { this.log("info", ...args); }
  error(...args) { this.log("error", ...args); }
  warn(...args) { this.log("warn", ...args); }
  debug(...args) { this.log("debug", ...args); }
}

module.exports = Logger;
