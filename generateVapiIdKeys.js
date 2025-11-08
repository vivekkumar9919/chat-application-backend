const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('public vapid key - ', vapidKeys.publicKey);
console.log('private vapid key - ', vapidKeys.privateKey);