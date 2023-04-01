const express = require('express') 
const router = express.Router() 
const {Auth} = require('../middleware/auth')

const {
     logOut,
     checkValidity,
     checkUserCredentials
     } = require('../controllers/authController') 

router
.get('/logout',logOut)
.post('/validation',Auth,checkValidity)  
.post('/',checkUserCredentials)

   
  module.exports = router