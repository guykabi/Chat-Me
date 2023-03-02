const {Conversation} = require('../models/conversationModel')
const {Message} = require('../models/messagesModel')
const excludeFields = '-password -friends -friendsWaitingList -notifications -__v'


const getAllConversations = async(req,resp,next)=>{
       
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
}


const addNewConversation = async(req,resp,next)=>{
   const {body} = req
   const newConversation = new Conversation(body)
   
   try{ 

      let isAlreadyConversation = await Conversation.find({participants:body.participants})
      if(isAlreadyConversation.length) return resp.status(200).json('Conversation already exist')

      await newConversation.save()
      
      let conversation = await newConversation
      .populate({path:'participants',select:excludeFields})

      resp.status(200).json({message:'New conversation made',conversation})
   }catch(err){
      next(err)
   }
}


//Mostly for group chats
const updateConversation = async(req,resp,next)=>{
   const {id} = req.params 
   const {body} = req
   try{
      let updateConversation = await Conversation.findByIdAndUpdate(id,body,{new:true}) 
      resp.status(200).json({message:'Update',conversation:updateConversation})
   }catch(err){
      next(err)
   }
}


const deleteConversation = async(req,resp,next) =>{
   const {id} = req.params
    try{
      let isDeleted = await Conversation.findByIdAndDelete(id)
      if(isDeleted){
         await Message.deleteMany({conversation:id})
      }
       resp.status(200).json('Conversation deleted!')
    }catch(err){
     next(err)
    }
}

module.exports = {getAllConversations,addNewConversation,
                  updateConversation,deleteConversation }