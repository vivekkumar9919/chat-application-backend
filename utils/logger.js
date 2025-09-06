class Logger {
    static info(message) {
      console.log(`[INFO] ${message}`);
    }
  
    static error(message) {
      console.error(`[ERROR] ${message}`);
    }
  }
  
module.exports = Logger;