const bcrypt = require("bcrypt");
const pool = require("../connections/postgres/index");
const { databaseLogger } = require("../utils/logger/index");
const { hashPassword, comparePassword } = require("../utils/authHelpers");
class AuthService {
    constructor() {

    }

    static async registerUser(username, email, password) {
        try {
            databaseLogger.info("Registering user in AuthService", { email, username });
            //encrypt password
            const hashedPassword = await hashPassword(password);

            //creation of query
            const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3) RETURNING id, username, email, created_at, updated_at
        `;

            const values = [username, email, hashedPassword];
            databaseLogger.info("Executing query to register user", { email });
            //execute query
            const result = await pool.query(query, values);
            databaseLogger.info("User registered successfully in database", { user_id: result.rows[0].id, email });
            return result.rows[0];
        }
        catch (err) {
            databaseLogger.error("Error in registerUser", { error: err.message, stack: err.stack, email });
            throw err;
        }
    }

    static async findUserByEmail(email) {
        try {
            databaseLogger.info("Finding user by email in AuthService", { email });
            const query = `SELECT * FROM users WHERE email = $1`;
            const result = await pool.query(query, [email]);
            databaseLogger.info("User found by email in AuthService", { email, user_found: !!result.rows[0] });
            return result.rows[0];
        }
        catch (err) {
            databaseLogger.error("Error in findUserByEmail", { error: err.message, stack: err.stack, email });
            throw err;
        }
    }

    static async validatePassword(inputPassword, storedHashedPassword, email) {
        try {
            databaseLogger.info("Validating password in AuthService", { email });
            const isValid = await comparePassword(inputPassword, storedHashedPassword);
            databaseLogger.info("Password validation result", { email, is_valid: isValid });
            return isValid;
        }
        catch (err) {
            databaseLogger.error("Error in validatePassword", { error: err.message, stack: err.stack, email });
            throw err;
        }
    }
}


module.exports = AuthService;