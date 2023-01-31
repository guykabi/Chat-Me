const express = require('express')
const app = express() 
const cors = require('cors')
const http = require('http')
const {getUser,addUsers,removeUser} = require('./utils/utils')
const {Server} = require('socket.io')


require('dotenv').config() 
app.use(cors());

const server = http.createServer(app) 
const io =new Server(server,{
    cors:{
        origin:process.env.CLIENT_URL
    }
})  



io.on('connection', socket=>{
    console.log(`User connected: ${socket.id}`)
    
    //On user connect - add to the connected users
    socket.on("addUser",(userId)=>{
        let users =  addUsers(userId,socket.id)
        io.emit("getUsers",users)
    })  

    socket.on('sendMessage',(message,room)=>{
        
        if(!room){ 
              //To specific user
              const user = getUser(recieverId)
              socket.to(user?.socketId).emit('recieve-message',message)
              console.log(`Message is: ${message.text}`);
        }
        else{     
              //To chat group   
              io.in(room).emit('recieve-message',message)
              console.log(`Private room message ${message.text}`);
        } 
    })  

    socket.on('typing',(recieverId,userTyping,room)=>{
        if(!room){ 
            //To specific user
            const user = getUser(recieverId)
            socket.to(user?.socketId).emit('user_typing',recieverId)
            console.log(`Message is: typing...`)
      }
      else{     
            //To chat group   
            io.in(room).emit('user_typing',
            {message:`${userTyping} is typing...`,
            reciever:recieverId})
            console.log(`Private room message:${userTyping} typing...`);
      } 
    })

    socket.on('join_room',room =>{
        socket.join(room)
        console.log(`User ${socket.id} joined to room ${room}`);
    })

    socket.on('disconnect',()=>{
        let users = removeUser(socket.id)
        io.emit("getUsers",users)
        console.log(`User disconnect:${socket.id}`);
    })
})   



  server.listen(3001,()=>{
    console.log(`Listenning on port 3001`);
})
  