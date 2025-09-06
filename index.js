const dotenv = require('dotenv');
const http = require("http");
const { Server } = require("socket.io");
const App = require("./app");
const logger = require('./utils/logger')
const SocketManager = require("./sockets/socketManager");

const PORT = process.env.PORT || 5000;

const appInstance = new App();
const server = http.createServer(appInstance.getApp());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
});

new SocketManager(io);

server.listen(PORT, () => {
    logger.info(`🚀 Server running on port http://localhost:${PORT}`);
});
