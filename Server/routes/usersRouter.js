const express = require('express') 
const router = express.Router() 
const {User} =require('../models/messagesModel')
const {hash,genSalt} = require('bcryptjs')
const {Auth} = require('../middleware/auth')
const {excludePassword} = require('../Utils/utils')


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
            .populate({path:'friends',select: '-password -friends -__v'})
            .populate({path:'friendsWaitingList',select: '-password -friends -friendsWaitingList -__v'})

            resp.status(200).json(excludePassword(user))
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
     .select('-password')
     .populate({path:'friends',select: '-password -friends -__v'})
     .populate({path:'friendsWaitingList',select: '-password -friends -friendsWaitingList -__v'})

     resp.status(200).json(user) 
  }catch(err){next(err)}
})  



router.patch('/friendship-request/:id',Auth,async(req,resp,next)=>{
   const {id} = req.params
   const {friendId} = req.body

   try{
         let friendRequest = await User.findOneAndUpdate(
         { _id: id }, { $push: { friendsWaitingList: friendId } },{new: true})
         .select('-password')
         .populate({path:'friends',select: '-password -friends -__v'})
         .populate({path:'friendsWaitingList',select: '-password -friends -friendsWaitingList -__v'})

     return resp.status(200).json(friendRequest)

   }catch(err){
     next(err)
   }
})



router.patch('/add-friend/:id',Auth,async(req,resp,next)=>{
   const {id} = req.params
   const {friendId} = req.body

   try{  
      
      let removeRequest =  await User.findOneAndUpdate(
      { _id: id }, { $pull: { friendsWaitingList: friendId } },{new: true})

      if(!removeRequest) return next(new Error('Unable to complete the friendship requset proccess'))

      let addedFriend = await User.findOneAndUpdate(
      { _id: id }, { $push: { friends: friendId } },{new: true})
      .select('-password')
      .populate({path:'friends',select: '-password -friends -__v'})
      .populate({path:'friendsWaitingList',select: '-password -friends -friendsWaitingList -__v'})

      return resp.status(200).json(addedFriend)

   }catch(err){
     next(err)
   }
})


router.patch('/remove-friend/:id',Auth,async(req,resp)=>{
   const {id} = req.params
   const {friendId} = req.body
   try{

      let removeFriend =  await User.findOneAndUpdate(
      { _id: id }, { $pull: { friends: friendId } },{new: true})
      .select('-password')
      .populate({path:'friends',select: '-password -friends -__v'})
      .populate({path:'friendsWaitingList',select: '-password -friends -friendsWaitingList -__v'})

      return resp.status(200).json(removeFriend)

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

