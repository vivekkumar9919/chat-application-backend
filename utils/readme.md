# Logger Utility for Node.js

A simple **class-based logger** using [Winston](https://github.com/winstonjs/winston) that supports:

- Module-based logging (`[App]`, `[Socket]`, `[Database]`, etc.)
- Log levels: `info`, `error`, `warn`, `debug`
- Logs written to console and files (`error.log` and `combined.log`)
- Clean console output for terminals and IDEs
- Configurable log level via environment variable (`LOG_LEVEL`)

---

## Installation

Make sure you have Winston installed:

```
npm install winston
```

Then include the `logger.js` file in your project.

---

## Usage

### Import the Logger

```
const Logger = require('./utils/logger');
```

### Create a logger instance


You can specify a module name. If not provided, it defaults to `"App"`.

``` 
const appLogger = new Logger("App");
const socketLogger = new Logger("Socket");
```

### Logging Messages
```
You can use the following methods:

- `info(message)`
- `error(message)`
- `warn(message)`
- `debug(message)`
- `log(level, message)` - custom log level
```

#### Examples:

``` 
appLogger.info("🚀 Server running on port 5000");
appLogger.error("Database connection failed");
appLogger.warn("Redis cache is not responding");
appLogger.debug("User object details: {...}");
socketLogger.info(`User connected: ${socket.id}`);
```

### Output

#### Console

```text
2025-09-13 13:40:48 [App] [INFO] 🚀 Server running on port 5000
2025-09-13 13:40:49 [Socket] [INFO] User connected: nbDUlC78hwGAH42WAAAB
```
