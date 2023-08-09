import {} from 'dotenv/config';
import cors from 'cors'
import express from 'express'
import usersRouter from './routes/usersRouter.js'
import messagesRouter from './routes/messageRouter.js'
import conversationRouter from './routes/conversationRouter.js'
import authRouter from './routes/authRouter.js'
import {errorHandler} from './middleware/errorHandler.js'
import {corsOptions} from './config/corsOptions.js'
import cookieParser from 'cookie-parser'
import { userLimiter } from './services/rateLimiter.js';
 

const port = process.env.PORT || 8000  

const app = express() 
app.use(cookieParser());
app.use(cors(corsOptions)) 
app.use(express.json());  

import './config/database.js'


app.use('/api/users',userLimiter,usersRouter) 
app.use('/api/messages',messagesRouter)
app.use('/api/conversation',conversationRouter)
app.use('/api/auth',authRouter)
app.use('*',(req, res)=>{
    res.status(401).json('Unknown path!')
});

//Middleware for handling errors globaly
app.use(errorHandler)


app.listen(port,()=>{
    console.log(`Listenning on port ${port}`)
})

