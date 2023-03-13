const express = require('express') 
const router = express.Router() 
const {Auth} = require('../middleware/auth')

const {
      getAllConversations,
      addNewConversation,
      updateConversation,
      deleteConversation} = require('../controllers/conversationController')

router
.get('/:id',Auth,getAllConversations)
.post('/',Auth,addNewConversation)
.patch('/:id',Auth,updateConversation)
.delete('/:id',Auth,deleteConversation)

module.exports = router;