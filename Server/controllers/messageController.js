import { Message } from "../models/messagesModel.js";
import { Conversation } from "../models/conversationModel.js";
import {
  uploadToCloudinary,
  removeFromCloudinary,
} from "../services/cloudinary.js";
import { getPlaiceholder } from "plaiceholder";
import {formatISO} from 'date-fns'

const excludeFields =
  "-media -lastActive -__v";

export const getMessagesByConId = async (req, resp, next) => {
  const { conversation } = req.params;
  
  const joiningDate = req.headers["joining-date"]
  const skip = req.headers["skip"]
  const limit = req.headers["limit"]
 
  try {
    const messages = await Message.find({ 
          conversation , 
          createdAt:{$gte: formatISO(new Date(joiningDate))} 
       })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select("-__v");
     
    resp.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};



export const addNewMessage = async (req, resp, next) => {
  
  let newMessage = null;
  const { body } = req;
  let fileType = req?.file?.mimetype.includes('video')
  
  try {
    if (req?.file?.path) {
      const folder = fileType?'chat-videos':'chat-images'
      const data = await uploadToCloudinary(req.file, folder,next);
      
      if(!fileType){
        const { base64 } = await getPlaiceholder(data.url);
        data.base64 = base64;
      } 
      const newBody = { ...body };
      newBody.image = data;

      newMessage = new Message(newBody);
    } else {
      newMessage = new Message(body);
    }

    await newMessage.save();

    let savedMessage = await newMessage.populate({
      path: "conversation",
      select: excludeFields,
    });

    if (savedMessage?.image?.url) {
    
      //Updating last time conversation was active + add to the conversation's media
      await Conversation.updateOne(
        { _id: newMessage.conversation }, {
        $set: { lastActive: new Date() },
        $push: { media: savedMessage._id },
      });
      return resp
        .status(200)
        .json({ message: "New message just added", data: savedMessage });
    }

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


export const forwardMessage = async (req, resp, next) => {
  const {body} = req
  let fileType = body?.message?.file?.includes('mp4')
  const folder = fileType?'chat-videos':'chat-images'
  
  try{
    let allForwardMessages = []
    await Promise.all(body.receivers.slice(0,4).map(async (conversation)=>{

      let newMessage = new Message(body.message);
      newMessage.conversation = conversation
        
       //Stores each message's file to cloudinary
       if(body?.message?.file){
        const file = await uploadToCloudinary(body.message.file,folder,next);
        if(!fileType){
          //Only image gets base64 - blure placeholder
          const { base64 } = await getPlaiceholder(file.url);
          file.base64 = base64;
        } 
        newMessage.image = file
       }

       await newMessage.save();
       
       let savedMessage = await newMessage.populate({
        path: "conversation",select: excludeFields});
       
       if(body?.message?.file){
          //Adding to chat media
          await Conversation.updateOne({_id:conversation}, {
            $set: { lastActive: new Date() },
            $push: { media: savedMessage._id },
          });
       }else{
          await Conversation.updateOne({_id:conversation}, {
            $set: { lastActive: new Date() }
          });
        }

      allForwardMessages.push(savedMessage)
    }))
      
    resp.status(200).json({
      message:'Forward message succeeded',
      data: allForwardMessages,
      receivers:body.receivers})
    
  }catch(err){
    next(err)
  }
}

export const likeMessage = async (req, resp, next) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    let isLiked = await Message.find({ _id: id, likes: userId });

    if (isLiked.length) {
      let unLikedMessage = await Message.findByIdAndUpdate(
        { _id: id },
        { $pull: { likes: userId } },
        { new: true }
      ).populate({
        path: "conversation",
        select: "participants",
      });

      return resp
        .status(200)
        .json({ message: "Like removed", editMsg: unLikedMessage });
    }

    let likedMessage = await Message.findByIdAndUpdate(
      { _id: id },
      { $addToSet: { likes: userId } },
      { new: true }
    ).populate({
      path: "conversation",
      select: "_id",
    });

    resp.status(200).json({ message: "Like has done", editMsg: likedMessage });
  } catch (err) {
    next(err);
  }
};

export const handleSeenMessage = async (req, resp, next) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await Message.findOneAndUpdate(
      { _id: id, "seen.user": { $ne: userId } },
      { $push: { seen: { user: userId } } }
    );
    return resp.status(200).json("Handled unseen message!");
  } catch (err) {
    next(err);
  }
};

export const deleteMessage = async (req, resp, next) => {
  const { id } = req.params;
  try {
    let deleted = await Message.findByIdAndDelete(id).populate({
      path: "conversation",
      select: "_id",
    });
    
    if (deleted?.image?.url) {
        //Removing file from the chat media + cloudinary
        await Conversation.findByIdAndUpdate({_id:deleted.conversation._id},{
        $pull:{media:deleted._id}
      })
      await removeFromCloudinary(deleted.image.cloudinary_id);
    }

    resp.status(200).json({ message: "Deleted", deleted });
  } catch (err) {
    next(err);
  }
};
