const express = require("express");
const cors = require("cors");

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  routes() {
    this.app.get("/", (req, res) => {
      res.send("Hello World!");
    });
  }

  getApp() {
    return this.app;
  }
}

module.exports = App;
