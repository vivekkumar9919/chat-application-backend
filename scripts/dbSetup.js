// scripts/dbSetup.js
const { Client } = require("pg");
require("dotenv").config();
const { databaseLogger } = require("../utils/logger/index");

async function createDatabaseAndTables() {
  const dbName = "chatapplication"; // ✅ force DB name

  let adminConn;
  try {
    // Connect to default "postgres" database (to manage db creation)
    adminConn = new Client({
      host: process.env.PG_HOST || "localhost",
      user: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD || "root",
      port: process.env.PG_PORT || 5432,
      database: "postgres", // default postgres DB
    });
    await adminConn.connect();

    // Terminate connections to drop database cleanly
    await adminConn.query(
      `SELECT pg_terminate_backend(pg_stat_activity.pid)
       FROM pg_stat_activity
       WHERE pg_stat_activity.datname = $1
       AND pid <> pg_backend_pid();`,
      [dbName]
    );

    // Drop and recreate DB
    await adminConn.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await adminConn.query(`CREATE DATABASE ${dbName}`);
    databaseLogger.info(`Database "${dbName}" created successfully`);

    await adminConn.end();

    // Connect to the new DB
    const conn = new Client({
      host: process.env.PG_HOST || "localhost",
      user: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD || "postgres",
      port: process.env.PG_PORT || 5432,
      database: dbName,
    });
    await conn.connect();

    // Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(250),
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Conversations Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(150),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ConversationParticipants Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id SERIAL PRIMARY KEY,
        conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (conversation_id, user_id)
      )
    `);

    // Messages Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INT REFERENCES users(id) ON DELETE SET NULL,
        message_text TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    databaseLogger.info("Tables created successfully in new DB", { database: dbName });

    await conn.end();
  } catch (err) {
    databaseLogger.error("Error creating database/tables", {
      error: err.message,
      stack: err.stack,
    });
  }
}

createDatabaseAndTables();
