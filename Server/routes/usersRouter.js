const express = require('express') 
const router = express.Router() 
const {Auth} = require('../middleware/auth')

const {
      getAllUsers,
      addUser,
      searchUser,
      getUser,friendShipRequest,
      friendApproval,
      removeFriend,
      unapproveFriend,
      resetPassword,
      deleteUser} = require('../controllers/usersController')

router
.get('/', Auth, getAllUsers)
.post('/',addUser)

router
.get('/:id',Auth,getUser) 
.delete('/:id',deleteUser)

router
.post('/search-user',Auth,searchUser)
.patch('/friendship-request/:id',Auth,friendShipRequest)
.patch('/add-friend/:id',Auth,friendApproval)
.patch('/remove-friend/:id',Auth,removeFriend)
.patch('/unapprove-request/:id',Auth,unapproveFriend)
.patch('/reset-pass/:id',resetPassword) 


module.exports = router

