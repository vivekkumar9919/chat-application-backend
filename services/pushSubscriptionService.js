const { databaseLogger } = require("../utils/logger/index");
const db = require("../connections/postgres/index");

class PushSubscriptionService {
    /**
     * Save or update user's subscription
     */
    static async saveSubscription(userId, subscription) {
        try {
            databaseLogger.info("saving subscription...", { userId, subscription });
            const { endpoint, keys } = subscription;
            const { p256dh, auth } = keys;

            const query = `
            INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (endpoint)
            DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth
            RETURNING *;
            `;

            const result = await db.query(query, [userId, endpoint, p256dh, auth]);
            return result.rows[0];
        }
        catch (err) {
            databaseLogger.error("Saving subscription failed", { error: err.message, userId, subscription });
            throw err;
        }
    }

    /**
     * Get all subscriptions for a user
     */
    static async getUserSubscriptions(userId) {
        try {
            databaseLogger.info("Fetching subscription", {userId: userId});
            const query = `SELECT * FROM push_subscriptions WHERE user_id = $1`;
            const result = await db.query(query, [userId]);
            return result.rows;
        }
        catch (err) {
            databaseLogger.error("Fetching subscription failed", { error: err.message, userId });
            throw err;
        }
    }

    /**
     * Delete subscription (e.g., user unsubscribed or invalid endpoint)
     */
    static async deleteSubscription(endpoint) {
        try {
            databaseLogger.info("Deleting subscription", endpoint);
            const query = `DELETE FROM push_subscriptions WHERE endpoint = $1`;
            await db.query(query, [endpoint]);
        }
        catch (err) {
            databaseLogger.error("Failed to delete subscription", endpoint);
            throw err;
        }
    }

    /**
     * Get all subscriptions (for sending broadcast notifications)
     */
    static async getAllSubscriptions() {
        try {
            databaseLogger.info("Fetching all subscriptions");
            const query = `SELECT * FROM push_subscriptions`;
            const result = await db.query(query);
            return result.rows;
        }
        catch (err) {
            databaseLogger.error("Failed to fetch all subscriptions", { error: err.message });
            throw err;
        }
    }
}

module.exports = PushSubscriptionService;