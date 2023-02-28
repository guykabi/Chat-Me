const {User} =require('../models/messagesModel')
const {generateInitialToken} = require('../Utils/utils')


const logOut = async(req,resp)=>{
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
  }
  
  
  const checkValidity = async(req,resp,next)=>{
    try{
      resp.status(200)
      .json({ success: true, message: 'New access token' })  
    }catch(err){
      next(err)
    }        
  }
  
  

  const checkUserCredentials = async(req,resp,next)=>{ 
       const {email,password} = req.body
       
       try{
            let data = await User.findOne({email})
          
            if(!data) {
               return resp.status(200).json('Email does not exist') 
            }
  
             const {accessToken,refreshToken,invalidPassword} = await generateInitialToken(data,password)
             if(invalidPassword) return resp.status(200).json(invalidPassword)
             
             
  
             resp.cookie('token',{accessToken,refreshToken},{
               maxAge:process.env.COOKIE_EXPIRE_IN , httpOnly: true
             })   
  
             .cookie('userData',JSON.stringify(data),{
              maxAge:process.env.COOKIE_EXPIRE_IN , httpOnly: true
             }) 
             
             resp.status(200).json({message:'User got authorized',userData:data})
  
     } catch(err){next(err)}
  }
  
  
  module.exports = {logOut,checkValidity,checkUserCredentials}
