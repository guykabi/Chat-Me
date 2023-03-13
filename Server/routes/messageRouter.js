const express = require('express') 
const router = express.Router() 
const {Auth} = require('../middleware/auth')

const {
     getMessageByConId,
     addNewMessage,
     handleSeenMessage} = require('../controllers/messageController') 

router
.get('/:conversation',Auth,getMessageByConId)  
.post('/',Auth,addNewMessage)
.patch('/seen/:id',handleSeenMessage)


module.exports = router;
