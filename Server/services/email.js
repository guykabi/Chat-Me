import {send} from '@emailjs/nodejs'
import jwt from 'jsonwebtoken'
const {sign} = jwt

export const sendEmail = async (user,url,next) =>{ 
    
   const token = sign(
    {id:user._id},
    process.env.RESET_TOKEN,
    {expiresIn:process.env.RESET_TOKEN_EXPIRE}
    ) 

    let obj = {}
    obj.email = user.email 
    obj.name = user.name,
    obj.url = `${url}/${user._id}/${token}`
    
    try{
        await send(process.env.YOUR_SERVICE_ID,process.env.YOUR_TEMPLATE_ID, obj, {
        publicKey: process.env.YOUR_PUBLIC_KEY,
        privateKey: process.env.YOUR_PRIVATE_KEY
      }) 
      return 'Success'
    }catch(error)
    {    
        return next(error)
    }
  }