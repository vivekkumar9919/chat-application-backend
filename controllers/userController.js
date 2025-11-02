const UserService = require("../services/userService");
const { uploadToS3, deleteFromS3, validateImageFile } = require("../utils/common");
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
      appLogger.error("Fetch user failed", { error: err.message });
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
      appLogger.error("Search user failed", { error: err.message });
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
      appLogger.error("Fetch all users failed", { error: err.message });
      return ResponseHandler.error(res, 500, "Failed to fetch all users", err.message);
    }
  }

  static async updateProfilePicture(req, res){
    try{
      const file = req.file;
      const userId = req.user?.id;
      if(!userId){
        appLogger.warn("User ID missing in request for profile picture update");
        return ResponseHandler.error(res, 400, "Unauthorized request");
      }
      appLogger.info("Updating profile picture...", { userId });
      if(!file){
        appLogger.warn("No file uploaded for profile picture update", { userId });
        return ResponseHandler.error(res, 400, "No file uploaded");
      }

      const validation = validateImageFile(file);
      if (!validation.valid) {
        appLogger.warn("File validation failed", { userId, reason: validation.message });
        return ResponseHandler.error(res, 400, validation.message);
      }

      //fetch current user 
      const existingUser = await UserService.getUserById(userId);
      if(existingUser.profile_pic !== null){
        appLogger.info("User already has a profile picture, it will be replaced", { userId });
        // Optionally, you could delete the old profile picture from S3 here
        await deleteFromS3(existingUser.profile_pic, userId);
        appLogger.info("Old profile picture deleted from S3", { userId });

      }

      const profilePicUrl = await uploadToS3(file, userId);
      if(!profilePicUrl){
        appLogger.error("Failed to upload profile picture to S3", { userId });
        return ResponseHandler.error(res, 500, "Failed to upload profile picture");
      }
      appLogger.info("Profile picture uploaded to S3", { userId, profilePicUrl });
      const updatedUser =  await UserService.updateProfilePic(userId, profilePicUrl);
      appLogger.info("Profile picture updated successfully", { userId });
      return ResponseHandler.success(res, 200, "Profile picture updated successfully", { user: updatedUser });

    }
    catch(err){
      appLogger.error("Update profile picture failed", { error: err.message });
      return ResponseHandler.error(res, 500, "Failed to update profile picture", err.message);
    }
  }
}

module.exports = UserController;