const express = require('express') 
const router = express.Router() 
const {User} =require('../models/messagesModel')
const {Auth} = require('../middleware/auth')
const {excludePassword,generateInitialToken,generateTokens} = require('../Utils/utils')


router.get('/logout',async(req,resp)=>{
    resp.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    }) 
    resp.cookie('userData', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    })
    resp
    .status(200)
    .json({ success: true, message: 'User logged out successfully' })
  }) 
  
  
  router.post('/validation',Auth,async(req,resp,next)=>{
    try{
      resp.status(200)
      .json({ success: true, message: 'New access token' })  
    }catch(err){
      next(err)
    }        
  })
  
  

  router.post('/',async(req,resp,next)=>{ 
       const {email,password} = req.body
       
       try{
            let data = await User.findOne({email}) 
            if(!data) {
               return resp.status(200).json('Email does not exist') 
            }
  
             const {accessToken,refreshToken,invalidPassword} = await generateInitialToken(data,password)
             if(invalidPassword) return resp.status(200).json(invalidPassword)
             
             let newData = excludePassword(data)
  
             resp.cookie('token',{accessToken,refreshToken},{
               maxAge:process.env.COOKIE_EXPIRE_IN , httpOnly: true
             })   
  
             .cookie('userData',JSON.stringify(newData),{
              maxAge:process.env.COOKIE_EXPIRE_IN , httpOnly: true
             }) 
             
             resp.status(200).json({message:'User got authorized',userData:data})
  
     } catch(err){next(err)}
  }) 
  
  
  module.exports = router
