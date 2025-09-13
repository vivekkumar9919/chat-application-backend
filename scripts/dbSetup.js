// scripts/dbSetup.js
const { Pool } = require("pg");
require("dotenv").config();
const { databaseLogger } = require('../utils/logger/index');

const pool = new Pool({
  user: process.env.PG_USER || "root",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "chatapplication",
  password: process.env.PG_PASSWORD || "root",
  port: process.env.PG_PORT || 5432,
});

async function createTables() {
  try {
    // Example: users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    databaseLogger.info("Tables created/verified successfully", { database: process.env.PG_DATABASE || "chatapplication" });
  } catch (err) {
    databaseLogger.error("Error creating tables", { error: err.message, stack: err.stack, database: process.env.PG_DATABASE || "chatapplication" });
  } finally {
    await pool.end();
  }
}

createTables();
