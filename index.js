
const express = require('express');
// const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// const http = require('http').createServer(app);

// const io = new Server(http, {
//     cors:{
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// })
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT);
const io = require('socket.io')(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST","PATCH","DELETE"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});

//store online users
let onlineUsers = new Map();
io.on("connection", (socket) => {
  

  socket.emit("ping", "Pinging you......");


  console.log(`User connected: ${socket.id}`);

    socket.on('join', (userId) =>{
        onlineUsers.set(userId, socket.id);
        //broadcast who is online
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    })


    //send message
    socket.on('sendMessage', ({to, message, from}) =>{
        const socketId = onlineUsers.get(to);
        if(socketId){
            io.to(socketId).emit('receiveMessage', {message, from});
        }
    })


    //Disconnect
    socket.on('disconnect', () =>{
        for( let [userId, socketId] of onlineUsers){
            if(socketId === socket.id){
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        console.log(`User disconnected: ${socket.id}`);
    })
});


app.set("socketio", io);




// io.on('connection', (socket) =>{
//     console.log(`User connected: ${socket.id}`);
//     socket.emit('ping-pong', 'pinging you...');

//     socket.on('join', (userId) =>{
//         onlineUsers.set(userId, socket.id);
//         //broadcast who is online
//         io.emit('onlineUsers', Array.from(onlineUsers.keys()));
//     })


//     //send message
//     socket.on('sendMessage', ({to, message, from}) =>{
//         const socketId = onlineUsers.get(to);
//         if(socketId){
//             io.to(socketId).emit('receiveMessage', {message, from});
//         }
//     })


//     //Disconnect
//     socket.on('disconnect', () =>{
//         for( let [userId, socketId] of onlineUsers){
//             if(socketId === socket.id){
//                 onlineUsers.delete(userId);
//                 break;
//             }
//         }
//         io.emit('onlineUsers', Array.from(onlineUsers.keys()));
//         console.log(`User disconnected: ${socket.id}`);
//     })
// })



app.get('/', (req, res) => {
    res.send('Hello World!');
})


// app.listen(3000, () =>{
//     console.log('Server is running on port 3000');
// })