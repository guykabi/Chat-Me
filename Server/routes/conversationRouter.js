const express = require('express') 
const router = express.Router() 
const {Auth} = require('../middleware/auth')

const {
      getAllConversations,
      addNewConversation,
      updateConversation} = require('../controllers/conversationController')

router
.get('/:id',getAllConversations)
.post('/',Auth,addNewConversation)
.patch('/:id',Auth,updateConversation)

module.exports = router;