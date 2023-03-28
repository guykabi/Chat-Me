const { Message } = require("../models/messagesModel");
const { Conversation } = require("../models/conversationModel");
const {uploadToCloudinary} = require("../services/cloudinary");
const {getPlaiceholder} = require('plaiceholder')

const excludeFields =
  "-password -friends -friendsWaitingList -notifications -__v";

const getMessageByConId = async (req, resp, next) => {
  const { conversation } = req.params;

  //The amount of documents to skip
  const amount = req.headers["load-more"];

  try {
    const messages = await Message.find({ conversation })
      .sort({ createdAt: -1 })
      .limit(30)
      .skip(amount)
      .select("-__v")
      .populate({ path: "seen", select: excludeFields })

    resp.status(200).json(messages);

  } catch (err) {
    next(err);
  }
};


const addNewMessage = async (req, resp, next) => {
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
      select: "-media -__v",
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

const handleSeenMessage = async (req, resp, next) => {
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

module.exports = { getMessageByConId, addNewMessage, handleSeenMessage };
