const config = {
    jwtSecret: process.env.JWT_SECRET,
    TTL: '1h', // Token Time to Live
}

module.exports = config;
