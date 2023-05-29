import {Conversation} from '../models/conversationModel.js'
import {Message} from '../models/messagesModel.js'
import {uploadToCloudinary,removeFromCloudinary} from '../services/cloudinary.js'
import {getPlaiceholder} from 'plaiceholder'
import {formatISO} from 'date-fns'


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

        //Counts unseen message only from after the date user joined the group
        let fromDate = newCon?.joining.find(j=>j.user === userId)?.createdAt
        
        let count = await Message.count({
          conversation: conversation._id,
          sender: { $ne: userId },
          createdAt:{$gte: formatISO(new Date(fromDate))},
          "seen.user": { $ne: userId }
        })

        if(!newCon.chatName) newCon.friend = newCon.participants.find(f=> f._id != userId)
        newCon.unSeen = count
        
        if(partialDetails !== undefined){
          delete newCon.media
          return resp.status(200).json({conversation:newCon})
        }
     
        await conversation
                .populate({ 
                 path: "media",
                 match:{ createdAt: { $gte: fromDate }},
                 select:'-likes -seen'});
           
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
    .sort({ lastActive: -1 })
    .select('-manager -media')
    .populate({ path: 'participants',select: excludeFields})
     
      let all = await Promise.all(
      allConversations.map(async (con) => {
        
        let newCon = { ...con._doc };

        //Counts unseen message only from after the date user joined the group
        let fromDate = newCon?.joining.find(j=>j.user === id)?.createdAt
        
        let count = await Message.count({
         conversation: con._id,
         createdAt:{$gte: formatISO(new Date(fromDate))},
         sender: { $ne: id },
         "seen.user": { $ne: id }});
        
        //Removing participants of group - unnecessary for the beginning
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
  let conversation;
  
  if(req.body?.chatName){
    let joiningsDates = participants.map(p=> { return {user:p} })
    req.body.joining = joiningsDates
  } 
  
  try {

    //Only non group chats are not allowed to duplicate
    if (!req.body?.chatName) {    

       let isAlreadyConversation = await Conversation.find({
        $or:[{
         chatName:{$exists:false},
         participants: { $all: participants }
        }] });

       if (isAlreadyConversation?.length)
         return resp.status(200).json("Conversation already exist");

         let newCon = {...req.body}
         newCon.participants = participants[0]
         newCon.joining = [{user:participants[0]}]
         conversation = await new Conversation(newCon).save()

         await conversation.populate({ path: "participants", select: excludeFields });
        
         return resp.status(200).json({ message: "New conversation made", conversation })
        
      }
    
      conversation = await new Conversation(req.body).save();

      let addedConversation = await Conversation.findById(
        conversation._doc._id.toString()
      )
      .populate({ path: "manager", select: excludeFields })
      .populate({ path: "participants", select: excludeFields });

      return resp.status(200).json({ 
            message: "New conversation made", 
            conversation:addedConversation 
            });
      
  } catch (err) {
    next(err);
  }
};

export const updateConversation = async (req, resp, next) => {
  
  const { id } = req.params;
  const { body } = req;
  let editConversation;

  try {

    if (req?.file) {
      const file = await uploadToCloudinary(req.file, "group-images",next);
      const {base64} = await getPlaiceholder(file.url)
      
      const newBody = {...body}
      if(body?.chatName)newBody.chatName = body.chatName
      file.base64 = base64
      newBody.image = file

      if (body.removeImage) {
        await removeFromCloudinary(body.removeImage);
      }
      
      editConversation = await Conversation.findByIdAndUpdate(
        id, newBody,{ new: true }
      )
        .populate({ path: "manager", select: excludeFields })
        .populate({ path: "participants", select: excludeFields })
        .populate({ path: "media", select:'-likes -seen'});

        return resp
        .status(200)
        .json({ message: "Update", conversation: editConversation });
    }

     editConversation = await Conversation.findByIdAndUpdate(
      id,body,{ new: true }
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
  const { participant } = req.body;
  
  try {
    await Conversation.findByIdAndUpdate(conId,
             {$push: 
             { 
              participants:participant,
              joining:{user:participant}
             }}) 

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
  const { participant } = req.body;
 
  try {

    let updateConversation = await Conversation.findByIdAndUpdate(
      { _id: conId },
      { $pull: { 
         participants:participant, 
         manager: participant, 
         joining: {user : participant} 
        } },
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



