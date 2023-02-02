const express = require('express') 
const router = express.Router() 
const {User} =require('../models/messagesModel')
const {hash,genSalt} = require('bcryptjs')
const {verify} = require('jsonwebtoken')
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


//Changing only the password
router.patch('/:id',async(req,resp,next)=>{
   
   //Crypt the changed password
   const salt = await genSalt(12)
   const passwordHash = await hash(req.body.password,salt)

  //Update only the password
  try{  
         let data = await User.updateOne( { _id:req.params.id} , { $set: { password:passwordHash } })
         if(data) return resp.status(200).json('Updated')
 }catch(err){next(err)}

}) 



router.delete('/:id',async(req,resp,next)=>{
   const {id} = req.params
   try{
      await User.findByIdAndDelete(id)
      resp.status(200).json('User deleted!')
   }catch(err){
    next(new Error('No such user!'))
   }
})


module.exports = router

