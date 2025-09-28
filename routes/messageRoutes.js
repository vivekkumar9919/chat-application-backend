const express = require("express");
const MessageController = require("../controllers/messageController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Messages
 *  description: Manage messages inside conversations
 */

/**
 * @swagger
 * /messages/{id}:
 *  post:
 *      summary: Send a message in a conversation
 *      tags: [Messages]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *                type: integer
 *            required: true
 *            description: Conversation ID
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - senderId
 *                          - messageText
 *                      properties:
 *                          senderId:
 *                              type: integer
 *                              example: 1
 *                          messageText:
 *                              type: string
 *                              example: Hello, how are you?
 *      responses:
 *          201:
 *              description: Message sent successfully
 *          400:
 *              description: Invalid request
 *          500:
 *              description: Internal Server Error
 */
router.post("/:id", MessageController.sendMessage);

/**
 * @swagger
 * /messages/{id}:
 *  get:
 *      summary: Get all messages from a conversation
 *      tags: [Messages]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *                type: integer
 *            required: true
 *            description: Conversation ID
 *          - in: query
 *            name: userId
 *            schema:
 *                type: integer
 *            required: true
 *            description: User ID to filter messages
 *      responses:
 *          200:
 *              description: List of messages retrieved successfully
 *          404:
 *              description: Conversation not found
 *          500:
 *              description: Internal Server Error
 */
router.get(`/:id`, MessageController.getMessages);

module.exports = router;
