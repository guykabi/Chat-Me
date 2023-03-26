const { Conversation } = require("../models/conversationModel");
const { Message } = require("../models/messagesModel");
const {
  uploadToCloudinary,
  removeFromCloudinary,} = require("../services/cloudinary");
const excludeFields =
  "-password -friends -friendsWaitingList -notifications -__v";

const getAllConversations = async (req, resp, next) => {
  const { id } = req.params;
  try {
    let allConversations = await Conversation.find({
      participants: { $in: { _id: id } },
    })
      .sort({ lastActive: -1 })
      .populate({ path: "participants", select: excludeFields })
      .populate({ path: "manager", select: excludeFields });

    let all = await Promise.all(
      allConversations.map(async (con) => {
        let newCon = { ...con._doc };
        let temp = await Message.count({
          conversation: con._id,
          sender: { $ne: id },
          "seen.user": { $ne: id },
        });
        newCon.unSeen = temp;
        return newCon;
      })
    );

    return resp.status(200).json(all);
  } catch (err) {
    next(err);
  }
};

const addNewConversation = async (req, resp, next) => {
  const { participants } = req.body;
  const newConversation = new Conversation(req.body);

  try {
    let isAlreadyConversation;

    //Only non group chats are not allowed to duplicate
    if (!req.body?.chatName) {
      isAlreadyConversation = await Conversation.find({
        participants: { $all: participants },
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

    resp.status(200).json({ message: "New conversation made", conversation });
  } catch (err) {
    next(err);
  }
};

const updateConversation = async (req, resp, next) => {
  const { id } = req.params;
  const { body } = req;

  try {
    if (req?.file?.path) {
      const data = await uploadToCloudinary(req.file.path, "group-images");
  
      const newBody = {...body}
      newBody.chatName = body.chatName
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
        .populate({ path: "participants", select: excludeFields });
       
        return resp
        .status(200)
        .json({ message: "Update", conversation: editConversation });
    }

    let editConversation = await Conversation.findByIdAndUpdate(
      id,
      { chatName: body.chatName },
      { new: true }
    )
      .populate({ path: "manager", select: excludeFields })
      .populate({ path: "participants", select: excludeFields });

      resp
      .status(200)
      .json({ message: "Update", conversation: editConversation });

  } catch (err) {
    next(err);
  }
};



const addManager = async (req, resp, next) => {
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

const removeManager = async (req, resp, next) => {
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

const addMember = async (req, resp, next) => {
  const { conId } = req.params;
  const { participants } = req.body;

  try {
    let updateConversation = await Conversation.findByIdAndUpdate(
      conId,
      { $push: { participants } },
      { new: true }
    )
      .populate({ path: "manager", select: excludeFields })
      .populate({ path: "participants", select: excludeFields });

    return resp
      .status(200)
      .json({ message: "Member added", conversation: updateConversation });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, resp, next) => {
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

const deleteConversation = async (req, resp, next) => {
  const { id } = req.params;
  try {
    let isDeleted = await Conversation.findByIdAndDelete(id);
    if (isDeleted) {
      await Message.deleteMany({ conversation: id });
    }
    resp.status(200).json("Conversation deleted!");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllConversations,
  addNewConversation,
  updateConversation,
  addMember,
  removeMember,
  addManager,
  removeManager,
  deleteConversation,
};
