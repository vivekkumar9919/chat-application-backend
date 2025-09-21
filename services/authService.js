const { databaseLogger } = require("../utils/logger/index");
const { hashPassword, comparePassword } = require("../utils/authHelpers");
const pool = require("../connections/postgres/index"); // ✅ Postgres pool wrapper

class AuthService {
  constructor() {}

  static async registerUser(username, email, password) {
    try {
      const hashedPassword = await hashPassword(password);

      // Insert user and return new ID
      const insertQuery = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const insertResult = await pool.query(insertQuery, [username, email, hashedPassword]);
      const userId = insertResult.rows[0].id;

      // Fetch the newly created user
      const selectQuery = `
        SELECT id, username, email, created_at, updated_at
        FROM users WHERE id = $1
      `;
      const selectResult = await pool.query(selectQuery, [userId]);

      return selectResult.rows[0];
    } catch (err) {
      databaseLogger.error("User registration failed", { error: err.message, email });
      throw err;
    }
  }

  static async findUserByEmail(email) {
    try {
      const query = `SELECT * FROM users WHERE email = $1`;
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (err) {
      databaseLogger.error("Database query failed", { error: err.message, email });
      throw err;
    }
  }

  static async validatePassword(inputPassword, storedHashedPassword, email) {
    try {
      return await comparePassword(inputPassword, storedHashedPassword);
    } catch (err) {
      databaseLogger.error("Password validation failed", { error: err.message, email });
      throw err;
    }
  }
}


module.exports = AuthService;