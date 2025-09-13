const bcrypt = require("bcrypt");
const pool = require("../connections/postgres/index");
const { databaseLogger } = require("../utils/logger/index");
const { hashPassword, comparePassword } = require("../utils/authHelpers");
class AuthService {
    constructor() {

    }

    static async registerUser(username, email, password) {
        try {
            const hashedPassword = await hashPassword(password);
            const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3) RETURNING id, username, email, created_at, updated_at
        `;
            const values = [username, email, hashedPassword];
            const result = await pool.query(query, values);
            return result.rows[0];
        }
        catch (err) {
            databaseLogger.error("User registration failed", { error: err.message, email });
            throw err;
        }
    }

    static async findUserByEmail(email) {
        try {
            const query = `SELECT * FROM users WHERE email = $1`;
            const result = await pool.query(query, [email]);
            return result.rows[0];
        }
        catch (err) {
            databaseLogger.error("Database query failed", { error: err.message, email });
            throw err;
        }
    }

    static async validatePassword(inputPassword, storedHashedPassword, email) {
        try {
            const isValid = await comparePassword(inputPassword, storedHashedPassword);
            return isValid;
        }
        catch (err) {
            databaseLogger.error("Password validation failed", { error: err.message, email });
            throw err;
        }
    }
}


module.exports = AuthService;