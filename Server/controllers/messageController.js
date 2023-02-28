const {Message} =require('../models/messagesModel') 
const Conversation = require('../models/conversationModel')


const getMessageByConId = async(req,resp,next)=>{
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
}


const addNewMessage = async(req,resp,next)=>{
    const newMessage = new Message(req.body)
    
    try{
      let savedMessage = await newMessage.save()
      //Updating last time conversation was active
      await Conversation
      .updateOne(
      { _id:newMessage.conversationId},
      { $set: { lastActive:new Date() } },{new:true})

      resp.status(200).json({message:'New message just added',data:savedMessage})
      
   }catch(err){
    next(err)
   }
}


const handleSeenMessage =  async(req,resp,next)=>{
  const {id} = req.params 
  try{
     if(req.body.reason){
        await Message.updateMany({conversationId:id,"seen": false}, {"$set":{"seen": true}})
        return resp.status(200).json('Handled all unseen messages!')
      }
        await Message.findOneAndUpdate({_id:id},{seen:true})
        return resp.status(200).json('Handled unseen message!')

   }catch(err){
      next(err)
   }
 }



module.exports = {getMessageByConId,addNewMessage,handleSeenMessage}
