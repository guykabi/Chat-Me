import express from 'express'
import {Auth} from '../middleware/auth.js'
const router = express.Router() 


import {
     logOut,
     checkValidity,
     checkUserCredentials
     }  from '../controllers/authController.js'

router
.get('/logout',logOut)
.post('/validation',Auth,checkValidity)  
.post('/',checkUserCredentials)

   
  export default  router