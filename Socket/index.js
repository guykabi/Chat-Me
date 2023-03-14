const express = require('express')
const app = express() 
const cors = require('cors')
const http = require('http')
const {addUsers,removeUser,getUser,getAllUsers} = require('./utils/utils')
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
        
        let exists = getUser(userId)
        let users = addUsers(userId,socket.id)
        console.log(users);

        //Checking if the socket exists - if not, emit the event!
        if(exists)return
        io.emit('getUsers',users)
    })   


    socket.on('notification',({reciever,sender,message})=>{
        let result = getUser(reciever)
        
        if(message === 'The Friend approval has been done'){ 
            let users = getAllUsers()
            
            io.to(result?.socketId).emit('incoming-notification',{sender,reciever,message,users})
            io.to(result?.socketId).emit('getUsers',users)
            return
        }

        io.to(result?.socketId).emit('incoming-notification',{sender,reciever,message})            
        
    }) 

    socket.on('new-conversation',(conversation=undefined)=>{    
            io.local.emit('arrival-conversation',conversation)      
    }) 


    socket.on('sendMessage',(message,room)=>{
              io.in(room).emit('recieve-message',{message})

              //To inform the user about another in coming message
              io.local.emit('background-message',message)
              
              console.log(`Private room message ${message.text}`);
    })  

    socket.on('typing',(sender,userTyping,room)=>{

            io.in(room).emit('user_typing',
            {message:`${userTyping} is typing...`,
            sender,room})

            console.log(`Private room message:${userTyping} typing...`);
    
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
  