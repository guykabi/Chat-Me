const express = require('express') 
const router = express.Router() 
const {Message} =require('../models/messagesModel') 
const Conversation = require('../models/conversationModel')
const {Auth} = require('../middleware/auth')



router.get('/:conversationId',Auth,async(req,resp,next)=>{
    const {conversationId} = req.params
    
    //The amount of documents to skip
    const amount = req.headers['load-more']

    try{
      let messages = await Message.find({conversationId})
      .sort({createdAt:-1})
      .limit(30)
      .skip(amount)
      .select('-__v')

      resp.status(200).json(messages)
     
    }catch(err){
        next(err)
    }
})  


router.post('/',async(req,resp,next)=>{
    const newMessage = new Message(req.body)
    
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
