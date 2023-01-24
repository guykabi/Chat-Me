const express = require('express') 
const router = express.Router() 
const Conversation = require('../models/conversationModel')
const {verify} = require('jsonwebtoken')


router.get('/:id',async(req,resp,next)=>{
  
const token = req?.headers?.['x-access-token']

if (!token) {
       return next(new Error('No Token Provided'))
   }
    verify(token, process.env.ACCESS_SECRET_TOKEN,async (err, data)  => {
    if(err) {
       return next(new Error('Failed to authenticate token'))
     }

   else{
        try{
           let allConversations =  await Conversation
           .find({participants:{$in:{_id:req.params.id}}})
           //Exclude password&friends
           .populate({path:'participants',select: '-password -friends -__v'})
   
           resp.status(200).json(allConversations)
         }catch(err){
            next(err)
         }
      }
   }) 
})


router.post('/',async(req,resp,next)=>{
   const newConversation = new Conversation(req.body)
   try{
      await newConversation.save()
      resp.status(200).json('New conversation')
   }catch(err){
      next(err)
   }
}) 


router.patch('/:id',async(req,resp,next)=>{
   const {id} = req.params 
   const {body} = req
   try{
      let updateConversation = await Conversation.findByIdAndUpdate(id,body,{new:true}) 
      resp.status(200).json({message:'Update',conversation:updateConversation})
   }catch(err){
      next(err)
   }
}) 

module.exports = router;