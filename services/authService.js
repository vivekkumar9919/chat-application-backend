const bcrypt = require("bcrypt");
const pool = require("../connections/postgres/index");
const Logger = require("../utils/logger");
const { hashPassword, comparePassword } = require("../utils/authHelpers");
class AuthService {
    constructor() {

    }

    static async registerUser(username, email, password) {
        try {
            Logger.info("Registering user in AuthService...");
            //encrypt password
            const hashedPassword = await hashPassword(password);

            //creation of query
            const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3) RETURNING id, username, email, created_at, updated_at
        `;

            const values = [username, email, hashedPassword];
            Logger.info("Executing query to register user...");
            //execute query
            const result = await pool.query(query, values);
            Logger.info("User registered successfully in database.");
            return result.rows[0];
        }
        catch (err) {
            Logger.error("Error in registerUser: ", err);
            throw err;
        }
    }

    static async findUserByEmail(email) {
        try {
            Logger.info("Finding user by email in AuthService...");
            const query = `SELECT * FROM users WHERE email = $1`;
            const result = await pool.query(query, [email]);
            Logger.info("User found by email in AuthService.");
            return result.rows[0];
        }
        catch (err) {
            Logger.error("Error in findUserByEmail: ", err);
            throw err;
        }
    }

    static async validatePassword(inputPassword, storedHashedPassword) {
        try {
            Logger.info("Validating password in AuthService...");
            const isValid = await comparePassword(inputPassword, storedHashedPassword);
            Logger.info(`Password validation result: ${isValid}`);
            return isValid;
        }
        catch (err) {
            Logger.error("Error in validatePassword: ", err);
            throw err;
        }
    }
}


module.exports = AuthService;