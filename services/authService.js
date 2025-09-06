const bcrypt = require("bcrypt");
const pool = require("../connections/postgres/index");
const Logger = require("../utils/logger");
class AuthService {
    constructor(){

    }

    static async registerUser(username, email, password){
        Logger.info("Registering user in AuthService...");
        //encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

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

    static async findUserByEmail(email){
        Logger.info("Finding user by email in AuthService...");
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(query, [email]);
        Logger.info("User found by email in AuthService.");
        return result.rows[0];
    }

    static async validatePassword(inputPassword, storedHashedPassword){
        Logger.info("Validating password in AuthService...");
        const isValid = await bcrypt.compare(inputPassword, storedHashedPassword);
        Logger.info(`Password validation result: ${isValid}`);
        return isValid;
    }
}


module.exports = AuthService;