const SessionService = require("../services/sessionService");
const Logger = require("../utils/logger");


/**
 * Middleware to attach session user data from Redis if sessionId cookie exists
 */
async function attachSession(req, res, next) {
  const sessionId = req.cookies?.sessionId;

  if (sessionId) {
    try {
      const sessionData = await SessionService.getSession(sessionId);

      if (sessionData) {
        req.user = sessionData; // ✅ attach user/session payload
      }
    } catch (err) {
      Logger.error("Redis session retrieval error:", err);
    }
  }

  next();
}

/**
 * Middleware to enforce authentication (protect routes)
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

module.exports = {
  attachSession,
  requireAuth,
};
