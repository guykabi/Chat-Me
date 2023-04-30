import {User} from '../models/messagesModel.js'
import {generateInitialToken} from '../utils/utils.js'
import {verify} from 'jsonwebtoken'

  
  export const checkValidity = async(req,resp,next)=>{
    try{
      resp.status(200)
      .json({ success: true, message: 'New access token' })  
    }catch(err){
      next(err)
    }        
  }
  
  

  export const checkUserCredentials = async(req,resp,next)=>{ 
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
  

  export const validateResetLink =async (req,resp,next)=>{
    
      const {id,token} = req.body 
      try{
           let user = await User.findById(id)
           if(!user)return resp.status(200).json('Not such user')
            
           verify(token,process.env.RESET_TOKEN, async (err)=>{
               if(err){
                 return next(new Error('Invalid token from reset link'))
               }
               return resp.status(200).json('Valid reset password token')
           })


      }catch(error){
        next(error)
      }
  }

  
  export const logOut = async(req,resp)=>{
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
  
