const MessageService = require("../services/messageService");
const { databaseLogger } = require("../utils/logger/index");

class MessageController {
  static async sendMessage(req, res) {
    try {
      const { id } = req.params; // conversation_id
      const { senderId, messageText } = req.body;
      if(!id){
        res.status(400).send({message:"Req params is required"});
      }
      if(!senderId || !messageText){
        res.status(400).send({message: "Body is required"})
      }
      const message = await MessageService.sendMessage(id, senderId, messageText);
      res.status(201).json(message);
    } catch (err) {
      databaseLogger.error("Send message failed", { error: err.message });
      res.status(400).json({ error: err.message });
    }
  }

  static async getMessages(req, res) {
    try {
        console.log("req");
      const { id } = req.params; // conversation_id
      const userId = req.query.userId; // current user ID from query params
      const messages = await MessageService.getMessages(id, userId);
      res.json(messages);
    } catch (err) {
        console.log(err);
      databaseLogger.error("Get messages failed", { error: err.message });
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = MessageController;
