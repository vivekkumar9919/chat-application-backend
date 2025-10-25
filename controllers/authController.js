const AuthService = require("../services/authService");
const { appLogger } = require("../utils/logger/index");
const { generateUniqueSessionId } = require("../utils/common");
const SessionService = require("../services/sessionService");
const ResponseHandler = require("../utils/responseHandler");
const { profile } = require("winston");

class AuthController {
  static async signup(req, res) {
    const { username, email, password, profile_pic = "https://messagewebapp.s3.ap-south-1.amazonaws.com/default-img.png" } = req.body;
    try {
      if (!username || !email || !password) {
        return ResponseHandler.error(res, 400, "All fields are required");
      }

      const existingUser = await AuthService.findUserByEmail(email);
      if (existingUser) {
        appLogger.warn("Signup attempt with existing email", { email });
        return ResponseHandler.error(res, 400, "User already exists");
      }

      const newUser = await AuthService.registerUser(username, username, email, password, profile_pic);
      appLogger.info("User registered successfully", { email, user_id: newUser.id });

      return ResponseHandler.success(res, 201, "User registered successfully", {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          avatar: newUser.profile_pic,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at,
        },
      });
    } catch (err) {
      appLogger.error("Signup failed", { error: err.message, email });
      return ResponseHandler.error(res, 500, "Internal Server Error", err.message);
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return ResponseHandler.error(res, 400, "Email and password are required");
      }

      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        appLogger.warn("Login attempt with non-existing email", { email });
        return ResponseHandler.error(res, 400, "Invalid email or password");
      }

      const isValidPassword = await AuthService.validatePassword(password, user.password, email);
      if (!isValidPassword) {
        appLogger.warn("Login attempt with incorrect password", { email });
        return ResponseHandler.error(res, 400, "Invalid email or password");
      }

      // Generate a unique session ID
      const sessionId = generateUniqueSessionId();
      const sessionData = { id: user.id, email: user.email };

      // Store session in Redis (TTL = 1 day by default)
      await SessionService.createSession(sessionId, sessionData, process.env.REDIS_SESSION_TTL || 86400);

      // Set session ID in cookie
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // secure only in prod
        maxAge: process.env.COOKIE_MAX_AGE || 86400000, // 1 day
        sameSite: 'lax', // Allow cross-site requests
        path: '/', // Make cookie available for all paths
      });
      
      appLogger.info("Session cookie set", { 
        sessionId: sessionId.substring(0, 8) + '...', 
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
      });

      appLogger.info("User logged in successfully", { email, user_id: user.id });

      return ResponseHandler.success(res, 200, "Login successful", {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatar: user.profile_pic,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (err) {
      appLogger.error("Login failed", { error: err.message, email });
      return ResponseHandler.error(res, 500, "Internal Server Error", err.message);
    }
  }

  static async logout(req, res) {
    const sessionId = req.cookies.sessionId;
    try {
      if (sessionId) {
        await SessionService.deleteSession(sessionId);
        res.clearCookie("sessionId");
        appLogger.info("User logged out", { session_id: sessionId });
        return ResponseHandler.success(res, 200, "Logout successful");
      }

      return ResponseHandler.error(res, 400, "No active session");
    } catch (err) {
      appLogger.error("Logout failed", { error: err.message, session_id: sessionId });
      return ResponseHandler.error(res, 500, "Internal Server Error", err.message);
    }
  }

  static async getCurrentUser(req, res) {
    if (req.user) {
      return ResponseHandler.success(res, 200, "Current user fetched successfully", {
        user: req.user,
      });
    }
    return ResponseHandler.error(res, 401, "Not logged in");
  }
}

module.exports = AuthController;