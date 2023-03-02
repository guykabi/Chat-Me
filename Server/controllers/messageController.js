const {Message} =require('../models/messagesModel') 
const {Conversation} = require('../models/conversationModel')


const getMessageByConId = async(req,resp,next)=>{
    const {conversation} = req.params
    
    //The amount of documents to skip
    const amount = req.headers['load-more']

    try{
      let messages = await Message.find({conversation})
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
       await newMessage.save()

       let savedMessage = await newMessage
       .populate({path:'conversation',select:'-media -__v'})
         
      //Updating last time conversation was active
      await Conversation
      .updateOne(
      { _id:newMessage.conversation},
      { $set: { lastActive:new Date() } })

      resp.status(200).json({message:'New message just added',data:savedMessage})
      
   }catch(err){
    next(err)
   }
}


const handleSeenMessage =  async(req,resp,next)=>{
  const {id} = req.params 
  try{
     if(req.body.reason){
        await Message.updateMany({conversation:id,"seen": false}, {"$set":{"seen": true}})
        return resp.status(200).json('Handled all unseen messages!')
      }
        await Message.findOneAndUpdate({_id:id},{seen:true})
        return resp.status(200).json('Handled unseen message!')

   }catch(err){
      next(err)
   }
 }



module.exports = {getMessageByConId,addNewMessage,handleSeenMessage}
