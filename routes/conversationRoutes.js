const express = require("express");
const ConversationController = require("../controllers/conversationController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Conversations
 *  description: Manage conversations between users
 */

/**
 * @swagger
 * /conversations:
 *  post:
 *      summary: Create a new conversation
 *      tags: [Conversations]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - type
 *                          - userIds
 *                      properties:
 *                          type:
 *                              type: string
 *                              enum: [direct, group]
 *                              example: direct
 *                          userIds:
 *                              type: array
 *                              items:
 *                                  type: integer
 *                              example: [1, 2]
 *      responses:
 *          201:
 *              description: Conversation created successfully
 *          400:
 *              description: Invalid input
 *          500:
 *              description: Internal Server Error
 */
router.post("/", ConversationController.createConversation);

/**
 * @swagger
 * /conversations/user/{id}:
 *  get:
 *      summary: Get all conversations for a specific user
 *      tags: [Conversations]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *                type: integer
 *            required: true
 *            description: User ID
 *      responses:
 *          200:
 *              description: List of conversations retrieved successfully
 *          404:
 *              description: User not found
 *          500:
 *              description: Internal Server Error
 */
router.get("/user/:id", ConversationController.getUserConversations);

module.exports = router;
