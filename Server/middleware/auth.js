const {verify} = require('jsonwebtoken')
const {generateTokens} = require('../Utils/utils')

const Auth = async (req,resp,next) =>{
    
    const {accessToken,refreshToken} = req.cookies['token']
    
    if (!accessToken || !refreshToken) {
         return next(new Error('No Token Provided'))
     } 
     
      verify(accessToken, process.env.ACCESS_SECRET_TOKEN,async (err, data)  => {
      if(err) {
        
            verify(refreshToken, process.env.REFRESH_TOKEN,async (err, data)  => {
            if(err) {
               return next(new Error('Failed to authenticate refresh token'))
             }
               const {accessToken,refreshToken} = generateTokens()
               resp.cookie('token',{accessToken,refreshToken},{
               maxAge:process.env.COOKIE_EXPIRE_IN , httpOnly: true
               })
               
           })
         }   
         
         next()  
    })
} 

module.exports = {Auth}