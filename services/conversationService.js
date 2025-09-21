const db = require("../connections/postgres/index");
const { databaseLogger } = require("../utils/logger/index");

class ConversationService {
  static async createConversation(type, userIds = []) {
    const pool = db.getPool();
    const client = await pool.connect(); // Get a client connection from the pool
    try {
      await client.query("BEGIN");

      // Insert new conversation
      const result = await client.query(
        "INSERT INTO conversations (type, created_at) VALUES ($1, NOW()) RETURNING id",
        [type]
      );
      const conversationId = result.rows[0].id;

      // Add participants
      for (let userId of userIds) {
        await client.query(
          "INSERT INTO conversation_participants (conversation_id, user_id, joined_at) VALUES ($1, $2, NOW())",
          [conversationId, userId]
        );
      }

      await client.query("COMMIT");
      return { conversationId, type, participants: userIds };
    } catch (err) {
      await client.query("ROLLBACK");
      databaseLogger.error("Create conversation failed", { error: err.message });
      throw err;
    } finally {
      client.release(); // Always release the client back to the pool
    }
  }

  static async getConversationsByUser(userId) {
    try {
      const result = await db.query(
        `SELECT c.id, c.type, c.created_at
         FROM conversations c
         JOIN conversation_participants cp ON c.id = cp.conversation_id
         WHERE cp.user_id = $1`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      databaseLogger.error("Get conversations by user failed", { error: err.message, userId });
      throw err;
    }
  }
}

module.exports = ConversationService;
