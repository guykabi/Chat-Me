const {compare} = require('bcryptjs')
const {sign} = require('jsonwebtoken')


const excludePassword = (obj)=>{
   let newObj = {...obj._doc}
   delete newObj['password']
   return newObj
}  


const generateInitialToken = async (data,password)=>{
   //Compares the password that the client typed with the encryped one on the DB
   const isMatch = await compare(password,data.password) 
   if(!isMatch)
        {
         return {invalidPassword:'Invalid password'}
        } 

   const accessToken = sign(
       {id:data._id},
       process.env.ACCESS_SECRET_TOKEN,
       {expiresIn: 30}
       ) 
   const refreshToken = sign(
        {id:data._id},
        process.env.REFRESH_TOKEN,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRE}
        )  

      return{accessToken,refreshToken}  
} 


const generateToken = ()=>{
   const accessToken = sign(
      {id:Math.floor(Math.random() * 38248)},
      process.env.ACCESS_SECRET_TOKEN,
      {expiresIn:process.env.JWT_EXPIRES_IN}
      )  
   return accessToken
}

module.exports = {excludePassword, generateInitialToken,generateToken}