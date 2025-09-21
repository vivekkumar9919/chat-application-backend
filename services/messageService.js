const db = require("../connections/postgres/index");
const { databaseLogger } = require("../utils/logger/index");

class MessageService {
  static async sendMessage(conversationId, senderId, messageText) {
    try {
      const result = await db.query(
        `INSERT INTO messages (conversation_id, sender_id, message_text, status, created_at)
         VALUES ($1, $2, $3, 'sent', NOW())
         RETURNING id`,
        [conversationId, senderId, messageText]
      );

      return {
        messageId: result.rows[0].id,
        conversationId,
        senderId,
        messageText,
      };
    } catch (err) {
      databaseLogger.error("Send message failed", { error: err.message });
      throw err;
    }
  }

  static async getMessages(conversationId) {
    try {
      const result = await db.query(
        `SELECT m.id, m.message_text, m.status, m.created_at,
                u.id AS sender_id, u.username
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.conversation_id = $1
         ORDER BY m.created_at ASC`,
        [conversationId]
      );

      return result.rows;
    } catch (err) {
      databaseLogger.error("Get messages failed", { error: err.message, conversationId });
      throw err;
    }
  }
}

module.exports = MessageService;
