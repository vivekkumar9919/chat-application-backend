const dotenv = require('dotenv');
dotenv.config();
const http = require("http");
const { Server } = require("socket.io");
const App = require("./app");
const { appLogger } = require('./utils/logger/index')
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
  appLogger.info("Server started successfully", { port: PORT, environment: process.env.NODE_ENV || 'development' });
});
