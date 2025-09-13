const redisClient = require("../connections/redis");

class SessionService {

    constructor() { }
    /**
    * Creates a new session
    * @param {string} sessionId
    * @param {object} data - session data to store
    * @param {number} ttl - time to live in seconds (optional)
    * @returns {Promise<void>}
    */
    static async createSession(sessionId, sessionData, ttl = 86400) {
        if (!sessionId) return;
        const value = JSON.stringify(sessionData);
        if (ttl > 0) {
            await redisClient.setex(`sess:${sessionId}`, ttl, value);
        } else {
            await redisClient.set(`sess:${sessionId}`, value);
        }
    }

    /**
    * Get a session by ID
    * @param {string} sessionId
    * @returns {Promise<object|null>}
    */
    static async getSession(sessionId) {
        if (!sessionId) return null;
        const data = await redisClient.get(`sess:${sessionId}`);
        return data ? JSON.parse(data) : null;
    }

    /**
    * Delete a session by ID
    * @param {string} sessionId
    * @returns {Promise<void>}
    */
    static async deleteSession(sessionId) {
        if (!sessionId) return;
        await redisClient.del(`sess:${sessionId}`);
    }
}

module.exports = SessionService;