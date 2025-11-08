const express = require("express");
const router = express.Router();
const PushSubscriptionController = require("../controllers/pushSubscriptionController");


router.post("/subscribe", PushSubscriptionController.saveSubscription);

router.delete("/unsubscribe", PushSubscriptionController.deleteSubscription);

module.exports = router;
