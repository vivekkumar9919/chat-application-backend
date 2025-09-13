const Logger = require('../utils/logger')
const {socketLogger} = require('../utils/logger/index')

class SocketManager {
    constructor(io) {
      this.io = io;
      this.onlineUsers = new Map();
      this.registerEvents();
    }
  
    registerEvents() {
      this.io.on("connection", (socket) => {
        socketLogger.info("User connected:", {socket_id:socket.id});
        socket.emit("ping", "Pinging you......");
  
        // User joins
        socket.on("join", (userId) => {
          this.onlineUsers.set(userId, socket.id);
          this.io.emit("onlineUsers", Array.from(this.onlineUsers.keys()));
        });
  
        // Send message
        socket.on("sendMessage", ({ to, message, from }) => {
          const socketId = this.onlineUsers.get(to);
          if (socketId) {
            this.io.to(socketId).emit("receiveMessage", { message, from });
          }
        });
  
        // Disconnect
        socket.on("disconnect", () => {
          for (let [userId, socketId] of this.onlineUsers) {
            if (socketId === socket.id) {
              this.onlineUsers.delete(userId);
              break;
            }
          }
          this.io.emit("onlineUsers", Array.from(this.onlineUsers.keys()));
          socketLogger.info("User disconnected:" ,{socket_id:socket.id});
        });
      });
    }
  }
  
module.exports = SocketManager;
  