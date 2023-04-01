const express = require('express') 
const router = express.Router() 
const {Auth} = require('../middleware/auth')
const upload = require('../middleware/upload')

const {
     getMessageByConId,
     addNewMessage,
     handleSeenMessage,
     likeMessage,
     deleteMessage} = require('../controllers/messageController') 

router
.get('/:conversation',Auth,getMessageByConId)  
.post('/',Auth,upload.single('messageImage'),addNewMessage)
.patch('/seen/:id',handleSeenMessage)
.patch('/like-message/:id',Auth,likeMessage)
.delete('/delete-message/:id',Auth,deleteMessage)


module.exports = router;
