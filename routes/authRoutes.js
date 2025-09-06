
const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: User Authentication
 */


/**
 * @swagger
 * /auth/signup:
 *  post:
 *      summary: Register a new user
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - username
 *                          - email
 *                          - password
 *                      properties:
 *                          username:
 *                             type: string
 *                             example: exampleuser
 *                          email:
 *                              type: string
 *                              format: email
 *                              example: exampleuser@example.com
 *                          password:
 *                              type: string
 *                              format: password
 *                              example: password123
 *      responses:
 *          201:
 *              description: User registered successfully
 *          400:
 *              description: Missing required fields or user already exists
 *          500:
 *              description: Internal Server Error
 */
router.post("/signup", AuthController.signup);

/**
 * @swagger
 * /auth/login:
 *  post:
 *      summary: Login a user
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - password
 *                      properties:
 *                          email:
 *                              type: string
 *                              format: email
 *                              example: exampleuser@example.com
 *                          password:
 *                              type: string
 *                              format: password
 *                              example: password123
 *      responses:
 *          200:
 *              description: User logged in successfully
 *          401:
 *              description: Invalid email or password
 *          500:
 *              description: Internal Server Error
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /auth/logout:
 *  post:
 *      summary: Log out a user
 *      tags: [Auth]
 *      responses:
 *          200:
 *              description: User logged out successfully
 *          500:
 *              description: Internal Server Error
 */
router.post("/logout", AuthController.logout);

/**
 * @swagger
 * /auth/me:
 *  get:
 *      summary: Get current user details
 *      tags: [Auth]
 *      responses:
 *          200:
 *              description: Current user details retrieved successfully
 *          401:
 *              description: Unauthorized, no valid session
 *          500:
 *              description: Internal Server Error
 */
router.get("/me", AuthController.getCurrentUser);

module.exports = router;