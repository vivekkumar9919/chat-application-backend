const AuthService = require("../services/authService");
const Logger = require("../utils/logger");
const redisClient = require("../connections/redis/index");
class AuthController {
    static async signup(req, res) {
        try {
            const { username, email, password } = req.body;
            Logger.info(`Signup attempt for email: ${email}`);

            if (!username || !email || !password) {
                Logger.info("Signup attempt with missing fields");
                return res.status(400).json({ message: "All fields are required" });
            }
            Logger.info("Checking if user already exists...");
            const existingUser = await AuthService.findUserByEmail(email);
            if (existingUser) {
                Logger.info(`Signup attempt with existing email: ${email}`);
                return res.status(400).json({ message: "User already exists" });
            }
            Logger.info("Registering new user...");
            const newUser = await AuthService.registerUser(username, email, password);
            Logger.info(`User registered successfully: ${email}`);

            const sessionId = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;
            const sessionData = {
                id: newUser.id,
                email: newUser.email,
            };

            await redisClient.set(`sess:${sessionId}`, JSON.stringify(sessionData), "EX", 86400);

            res.cookie("sessionId", sessionId, {
                httpOnly: true,
                secure: false, // Set to true in production with HTTPS
                maxAge: 1000 * 60 * 60 * 24, // 1 day
            });

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    created_at: newUser.created_at,
                    updated_at: newUser.updated_at,
                },
            });

        }
        catch (err) {
            console.log(err);
            Logger.error("Signup Error: ", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            Logger.info(`Login attempt for email: ${email}`);

            if (!email || !password) {
                Logger.info("Login attempt with missing fields");
                return res.status(400).json({ message: "Email and password are required" });
            }

            const user = await AuthService.findUserByEmail(email);
            if (!user) {
                Logger.info(`Login attempt with non-existing email: ${email}`);
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const isValidPassword = await AuthService.validatePassword(password, user.password);
            if (!isValidPassword) {
                Logger.info(`Login attempt with incorrect password for email: ${email}`);
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // Generate a unique session ID
            const sessionId = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;
            const sessionData = {
                id: user.id,
                email: user.email,
            };

            // Store session data in Redis with a TTL (1 day = 86400 seconds)
            await redisClient.set(`sess:${sessionId}`, JSON.stringify(sessionData), "EX", 86400);

            // Set session ID in a cookie
            res.cookie("sessionId", sessionId, {
                httpOnly: true,
                secure: false, // Set to true in production with HTTPS
                maxAge: 1000 * 60 * 60 * 24, // 1 day
            });

            Logger.info(`User logged in successfully: ${email}`);
            res.status(200).json({
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                },
            });
        } catch (err) {
            console.error(err);
            Logger.error("Login Error: ", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async logout(req, res) {
        try {
            const sessionId = req.cookies.sessionId;
            if (sessionId) {
                await redisClient.del(`sess:${sessionId}`); // Delete session from Redis
                res.clearCookie("sessionId"); // Clear the cookie
                Logger.info("User logged out successfully");
                return res.status(200).json({ message: "Logout successful" });
            }
            return res.status(400).json({ message: "No active session" });
        } catch (err) {
            console.error(err);
            Logger.error("Logout Error: ", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async getCurrentUser(req, res) {
        Logger.info("Fetching current user...");
        if (req.user) {
            Logger.info(`Current user found: ${req.user.email}`);
            res.json({ user: req.user });
        } else {
            Logger.info("No user is currently logged in");
            res.status(401).json({ message: "Not logged in" });
        }
    }
}

module.exports = AuthController;