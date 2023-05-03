import {Auth} from '../middleware/auth.js'
import express from 'express'
import {upload} from '../middleware/upload.js'
const router = express.Router() 


import {
     getMessageByConId,
     addNewMessage,
     forwardMessage,
     handleSeenMessage,
     likeMessage,
     deleteMessage}  from '../controllers/messageController.js'

router
.get('/:conversation',Auth,getMessageByConId)  
.post('/',Auth,upload.single('messageFile'),addNewMessage)
.post('/forward-message',Auth,forwardMessage)
.patch('/seen/:id',handleSeenMessage)
.patch('/like-message/:id',Auth,likeMessage)
.delete('/delete-message/:id',Auth,deleteMessage)


export default router;
