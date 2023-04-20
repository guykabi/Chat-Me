import {} from 'dotenv/config';
import cors from 'cors'
import express from 'express'
import usersRouter from './routes/usersRouter.js'
import messagesRouter from './routes/messageRouter.js'
import conversationRouter from './routes/conversationRouter.js'
import authRouter from './routes/authRouter.js'
import {errorHandler} from './middleware/errorHandler.js'
import cookieParser from 'cookie-parser'
 

const port = process.env.PORT || 8000  

const app = express() 
app.use(cookieParser());
app.use(cors({
    origin : process.env.CLIENT_URL,
    credentials: true,
})) 
app.use(express.json());  

import './database/database.js'


app.use('/users',usersRouter) 
app.use('/messages',messagesRouter)
app.use('/conversation',conversationRouter)
app.use('/auth',authRouter)

//Middleware for handling errors globaly
app.use(errorHandler)


app.listen(port,()=>{
    console.log(`Listenning on port ${port}`)
})

