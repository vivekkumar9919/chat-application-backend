
function generateUniqueSessionId(){
    // Generate a more secure session ID using crypto
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

module.exports = { generateUniqueSessionId };