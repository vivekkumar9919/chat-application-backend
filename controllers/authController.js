const AuthService = require("../services/authService");
const { appLogger } = require("../utils/logger/index");
const redisClient = require("../connections/redis/index");
const { generateUniqueSessionId } = require("../utils/common");
const SessionService = require("../services/sessionService");
class AuthController {
    static async signup(req, res) {
        const { username, email, password } = req.body;
        try {
            if (!username || !email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }
            
            const existingUser = await AuthService.findUserByEmail(email);
            if (existingUser) {
                appLogger.warn("Signup attempt with existing email", { email });
                return res.status(400).json({ message: "User already exists" });
            }
            
            const newUser = await AuthService.registerUser(username, email, password);
            appLogger.info("User registered successfully", { email, user_id: newUser.id });

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
            appLogger.error("Signup failed", { error: err.message, email });
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;
        try {
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            const user = await AuthService.findUserByEmail(email);
            if (!user) {
                appLogger.warn("Login attempt with non-existing email", { email });
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const isValidPassword = await AuthService.validatePassword(password, user.password, email);
            if (!isValidPassword) {
                appLogger.warn("Login attempt with incorrect password", { email });
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // Generate a unique session ID
            const sessionId = generateUniqueSessionId();
            const sessionData = {
                id: user.id,
                email: user.email,
            };

            // Store session data in Redis with a TTL (1 day = 86400 seconds)
            await SessionService.createSession(sessionId, sessionData, process.env.REDIS_SESSION_TTL || 86400);
            // Set session ID in a cookie
            res.cookie("sessionId", sessionId, {
                httpOnly: true,
                secure: false, // Set to true in production with HTTPS
                maxAge: process.env.COOKIE_MAX_AGE || 86400000, // 1 day
            });

            appLogger.info("User logged in successfully", { email, user_id: user.id });
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
            appLogger.error("Login failed", { error: err.message, email });
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async logout(req, res) {
        const sessionId = req.cookies.sessionId;
        try {
            if (sessionId) {
                await SessionService.deleteSession(sessionId); // Delete session from Redis
                res.clearCookie("sessionId"); // Clear the cookie
                appLogger.info("User logged out", { session_id: sessionId });
                return res.status(200).json({ message: "Logout successful" });
            }
            return res.status(400).json({ message: "No active session" });
        } catch (err) {
            appLogger.error("Logout failed", { error: err.message, session_id: sessionId });
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    static async getCurrentUser(req, res) {
        if (req.user) {
            res.json({ user: req.user });
        } else {
            res.status(401).json({ message: "Not logged in" });
        }
    }
}

module.exports = AuthController;