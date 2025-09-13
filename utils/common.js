
function generateUniqueSessionId(){
    return Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;
}

module.exports = { generateUniqueSessionId };