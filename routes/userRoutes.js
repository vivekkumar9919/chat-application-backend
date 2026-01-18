const express = require("express");
const UserController = require("../controllers/userController");
const multer = require("multer");
const { attachSession } = require("../middlewares/authMiddleware");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and search
 */


/**
* @swagger
* /users/search:
*   get:
*     summary: Search users by username or email
*     tags: [Users]
*     parameters:
*       - in: query
*         name: query
*         required: true
*         schema:
*           type: string
*         description: Search term (username or email)
*     responses:
*       200:
*         description: List of matching users
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   id:
*                     type: integer
*                     example: 2
*                   username:
*                     type: string
*                     example: john_doe
*                   email:
*                     type: string
*                     format: email
*                     example: john@example.com
*       400:
*         description: Query parameter is required
*       500:
*         description: Internal Server Error
*/
router.get("/search", UserController.searchUserByUsername);

/**
 * @swagger
 * /users/fetchAll:
 *   get:
 *     summary: Fetch all users
 *     description: Retrieves a list of all registered users from the system.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "64afc2b9d1234567890abc12"
 *                   name:
 *                     type: string
 *                     example: "Satyam Kumar"
 *                   email:
 *                     type: string
 *                     example: "satyam@example.com"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-09-23T12:34:56Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-09-23T12:34:56Z"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/fetchAll", UserController.fetchAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: exampleuser
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: exampleuser@example.com
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", UserController.fetchUserById);

/**
 * @swagger
 * /users/profile-pic:
 *   patch:
 *     summary: Update user's profile picture
 *     description: Uploads a new profile image for the user and updates the stored profile picture URL in the database.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []   # If authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 profilePicUrl:
 *                   type: string
 *       400:
 *         description: Bad request or invalid file format
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch("/profile-pic", upload.single("file"), UserController.updateProfilePicture);


module.exports = router;
