const webpush = require("web-push");
const PushSubscriptionService = require("../services/pushSubscriptionService");
const { appLogger } = require("./logger");

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  "mailto:sk9415687057@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

async function sendPushToUser(userId, payload) {
  const subscriptions = await PushSubscriptionService.getUserSubscriptions(userId);
  appLogger.info("subscription push notification ", { subscriptions });

  for (const sub of subscriptions) {
    try {
      const formattedSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      await webpush.sendNotification(formattedSub, JSON.stringify(payload));
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await PushSubscriptionService.deleteSubscription(sub.endpoint);
      } else {
        console.error("Push error:", err);
        appLogger.error("Push error occured", { err });
      }
    }
  }
}

module.exports = { sendPushToUser };