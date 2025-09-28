const db = require("../connections/postgres/index");
const { databaseLogger } = require("../utils/logger/index");

class ConversationService {
  static async createConversation(type, userIds = [], name = null) {
  const pool = db.getPool();
  const client = await pool.connect(); // Get a client connection from the pool
  try {
    await client.query("BEGIN");

    // Insert new conversation with optional name
    const queryText = `
      INSERT INTO conversations (type, name, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id
    `;
    const queryValues = [type, name]; // name can be null if not provided
    const result = await client.query(queryText, queryValues);
    const conversationId = result.rows[0].id;

    // Add participants (assuming conversation_participants table exists)
    for (let userId of userIds) {
      await client.query(
        "INSERT INTO conversation_participants (conversation_id, user_id, joined_at) VALUES ($1, $2, NOW())",
        [conversationId, userId]
      );
    }

    await client.query("COMMIT");
    return { conversationId, type, name, participants: userIds };
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
        `SELECT 
  c.id AS conversation_id,
  c.type,
  c.created_at,
  CASE 
    WHEN c.type = 'direct' 
         THEN (
           SELECT u.name
           FROM conversation_participants cp2
           JOIN users u ON u.id = cp2.user_id
           WHERE cp2.conversation_id = c.id AND cp2.user_id != $1
           LIMIT 1
         )
    ELSE c.name
  END AS display_name,
  CASE 
    WHEN c.type = 'direct' 
         THEN (
           SELECT u.id
           FROM conversation_participants cp2
           JOIN users u ON u.id = cp2.user_id
           WHERE cp2.conversation_id = c.id AND cp2.user_id != $1
           LIMIT 1
         )
    ELSE NULL
  END AS other_user_id,
  m.message_text AS last_message,
  m.created_at AS last_message_at,
  COALESCE(unread.count, 0) AS unread_count
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN LATERAL (
    SELECT msg.message_text, msg.created_at
    FROM messages msg
    WHERE msg.conversation_id = c.id
    ORDER BY msg.created_at DESC
    LIMIT 1
) m ON TRUE
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS count
    FROM messages msg2
    WHERE msg2.conversation_id = c.id
      AND msg2.status = 'sent'
      AND msg2.sender_id != $1
) unread ON TRUE
WHERE cp.user_id = $1
ORDER BY m.created_at DESC NULLS LAST;`,
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
