const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const redisClient = require("./connections/redis/index");
const cookieParser = require("cookie-parser"); // For handling cookies
class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors({
      origin: "*", // frontend URL
      credentials: true, // allow cookies
    }));
    this.app.use(express.json());


   this.app.use(cookieParser()); // Add cookie-parser middleware

    // Middleware to check for session ID in cookies and validate with Redis
    this.app.use(async (req, res, next) => {
      const sessionId = req.cookies.sessionId; // Get session ID from cookie
      if (sessionId) {
        try {
          const sessionData = await redisClient.get(`sess:${sessionId}`);
          if (sessionData) {
            req.user = JSON.parse(sessionData); // Attach user data to request
          }
        } catch (err) {
          console.error("Redis session retrieval error:", err);
        }
      }
      next();
    });
  }

  routes() {
    this.app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    this.app.use("/api/v1/auth", authRoutes);
  }

  getApp() {
    return this.app;
  }
}

module.exports = App;
