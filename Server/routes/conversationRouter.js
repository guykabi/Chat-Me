const express = require('express') 
const router = express.Router() 
const Conversation = require('../models/conversationModel')
const {Auth} = require('../middleware/auth')
const excludeFields = '-password -friends -friendsWaitingList -notifications -__v'


router.get('/:id',Auth,async(req,resp,next)=>{
        
        try{
           let allConversations =  await Conversation
           .find({participants:{$in:{_id:req.params.id}}})
           .sort({lastActive:-1})
           //Exclude password&friends
           .populate({path:'participants',select:excludeFields})
   
           return resp.status(200).json(allConversations)
         }catch(err){
            next(err)
         }
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