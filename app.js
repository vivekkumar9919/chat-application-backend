const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const pushRoutes = require('./routes/pushRoutes');
const redisClient = require("./connections/redis/index");
const cookieParser = require("cookie-parser"); // For handling cookies
const swaggerDocs = require("./config/swagger");
const SessionService = require("./services/sessionService");
const { attachSession } = require("./middlewares/authMiddleware");
class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    this.swagger();
  }

  middlewares() {
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173", // frontend URL
      credentials: true, // allow cookies
    }));
    this.app.use(express.json());


   this.app.use(cookieParser()); // Add cookie-parser middleware

    // Middleware to check for session ID in cookies and validate with Redis
    this.app.use(attachSession);
  }

  routes() {
    this.app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    this.app.use("/api/v1/auth", authRoutes);
    this.app.use("/api/v1/conversations", conversationRoutes);
    this.app.use("/api/v1/messages", messageRoutes);
    this.app.use("/api/v1/users", userRoutes);
    this.app.use("/api/v1/push", pushRoutes);
  }

  swagger(){
    swaggerDocs(this.app);
  }
  getApp() {
    return this.app;
  }
}

module.exports = App;
