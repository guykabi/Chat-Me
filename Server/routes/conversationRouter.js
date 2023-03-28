const express = require('express') 
const router = express.Router() 
const {Auth} = require('../middleware/auth')
const upload = require('../middleware/upload')


const {
      getAllConversations,
      addNewConversation,
      updateConversation,
      addMember,
      removeMember,
      addManager,
      removeManager,
      deleteConversation} = require('../controllers/conversationController')

router
.get('/:id',Auth,getAllConversations)
.post('/',Auth,addNewConversation)
.patch('/:id',Auth,upload.single("groupImage"),updateConversation)
.patch('/add-member/:conId',Auth,addMember)
.patch('/remove-member/:conId',Auth,removeMember)
.patch('/add-manager/:conId',Auth,addManager)
.patch('/remove-manager/:conId',Auth,removeManager)
.delete('/:id',Auth,deleteConversation)

module.exports = router;