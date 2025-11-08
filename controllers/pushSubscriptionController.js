const PushSubscriptionService = require("../services/pushSubscriptionService");
const { appLogger } = require("../utils/logger");
const ResponseHandler = require("../utils/responseHandler");


class PushSubscriptionController{
    constructor() {}

    static async saveSubscription(req, res) {
        try {
            appLogger.info("Saving subscription inside");
            const body = req.body;
            appLogger.info("Saving subscription controller", {body: req.body});
            const subscription = body?.subscription;
            const userId = body?.userId;

            const saved = await PushSubscriptionService.saveSubscription(userId, subscription);
            ResponseHandler.success(res, 201, "Subscribed successfully");
        } catch (err) {
            appLogger.error("Error saving push subscription:", {error: err.message});
            ResponseHandler.error(res, 500, "Failed to save subscription", err.message);
        }
    }

    static async deleteSubscription(req, res) {
        try {
            const { endpoint } = req.body;
            appLogger.info("Unsubscribing subscription", {body: req.body});
            await PushSubscriptionService.deleteSubscription(endpoint);
            ResponseHandler.success(res, 200, { success: true });
        } catch (err) {
            appLogger.error("Error deleting subscription:", {error: err.message});
            ResponseHandler.error(res, 500, "Failed to unsubscribed")
        }
    }
}

module.exports = PushSubscriptionController;