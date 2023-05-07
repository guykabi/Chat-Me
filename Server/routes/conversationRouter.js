import {Auth} from '../middleware/auth.js'
import express from 'express'
import {upload} from '../middleware/upload.js'
const router = express.Router() 


import {
      getSingleConversation,
      getAllConversations,
      addNewConversation,
      updateConversation,
      addMember,
      removeMember,
      addManager,
      removeManager,
      deleteConversation} from '../controllers/conversationController.js'

router
.get('/single/:conId',Auth,getSingleConversation)
.get('/:id',Auth,getAllConversations)
.post('/',Auth,addNewConversation)
.patch('/:id',Auth,upload.single("groupImage"),updateConversation)
.patch('/add-member/:conId',Auth,addMember)
.patch('/remove-member/:conId',Auth,removeMember)
.patch('/add-manager/:conId',Auth,addManager)
.patch('/remove-manager/:conId',Auth,removeManager)
.delete('/:id',Auth,deleteConversation)

export default  router