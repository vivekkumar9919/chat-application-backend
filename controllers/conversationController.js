const ConversationService = require("../services/conversationService");
const { databaseLogger } = require("../utils/logger/index");

class ConversationController {
  static async createConversation(req, res) {
    try {
      const { type, userIds } = req.body;
      const conversation = await ConversationService.createConversation(type, userIds);
      res.status(201).json(conversation);
    } catch (err) {
      databaseLogger.error("Create conversation failed", { error: err.message });
      res.status(400).json({ error: err.message });
    }
  }

  static async getUserConversations(req, res) {
    try {
      const { id } = req.params;
      const conversations = await ConversationService.getConversationsByUser(id);
      res.json(conversations);
    } catch (err) {
      databaseLogger.error("Get conversations failed", { error: err.message });
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = ConversationController;
