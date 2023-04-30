import express from 'express'
import {Auth} from '../middleware/auth.js'
const router = express.Router() 


import {
     logOut,
     checkValidity,
     validateResetLink,
     checkUserCredentials
     }  from '../controllers/authController.js'

router
.get('/logout',logOut)
.post('/validation',Auth,checkValidity)  
.post('/validate-reset',validateResetLink)
.post('/',checkUserCredentials)

   
  export default  router