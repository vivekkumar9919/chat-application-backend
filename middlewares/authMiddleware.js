const Logger = require("../utils/logger");

function authMiddleware(req, res, next){
    if(req.session && req.session.user){
        Logger.info(`Authenticated request by user ID: ${req.session.user.id}`);
        next();
    }
    else{
        Logger.info("Unauthorized access attempt");
        return res.status(401).json({ message: "Not authorized" });
    }
}

module.exports = authMiddleware;