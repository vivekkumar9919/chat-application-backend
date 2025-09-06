const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./connections/postgres/index");
const { RedisStore } = require("connect-redis");
const redisClient = require("./connections/redis/index");

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


     // Redis session store
    // ✅ Session with Redis (ioredis client)
    this.app.use(
      session({
        store: new RedisStore({
          client: redisClient,
          prefix: "sess:", // optional key prefix
        }),
        secret: process.env.SESSION_SECRET || "SUPER_SECRET_KEY",
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: false, // set true in prod w/ HTTPS
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
      })
    );
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
