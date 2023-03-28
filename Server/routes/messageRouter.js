const express = require('express') 
const router = express.Router() 
const {Auth} = require('../middleware/auth')
const upload = require('../middleware/upload')

const {
     getMessageByConId,
     addNewMessage,
     handleSeenMessage} = require('../controllers/messageController') 

router
.get('/:conversation',Auth,getMessageByConId)  
.post('/',Auth,upload.single('messageImage'),addNewMessage)
.patch('/seen/:id',handleSeenMessage)


module.exports = router;
