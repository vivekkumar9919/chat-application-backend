const UserService = require("../services/userService");
const { appLogger, databaseLogger } = require("../utils/logger/index");
const ResponseHandler = require("../utils/responseHandler");

class UserController {
  constructor() {}

  static async fetchUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);

      if (!user) {
        return ResponseHandler.error(res, 404, "User not found");
      }

      return ResponseHandler.success(res, 200, "User fetched successfully", {
        user,
      });
    } catch (err) {
      databaseLogger.error("Fetch user failed", { error: err.message });
      return ResponseHandler.error(res, 400, "Failed to fetch user", err.message);
    }
  }

  static async searchUserByUsername(req, res) {
    try {
      const { query } = req.query;
      appLogger.info("Searching user...");

      if (!query) {
        return ResponseHandler.error(res, 400, "Query parameter is required");
      }

      const users = await UserService.searchUsers(query);

      return ResponseHandler.success(res, 200, "Users fetched successfully", {
        users,
      });
    } catch (err) {
      databaseLogger.error("Search user failed", { error: err.message });
      return ResponseHandler.error(res, 400, "Failed to search users", err.message);
    }
  }

  static async fetchAllUsers(req, res) {
    try {
      appLogger.info("Fetching all users...");
      const users = await UserService.getAllUsers();
      appLogger.info(`Fetched ${users.length} users.`);

      return ResponseHandler.success(res, 200, "All users fetched successfully", {
        users,
      });
    } catch (err) {
      databaseLogger.error("Fetch all users failed", { error: err.message });
      return ResponseHandler.error(res, 500, "Failed to fetch all users", err.message);
    }
  }
}

module.exports = UserController;