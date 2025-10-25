const MessageService = require("../services/messageService");
const SocketManager = require("../sockets/socketManager");
const { databaseLogger } = require("../utils/logger/index");
const ResponseHandler = require("../utils/responseHandler");

class MessageController {
  static async sendMessage(req, res) {
    try {
      const { id } = req.params; // conversation_id
      const { senderId, messageText } = req.body;

      if (!id) {
        return ResponseHandler.error(res, 400, "Conversation ID (params) is required");
      }
      if (!senderId || !messageText) {
        return ResponseHandler.error(res, 400, "SenderId and messageText are required");
      }

      const message = await MessageService.sendMessage(id, senderId, messageText);

      return ResponseHandler.success(res, 201, "Message sent successfully", {
        message, // actual saved message object
      });
    } catch (err) {
      databaseLogger.error("Send message failed", { error: err.message });
      return ResponseHandler.error(res, 500, "Failed to send message", err.message);
    }
  }

  static async getMessages(req, res) {
    try {
      const { id } = req.params; // conversation_id
      const userId = req.query.userId;

      const messages = await MessageService.getMessages(id, userId);

      return ResponseHandler.success(res, 200, "Messages fetched successfully", {
        messages,
      });
    } catch (err) {
      databaseLogger.error("Get messages failed", { error: err.message });
      return ResponseHandler.error(res, 500, "Failed to fetch messages", err.message);
    }
  }
}

module.exports = MessageController;
