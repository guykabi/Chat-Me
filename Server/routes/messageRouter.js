const express = require('express') 
const router = express.Router() 
const {Message} =require('../models/messagesModel') 
const Conversation = require('../models/conversationModel')



router.get('/:conversationId',async(req,resp,next)=>{
    const {conversationId} = req.params
    try{
      let messages = await Message.find({conversationId})
      .select('-__v')
      //.populate({path:'sender',select: '-password -friends -__v'})

      resp.status(200).json(messages)
     
    }catch(err){
        next(err)
    }
})  


router.post('/',async(req,resp,next)=>{
    const newMessage = new Message(req.body)
    //Set seen as false automatically??
   try{
      await newMessage.save()
      await Conversation
      .updateOne(
      { _id:newMessage.conversationId},
      { $set: { lastActive:new Date() } })

      resp.status(200).json('New message just added')
      
   }catch(err){
    next(err)
   }
})  



module.exports = router;
