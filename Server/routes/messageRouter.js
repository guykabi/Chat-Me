const express = require('express') 
const router = express.Router() 
const {Message} =require('../models/messagesModel') 


router.get('/:conversationId',async(req,resp,next)=>{
    const {conversationId} = req.params
    try{
      let messages = await Message.find({conversationId}).populate('sender')
      resp.status(200).json(messages)
    }catch(err){
        next(err)
    }
})  


router.post('/',async(req,resp,next)=>{
    const newMessage = new Message(req.body)
   try{
      await newMessage.save()
      resp.status(200).json('New message just added')
   }catch(err){
    next(err)
   }
})  



module.exports = router;
