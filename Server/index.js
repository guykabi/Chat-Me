const express = require('express')
const cors = require('cors')  
const userRouter = require('./routes/usersRouter')
const messagesRouter = require('./routes/messageRouter')
const conversationRouter = require('./routes/conversationRouter')
const authRouter = require('./routes/authRouter')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')



require('dotenv').config() 
const port = process.env.PORT || 8000  

const app = express() 
app.use(cookieParser());
app.use(cors({
    origin : process.env.CLIENT_URL,
    credentials: true,
})) 
app.use(express.json());  

require('./database/database')    


app.use('/users',userRouter) 
app.use('/messages',messagesRouter)
app.use('/conversation',conversationRouter)
app.use('/auth',authRouter)

//Middleware for handling errors globaly
app.use(errorHandler)


app.listen(port,()=>{
    console.log(`Listenning on port ${port}`)
})

