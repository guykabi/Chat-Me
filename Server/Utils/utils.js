const {compare} = require('bcryptjs')
const {sign} = require('jsonwebtoken')
const {User} =require('../models/messagesModel')
const excludeFields = '-password -friends -friendsWaitingList -notifications -__v'



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
       {expiresIn:process.env.JWT_EXPIRES_IN}
       ) 
   const refreshToken = sign(
        {id:data._id},
        process.env.REFRESH_TOKEN,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRE}
        )  

      return{accessToken,refreshToken}  
} 


const generateTokens = ()=>{
   const accessToken = sign(
      {id:Math.floor(Math.random() * 38248)},
      process.env.ACCESS_SECRET_TOKEN,
      {expiresIn:process.env.JWT_EXPIRES_IN}
      )  
      
   const refreshToken = sign(
      {id:Math.floor(Math.random() * 382442)},
      process.env.REFRESH_TOKEN,
      {expiresIn:process.env.REFRESH_TOKEN_EXPIRE}
      )  
   return {accessToken,refreshToken}
} 


const approveFriend =async (id,friendId,next) =>{
  
      try{   
            //Delete the pending friendship request + notification
            let user = await User.findOneAndUpdate(                //Identifies notification via frindId              
            { _id: id }, { $pull: { friendsWaitingList: friendId , notifications:{sender:friendId} }},{new: true})
            .select('-password')
            .populate({path:'friends',select:excludeFields})
            .populate({path:'friendsWaitingList',select:excludeFields})

         
            //Adding the user to the user's array of friends!
            await User.findOneAndUpdate(
            { _id: friendId }, { $push: { friends: id } }) 
  
            let result = {message:'The Friend approval has been done',user}
            return result
      
      }catch(err){
          return next(err)
      }
}

module.exports = {generateInitialToken,generateTokens,approveFriend}