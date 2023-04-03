import {Message} from '../models/messagesModel.js'
import {Conversation} from '../models/conversationModel.js'
import {uploadToCloudinary,removeFromCloudinary} from '../services/cloudinary.js'
import {getPlaiceholder} from 'plaiceholder'


export const getMessageByConId = async (req, resp, next) => {
  const { conversation } = req.params;

  //The amount of documents to skip
  const amount = req.headers["load-more"];

  try {
    const messages = await Message.find({ conversation })
      .sort({ createdAt: -1 })
      .limit(30)
      .skip(amount)
      .select("-__v")
    
    //console.log(messages);
    resp.status(200).json(messages);

  } catch (err) {
    next(err);
  }
};


export const addNewMessage = async (req, resp, next) => {
  let newMessage = null
  const {body} = req

  try {

    if(req?.file?.path){
       const data = await uploadToCloudinary(req.file.path, "chat-images");
       const {base64} = await getPlaiceholder(data.url)
       const newBody = {...body}
       
       data.base64 = base64
       newBody.image = data
       
       newMessage = new Message(newBody)

    }
    else{
      newMessage = new Message(body);
    }
       
    await newMessage.save(); 
   
    let savedMessage = await newMessage.populate({
      path: "conversation",
      select: "participants",
    });

    //Updating last time conversation was active
    await Conversation.updateOne(
      { _id: newMessage.conversation },
      { $set: { lastActive: new Date() } }
    );

    resp
    .status(200)
    .json({ message: "New message just added", data: savedMessage });

  } catch (err) {
    next(err);
  }
};


export const likeMessage = async (req, resp, next) =>{
  const {id} = req.params 
  const {userId} = req.body
  
  try{
      let isLiked = await Message.find({_id:id,likes:userId})
      
      if(isLiked.length){
          let unLikedMessage = await Message.findByIdAndUpdate(
          { _id:id},
          { $pull: { likes: userId } },{new:true}).populate({
            path: "conversation",
            select: "participants",
          }) 
          
          return resp.status(200).json({message:'Like removed',editMsg:unLikedMessage})
      }

      let likedMessage = await Message.findByIdAndUpdate(
      { _id:id},
      { $addToSet: { likes: userId } },{new:true}).populate({
        path: "conversation",
        select: "_id",
      })

      resp.status(200).json({message:'Like has done',editMsg:likedMessage})

  }catch(err){
   next(err)
 }
}



export const handleSeenMessage = async (req, resp, next) => {
  const { id } = req.params;
  const { userId } = req.body;

  try { 

    await Message.findOneAndUpdate(
      { _id: id , 'seen.user':{$ne:userId}},
      { $push: { 'seen': {user:userId} }}
    );
    return resp.status(200).json("Handled unseen message!");
  } catch (err) {
    next(err);
  }
};


export const deleteMessage = async (req, resp, next) =>{
  const {id} = req.params
  try{
        let deleted = await Message.findByIdAndDelete(id).populate({
        path: "conversation",
        select: "_id",
       })

       if(deleted?.image?.url){
        await removeFromCloudinary(deleted.image.cloudinary_id)
       }

     resp.status(200).json({message:'Deleted',deleted})
     
  }catch(err){
   next(err)
 }
}

