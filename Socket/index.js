import express from 'express'
import cors from 'cors'
import http from 'http'
import {addUsers,removeUser,getUser,getAllUsers} from './utils/utils.js'
import {Server} from 'socket.io'
import {} from 'dotenv/config'

const app = express() 

app.use(cors());

const server = http.createServer(app) 
const io =new Server(server,{
    cors:{
        origin:process.env.CLIENT_URL
    }
})  

const port =  process.env.SOCKET_PORT || 8001

io.on('connection', socket=>{

    console.log(`User connected: ${socket.id}`)
   
    //On user connect - add to the connected users
    socket.on("addUser",(userId)=>{
        let exists = getUser(userId)
         //Checking if the socket exists
        if(exists)return

        let users = addUsers(userId,socket.id)
       
        io.emit('getUsers',users)
    })   
    
    socket.on('all-connected',()=>{
       let allUsers = getAllUsers()
       io.emit('getUsers',allUsers)
    })


    socket.on('notification',({reciever,sender,message})=>{
        let result = getUser(reciever)
        
        if(message === 'The Friend approval has been done'){ 
            let users = getAllUsers()
            io.to(result?.socketId)
            .emit('incoming-notification',{sender,reciever,message,users})
            return
        }
           
        io.to(result?.socketId)
        .emit('incoming-notification',{sender,reciever,message})            
            
    }) 

    socket.on('new-conversation',(conversation=undefined)=>{    
            io.local.emit('arrival-conversation',conversation)     
    }) 


    socket.on('sendMessage',(message,room,trigger=null)=>{
              
              if(message.message === 'Deleted'){ 
                 message.deleted.event = 'Deleted'
                 io.to(room).emit('recieve-message',{message:message.deleted})
                 return
               }
                io.to(room).emit('recieve-message',{message})

              //To inform the user about another in coming message
              if(trigger !== 'Not trigger'){
              io.local.emit('background-message',message)
              
              console.log(`Private room message ${message.text}`);
              }
    })  

    socket.on('typing',(sender,userTyping,room)=>{

            io.in(room).emit('user_typing',
            {message:`${userTyping} is typing...`,
            sender,room})

            console.log(`Private room message:${userTyping} typing...`);
    
    }) 

    socket.on('forward-message',(messages,rooms)=>{
        rooms.forEach((room,i)=>{
            io.to(room).emit('recieve-message',{message:messages[i]});
            io.local.emit('background-message',messages[i])
        }) 
    })

    socket.on('join_room',room =>{
        socket.join(room)

        console.log(`User ${socket.id} joined to room ${room}`);
    }) 

    socket.on('logout',()=>{
        let users = removeUser(socket.id)
        io.emit("getUsers",users)
    })

    socket.on('disconnect',()=>{
        let users = removeUser(socket.id)
        io.emit("getUsers",users)
        
        console.log(`User disconnect:${socket.id}`);
    })
})   


  server.listen(port,()=>{
    console.log(`Listenning on port ${port}`);
})
  