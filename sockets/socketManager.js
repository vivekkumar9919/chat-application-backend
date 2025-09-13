const { socketLogger } = require('../utils/logger/index')

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
          socketLogger.info("User joined", { socket_id: socket.id, user_id: userId, online_users_count: this.onlineUsers.size });
          this.io.emit("onlineUsers", Array.from(this.onlineUsers.keys()));
        });
  
        // Send message
        socket.on("sendMessage", ({ to, message, from }) => {
          const socketId = this.onlineUsers.get(to);
          if (socketId) {
            socketLogger.info("Message sent", { from, to, socket_id: socketId, message_length: message.length });
            this.io.to(socketId).emit("receiveMessage", { message, from });
          } else {
            socketLogger.warn("Message send failed - recipient not online", { from, to, socket_id: socket.id });
          }
        });
  
        // Disconnect
        socket.on("disconnect", () => {
          let disconnectedUserId = null;
          for (let [userId, socketId] of this.onlineUsers) {
            if (socketId === socket.id) {
              disconnectedUserId = userId;
              this.onlineUsers.delete(userId);
              break;
            }
          }
          this.io.emit("onlineUsers", Array.from(this.onlineUsers.keys()));
          socketLogger.info("User disconnected", { socket_id: socket.id, user_id: disconnectedUserId, online_users_count: this.onlineUsers.size });
        });
      });
    }
  }
  
module.exports = SocketManager;
  