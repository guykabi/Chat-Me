import {Auth} from '../middleware/auth.js'
import express from 'express'
import {upload} from '../middleware/upload.js'
const router = express.Router() 



import {
      getAllUsers,
      addUser,
      handleEmailSending,
      updateUser,
      searchUser,
      getUser,friendShipRequest,
      friendApproval,
      removeFriend,
      unapproveFriend,
      resetPassword,
      deleteUser} from '../controllers/usersController.js'

router
.get('/', Auth, getAllUsers)
.post('/',addUser)
.post('/email',handleEmailSending)

router
.get('/:id',Auth,getUser) 
.delete('/:id',deleteUser)

router
.post('/search-user',Auth,searchUser)
.patch('/:id',Auth,upload.single("userImage"),updateUser)
.patch('/friendship-request/:id',Auth,friendShipRequest)
.patch('/add-friend/:id',Auth,friendApproval)
.patch('/remove-friend/:id',Auth,removeFriend)
.patch('/unapprove-request/:id',Auth,unapproveFriend)
.patch('/reset-password/:id',resetPassword) 


export default router
