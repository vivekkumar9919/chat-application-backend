const ConversationService = require("../services/conversationService");
const { databaseLogger } = require("../utils/logger/index");
const ResponseHandler = require("../utils/responseHandler");

class ConversationController {
  static async createConversation(req, res) {
    try {
      const { type, userIds } = req.body;

      if (!type || !userIds || !Array.isArray(userIds) || userIds.length < 2) {
        return ResponseHandler.error(res, 400, "Conversation type and at least 2 userIds are required");
      }

      const conversation = await ConversationService.createConversation(type, userIds);

      if (conversation.isExisting) {
        return ResponseHandler.success(res, 200, "Conversation already exists", { conversation });
      }

      return ResponseHandler.success(res, 201, "Conversation created successfully", { conversation });
    } catch (err) {
      databaseLogger.error("Create conversation failed", { error: err.message });
      return ResponseHandler.error(res, 500, "Failed to create conversation", err.message);
    }
  }


  static async getUserConversations(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseHandler.error(res, 400, "User ID is required");
      }

      const conversations = await ConversationService.getConversationsByUser(id);

      return ResponseHandler.success(res, 200, "Conversations fetched successfully", {
        conversations,
      });
    } catch (err) {
      databaseLogger.error("Get conversations failed", { error: err.message });
      return ResponseHandler.error(res, 500, "Failed to fetch conversations", err.message);
    }
  }
}

module.exports = ConversationController;
