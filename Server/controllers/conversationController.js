import {Conversation} from '../models/conversationModel.js'
import {Message} from '../models/messagesModel.js'
import {uploadToCloudinary,removeFromCloudinary} from '../services/cloudinary.js'
import {getPlaiceholder} from 'plaiceholder'

const excludeFields =
  "-password -friends -friendsWaitingList -notifications -__v";


  export const getSingleConversation =async (req,resp,next) =>{
    const {conId} = req.params
    const userId = req.headers.userid
    const partialDetails = req.headers?.partialdetails
    
     try{
       let conversation = await Conversation.findById(conId)
       .populate({ path: "participants",select: excludeFields })
       .populate({ path: "manager", select: `${excludeFields} -image` })
      
        let newCon = {...conversation._doc}
        
        let count = await Message.count({
          conversation: conversation._id,
          sender: { $ne: userId },"seen.user": { $ne: userId }
        })
        if(!newCon.chatName) newCon.friend = newCon.participants.find(f=> f._id != userId)
        newCon.unSeen = count
        
        
        if(partialDetails !== undefined){
          delete newCon.media
          return resp.status(200).json({conversation:newCon})
        }
     
        await conversation.populate({ path: "media", select:'-likes -seen'});
           
        //Adding joints groups field (to privates chats only!)
        if(!newCon.chatName){
          let jointGroups = await Conversation.find({
              chatName:{$exists:true},
              participants: { $all: [userId,newCon.friend._id] }
              })
              .select('_id chatName image')
              newCon.jointGroups = jointGroups
          }
          
          resp.status(200).json({conversation:newCon})
     }catch(err){
      next(err)
    }
  }

  export const getAllConversations = async (req, resp, next) => {
  const { id } = req.params;
 
  try {
    const allConversations = await Conversation.find({
      participants: { $in: { _id: id } }
    })
    .sort({ lastActive: -1 }).select('-manager -media')
    .populate({ path: 'participants',select: excludeFields})
     
      //Counts unseen messages of each conversation
      let all = await Promise.all(
      allConversations.map(async (con) => {
        let newCon = { ...con._doc };

        let count = await Message.count({
        conversation: con._id,sender: { $ne: id },"seen.user": { $ne: id }});

        if(con.chatName) delete newCon.participants
        newCon.unSeen = count;
        return newCon;
      })
    );

    return resp.status(200).json(all);
  } catch (err) {
    next(err);
  }
};

export const addNewConversation = async (req, resp, next) => {
  const { participants } = req.body;
  let newCon = {...req.body}
  newCon.participants = participants[0]
  const newConversation = new Conversation(newCon);
  
  try {
    let isAlreadyConversation;

    //Only non group chats are not allowed to duplicate
    if (!req.body?.chatName) {     
      isAlreadyConversation = await Conversation.find({
        $or:[{
         chatName:{$exists:false},
         participants: { $all: participants }
        }]
      });
    } 
    

    if (isAlreadyConversation?.length)
      return resp.status(200).json("Conversation already exist");

      let newAddedCon = await newConversation.save();

      let conversation = await Conversation.findById(
        newAddedCon._doc._id.toString()
      )
        .populate({ path: "manager", select: excludeFields })
        .populate({ path: "participants", select: excludeFields });

    return resp.status(200).json({ message: "New conversation made", conversation });
  } catch (err) {
    next(err);
  }
};

export const updateConversation = async (req, resp, next) => {
  const { id } = req.params;
  const { body } = req;

  try {
    if (req?.file?.path) {
      const data = await uploadToCloudinary(req.file, "group-images",next);
      const {base64} = await getPlaiceholder(data.url)
      
      const newBody = {...body}
      if(body?.chatName)newBody.chatName = body.chatName
      data.base64 = base64
      newBody.image = data

      if (body.removeImage) {
        await removeFromCloudinary(body.removeImage);
      }
      
      let editConversation = await Conversation.findByIdAndUpdate(
        id,
        newBody,
        { new: true }
      )
        .populate({ path: "manager", select: excludeFields })
        .populate({ path: "participants", select: excludeFields })
        .populate({ path: "media", select:'-likes -seen'});
       
        return resp
        .status(200)
        .json({ message: "Update", conversation: editConversation });
    }

    let editConversation = await Conversation.findByIdAndUpdate(
      id,
      body,
      { new: true }
    )
      .populate({ path: "manager", select: excludeFields })
      .populate({ path: "participants", select: excludeFields })
      .populate({ path: "media", select:'-likes -seen'});

      resp
      .status(200)
      .json({ message: "Update", conversation: editConversation });

  } catch (err) {
    next(err);
  }
};



export const addManager = async (req, resp, next) => {
  const { conId } = req.params;
  const { manager } = req.body;

  try {
    let updateConversation = await Conversation.findByIdAndUpdate(
      conId,
      { $push: { manager } },
      { new: true }
    )
      .populate({ path: "manager", select: excludeFields })
      .populate({ path: "participants", select: excludeFields });

    return resp
      .status(200)
      .json({ message: "Manager added", conversation: updateConversation });
  } catch (err) {
    next(err);
  }
};

export const removeManager = async (req, resp, next) => {
  const { conId } = req.params;
  const { manager } = req.body;

  try {
    let updateConversation = await Conversation.findByIdAndUpdate(
      conId,
      { $pull: { manager } },
      { new: true }
    )
      .populate({ path: "manager", select: excludeFields })
      .populate({ path: "participants", select: excludeFields });

    return resp
      .status(200)
      .json({ message: "Manager removed", conversation: updateConversation });
  } catch (err) {
    next(err);
  }
};

export const addMember = async (req, resp, next) => {
  const { conId } = req.params;
  const { participants } = req.body;
  
  try {
    await Conversation.findByIdAndUpdate(conId,{$push: { participants }}) 

    let updateConversation = await Conversation.findByIdAndUpdate(
      conId,{$pull: { participants: null}},{new:true})
      .populate({ path: "manager", select: excludeFields })
      .populate({ path: "participants", select: excludeFields });

    return resp
      .status(200)
      .json({ message: "Member added", conversation: updateConversation });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, resp, next) => {
  const { conId } = req.params;
  const { participants } = req.body;

  try {
    let updateConversation = await Conversation.findByIdAndUpdate(
      { _id: conId },
      { $pull: { participants, manager: participants } },
      { new: true }
    )
      .populate({ path: "manager", select: excludeFields })
      .populate({ path: "participants", select: excludeFields });

    return resp
      .status(200)
      .json({ message: "Member removed", conversation: updateConversation });
  } catch (err) {
    next(err);
  }
};

export const deleteConversation = async (req, resp, next) => {
  const { id } = req.params;
  try {
    let isDeleted = await Conversation.findByIdAndDelete(id);
    if (isDeleted) {
      await Message.deleteMany({ conversation: id });
    }
    resp.status(200).json({message:"Conversation deleted!",conId:id});
  } catch (err) {
    next(err);
  }
};



