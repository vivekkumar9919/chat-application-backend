const { databaseLogger } = require("../utils/logger/index");
const db = require("../connections/postgres/index");

class UserService {
  constructor() {}

  static async getUserById(id) {
    try {
      const result = await db.query(
        "SELECT id, username, email, profile_pic, created_at, updated_at FROM users WHERE id = $1",
        [id]
      );
      return result.rows[0];
    } catch (err) {
      databaseLogger.error("Get user by ID failed", { error: err.message, id });
      throw err;
    }
  }

  static async searchUsers(query) {
    try {
      const like = `%${query}%`;
      const result = await db.query(
        "SELECT id, username, email FROM users WHERE username ILIKE $1 OR email ILIKE $2",
        [like, like]
      );
      return result.rows;
    } catch (err) {
      databaseLogger.error("User search failed", { error: err.message, query });
      throw err;
    }
  }

  static async getAllUsers(){
    try{
      databaseLogger.info("Fetching all users from database...");
      const result = await db.query("SELECT id, username, email, created_at FROM users");
      databaseLogger.info(`Fetched ${result.rows.length} users from database.`);
      return result.rows;
    }
    catch(err){
      databaseLogger.error("Get all users failed", { error: err.message });
      throw err;
    }

  }

  static async updateProfilePic(userId, profilePicUrl) {
    try {
      databaseLogger.info("Updating profile picture", { userId, profilePicUrl });
      const updateQuery = `
      UPDATE users
      SET profile_pic = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, username, name, email, profile_pic, updated_at
    `;

      const result = await db.query(updateQuery, [profilePicUrl, userId]);
      databaseLogger.info("Profile pic update query executed", { userId });
      if (result.rowCount === 0) {
        databaseLogger.warn("User not found for profile pic update", { userId });
        throw new Error("User not found");
      }

      databaseLogger.info("User profile picture updated successfully", {
        userId,
        profilePicUrl,
      });

      return result.rows[0];
    }
    catch (err) {
      databaseLogger.error("Profile pic update failed", { error: err.message, userId });
      throw err;
    }
  }

}

module.exports = UserService;
