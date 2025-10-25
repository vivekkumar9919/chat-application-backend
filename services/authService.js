const { databaseLogger } = require("../utils/logger/index");
const { hashPassword, comparePassword } = require("../utils/authHelpers");
const pool = require("../connections/postgres/index"); // ✅ Postgres pool wrapper

class AuthService {
  constructor() {}

  static async registerUser(username, name, email, password, profile_pic) {
    try {
      const hashedPassword = await hashPassword(password);

      // Insert user and return new ID
      const insertQuery = `
        INSERT INTO users (username, name, email, password, profile_pic)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      const insertResult = await pool.query(insertQuery, [username, name, email, hashedPassword, profile_pic]);
      const userId = insertResult.rows[0].id;

      // Fetch the newly created user
      const selectQuery = `
        SELECT id, username, name, email, created_at, updated_at, profile_pic
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

  static async updateUser(userId, fields){
    try{
      const user = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      if(!user.rows.length){
        throw new Error("User not found");
      }
      const existingUser = user.rows[0];
    }
    catch(err){
      databaseLogger.error("Update user failed", { error: err.message, userId });
      throw err;
    }
  }
}


module.exports = AuthService;