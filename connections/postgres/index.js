const { Pool } = require("pg");
const { databaseLogger } = require("../../utils/logger/index");

// Create a new pool instance
const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "root",
  database: process.env.PG_DATABASE || "chatapplication",
  max: 10, // max connections in pool
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 5000, // return error if connection takes > 5s
});

// Log connection errors
pool.on("error", (err) => {
  databaseLogger.error("Unexpected Postgres client error", { error: err.message });
  process.exit(-1);
});

// Export query + pool
module.exports = {
  query: (text, params) => {
    databaseLogger.debug("Executing query", { text, params });
    return pool.query(text, params);
  },
  getPool: () => pool,
};
