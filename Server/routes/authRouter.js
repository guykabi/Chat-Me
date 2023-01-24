const express = require('express') 
const router = express.Router() 
const {User} =require('../models/messagesModel')
const {verify} = require('jsonwebtoken')
const {excludePassword,generateInitialToken,generateToken} = require('../Utils/utils')


router.get('/logout',async(req,resp)=>{
    resp.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    }) 
    resp.cookie('userData', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    })
        return resp
       .status(200)
       .json({ success: true, message: 'User logged out successfully' })
  }) 
  
  
  router.post('/refresh',async(req,resp,next)=>{
     
     const refreshToken = req.headers?.['refresh-token']
     try{
        verify(refreshToken, process.env.REFRESH_TOKEN,async (err, data)  => {
            if (err) {
               return next(new Error('Failed to authenticate refresh token'))
            }else{
               const accessToken = generateToken()
               resp.cookie('token',{accessToken,refreshToken},{
                  maxAge:process.env.COOKIE_EXPIRE_IN , httpOnly: true
                })

               resp
               .status(200)
               .json({ success: true, message: 'New access token' })
            }
         })
     }catch(err){
         next(err)
     }
  })
  
  
  
  //Check is user exists - if does return the user data and token
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
