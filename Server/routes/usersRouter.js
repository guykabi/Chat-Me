const express = require('express') 
const router = express.Router() 
const {User} =require('../models/messagesModel')
const {hash,genSalt} = require('bcryptjs')
const {Auth} = require('../middleware/auth')
const {approveFriend} = require('../Utils/utils')


router.get('/',async(req,resp,next)=>{
   try{
      let users = await User.find()
      return resp.status(200).json(users)
   }catch(err){return next(err)}
})



router.get('/:id',Auth,async(req,resp,next)=>{
   const {id} = req.params
      try{
            let user = await User.findById(id)
            .select('-password')
            .populate({path:'friends',select: '-password -friends -friendsWaitingList -notifications -__v'})
            .populate({path:'friendsWaitingList',select: '-password -friends -friendsWaitingList -notifications -__v'})
            return resp.status(200).json(user)
      }catch(err){
            return next(new Error('No such user!'))
      }       
})  




router.post('/',async (req,resp,next)=>{
    const newUser = new User(req.body) 
   try{
      await newUser.save()
      resp.status(200).json('User added')
   }catch(err){next(err)}
})  



router.post('/search-user',async(req,resp,next)=>{
    const body = req.body 
  try{
     //Search for any username - without case sensitivity
     let user = await User.find({"name" : {$regex : `${body.userName}`,$options: 'i'}})
     .select('-password -__v')
     
     resp.status(200).json(user) 

  }catch(err){next(err)}
})  



router.patch('/friendship-request/:id',Auth,async(req,resp,next)=>{
   const {id} = req.params
   const {friendId,message} = req.body
   
   try{    

         let isAlreadyRequest = await User.find({_id:friendId,friendsWaitingList:id})
         if(isAlreadyRequest.length){

            //Removing the request + notification the other person
            await User.findOneAndUpdate(                                         
            { _id: friendId }, { $pull: { friendsWaitingList:id , notifications:{sender:id}}})
            return resp.status(200).json('Request has been removed!')

         } 

         //Insert to the friend's waitinglist + to notifications list
         let notifyObj = {sender:id,message,seen:false}
         
         await User.findOneAndUpdate(
         { _id: friendId }, { $push: { friendsWaitingList: id, notifications:notifyObj }})
         
         return resp.status(200).json('Request has been made!')

   }catch(err){
     next(err)
   }
})



router.patch('/add-friend/:id',Auth,async(req,resp,next)=>{
   const {id} = req.params
   const {friendId} = req.body
   
   try{  
       let isRequestExsit = await User.find({_id:id,friendsWaitingList:friendId})
       if(!isRequestExsit.length) return resp.status(200).json('Request is not exsit')

       let result = await approveFriend(id,friendId,next)
       if(result.message === 'The Friend approval has been done'){
       return resp.status(200).json(result)
       }

   }catch(err){
     next(err)
   }
})


router.patch('/remove-friend/:id',Auth,async(req,resp,next)=>{
   const {id} = req.params
   const {friendId} = req.body
 
   try{
         let isAlreadyFriend = await User.find({_id:id,friends:friendId})
         if(!isAlreadyFriend.length) return resp
         .status(200)
         .json('Cannot remove non existing friend')

         let user = await User.findOneAndUpdate(
         { _id: id }, { $pull: { friends: friendId } },{new: true})
         .select('-password -__v')
         .populate({path:'friends',select: '-password -friends -friendsWaitingList -notifications -__v'})
         .populate({path:'friendsWaitingList',select: '-password -friends -friendsWaitingList -notifications -__v'})

         return resp.status(200).json({message:'Friend has been removed!',user})
      
      
   }catch(err){
      next(err)
   }
})


router.patch('/unapprove-request/:id',Auth,async(req,resp,next)=>{
   const {id} = req.params
   const {friendId} = req.body
   try{
         let user = await User.findOneAndUpdate(
         { _id: id }, { $pull: { friendsWaitingList: friendId , notifications:{sender:friendId} } },{new: true})
         .select('-password -__v')
         .populate({path:'friends',select: '-password -friends -friendsWaitingList -notifications -__v'})
         .populate({path:'friendsWaitingList',select: '-password -friends -friendsWaitingList -notifications -__v'})

         return resp.status(200).json({message:'Request has been decline!',user})

   }catch(err){
      next(err)
   }
})



router.patch('/reset-pass/:id',async(req,resp,next)=>{
   
   //Crypt the changed password
   const salt = await genSalt(12)
   const passwordHash = await hash(req.body.password,salt)

  try{  
         let data = await User.updateOne( 
         { _id:req.params.id} , { $set: { password:passwordHash } })
         .select('-password')

         if(data) return resp.status(200).json('Updated')

 }catch(err){next(err)}

}) 



router.delete('/:id',Auth,async(req,resp,next)=>{
   const {id} = req.params
   try{
      await User.findByIdAndDelete(id)
      resp.status(200).json('User deleted!')
   }catch(err){
    next(new Error('No such user!'))
   }
})


module.exports = router

