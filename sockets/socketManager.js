const { socketLogger } = require('../utils/logger/index')
const MessageService = require('../services/messageService')
const { databaseLogger } = require('../utils/logger/index')
const SessionService = require('../services/sessionService')
const UserService = require('../services/userService')

class SocketManager {
    constructor(io) {
      this.io = io;
      this.onlineUsers = new Map();
      this.userSessions = new Map(); // Store user sessions
      this.registerEvents();
    }
  
    registerEvents() {
      // Socket authentication middleware using session cookies
      this.io.use(async (socket, next) => {
        const cookies = socket.handshake.headers.cookie;
        socketLogger.info("Socket connection attempt", { 
          socket_id: socket.id, 
          cookies: cookies ? 'present' : 'missing',
          cookie_string: cookies,
          headers: Object.keys(socket.handshake.headers)
        });
        
        const sessionId = cookies
          ?.split(';')
          ?.find(cookie => cookie.trim().startsWith('sessionId='))
          ?.split('=')[1];
        
        if (!sessionId) {
          socketLogger.warn("Socket connection rejected - no session", { socket_id: socket.id, cookies });
          return next(new Error('Authentication error: No session provided'));
        }

        try {
          const sessionData = await SessionService.getSession(sessionId);
          if (!sessionData) {
            socketLogger.warn("Socket authentication failed - invalid session", { socket_id: socket.id, session_id: sessionId });
            return next(new Error('Authentication error: Invalid session'));
          }

          // Fetch user info from database
          const userInfo = await UserService.getUserById(sessionData.id);
          if (!userInfo) {
            socketLogger.warn("Socket authentication failed - user not found", { socket_id: socket.id, user_id: sessionData.id });
            return next(new Error('Authentication error: User not found'));
          }

          socket.userId = sessionData.id;
          socket.userInfo = userInfo;
          socketLogger.info("Socket authenticated with session", { socket_id: socket.id, user_id: sessionData.id });
          next();
        } catch (err) {
          socketLogger.warn("Socket authentication failed", { socket_id: socket.id, error: err.message });
          next(new Error('Authentication error: Session validation failed'));
        }
      });

      this.io.on("connection", (socket) => {
        socketLogger.info("Authenticated user connected:", {socket_id:socket.id, user_id: socket.userId});
        socket.emit("ping", "Pinging you......");
        socket.on("pong", (msg) => {
          socketLogger.info("Pong received from client:", {socket_id:socket.id, message: msg});
        })
        // User joins with session management (using authenticated user data)
        socket.on("join", (userData) => {
          const userId = socket.userId; // Use authenticated user ID
          const userInfo = socket.userInfo; // Use authenticated user info
          
          this.onlineUsers.set(userId, socket.id);
          this.userSessions.set(socket.id, { userId, userInfo, connectedAt: new Date() });
          socketLogger.info("User joined with session", { 
            socket_id: socket.id, 
            user_id: userId, 
            online_users_count: this.onlineUsers.size 
          });
          this.io.emit("onlineUsers", Array.from(this.onlineUsers.keys()));
        });
  
        // Send message with database storage
        socket.on("sendMessage", async ({ conversationId, messageText, senderId, receiverId }) => {
          try {
            // Save message to database
            const savedMessage = await MessageService.sendMessage(conversationId, senderId, messageText);
            
            // Get sender info from socket (already authenticated)
            const senderInfo = socket.userInfo || { id: senderId, username: 'Unknown' };
            
            // Prepare message data for real-time delivery
            const messageData = {
              id: savedMessage.messageId,
              message_text: messageText,
              sender_id: senderId,
              sender_name: senderInfo.username || 'Unknown',
              created_at: new Date().toISOString(),
              conversation_id: conversationId,
              isOwn: false // Will be set to true on sender's side
            };
            
            // Send to receiver if online
            const receiverSocketId = this.onlineUsers.get(receiverId);
            if (receiverSocketId) {
              this.io.to(receiverSocketId).emit("receiveMessage", messageData);
              socketLogger.info("Message delivered to receiver", { 
                from: senderId, 
                to: receiverId, 
                message_id: savedMessage.messageId 
              });
            }
            
            // Send confirmation to sender
            socket.emit("messageSent", { ...messageData, isOwn: true });
            
            socketLogger.info("Message saved and sent", { 
              from: senderId, 
              to: receiverId, 
              message_id: savedMessage.messageId,
              conversation_id: conversationId
            });
            
          } catch (error) {
            socketLogger.error("Failed to send message", { 
              error: error.message, 
              from: senderId, 
              to: receiverId 
            });
            socket.emit("messageError", { error: "Failed to send message" });
          }
        });
  
        // Disconnect with session cleanup
        socket.on("disconnect", () => {
          let disconnectedUserId = null;
          for (let [userId, socketId] of this.onlineUsers) {
            if (socketId === socket.id) {
              disconnectedUserId = userId;
              this.onlineUsers.delete(userId);
              break;
            }
          }
          
          // Clean up user session
          this.userSessions.delete(socket.id);
          
          this.io.emit("onlineUsers", Array.from(this.onlineUsers.keys()));
          socketLogger.info("User disconnected with session cleanup", { 
            socket_id: socket.id, 
            user_id: disconnectedUserId, 
            online_users_count: this.onlineUsers.size 
          });
        });
      });
    }
  }
  
module.exports = SocketManager;
  