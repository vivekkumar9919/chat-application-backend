const UserService = require("../services/userService");
const { appLogger, databaseLogger } = require("../utils/logger/index");


class UserController {
    constructor(){}

    static async fetchUserById(req, res){
        try{
            const user = await UserService.getUserById(req.params.id);
                if (!user) {
                return res.status(404).json({ error: "User not found" });
                }
                res.json(user);
        }
        catch(err){
            databaseLogger.error("Fetch user failed", { error: err.message });
            res.status(400).json({ error: err.message });
        }
    }

    static async searchUserByUsername(req, res){
        try{
            const { query } = req.query;
            console.log("query -  ", query)
            appLogger.info("Searching user...")
            if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
            }
            const users = await UserService.searchUsers(query);
            res.json(users);
        }
        catch(err){
            databaseLogger.error("Search user failed", { error: err.message });
            res.status(400).json({ error: err.message });
        }
    }

    static async fetchAllUsers(req, res){
        try{
            appLogger.info("Fetching all users...");
            const users = await UserService.getAllUsers();
            appLogger.info(`Fetched ${users.length} users.`);
            res.status(200).json(users);
        }
        catch(err){
            databaseLogger.error("Fetch all users failed", { error: err.message });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = UserController;