const { User } = require("../models/messagesModel");
const { hash, genSalt } = require("bcryptjs");
const { approveFriend } = require("../utils/utils");
const {uploadToCloudinary,removeFromCloudinary} = require('../services/cloudinary')


const excludeFields =
  "-password -friends -friendsWaitingList -notifications -__v";

const getAllUsers = async (req, resp, next) => {
  try {
    let users = await User.find({}).select(excludeFields);
    return resp.status(200).json(users);
  } catch (err) {
    return next(err);
  }
};

const getUser = async (req, resp, next) => {
  const { id } = req.params;

  try {
    let user = await User.findById(id)
      .select("-password")
      .populate({ path: "friends", select: excludeFields })
      .populate({ path: "friendsWaitingList", select: excludeFields })
      .populate({
        path: "notifications",
        select: excludeFields,
        populate: { path: "sender", select: excludeFields },
      });

    return resp.status(200).json(user);
  } catch (err) {
    return next(new Error("No such user!"));
  }
};

const addUser = async (req, resp, next) => {
  const newUser = new User(req.body);
  try {
    await newUser.save();
    resp.status(200).json("User added");
  } catch (err) {
    next(err);
  }
};



const searchUser = async (req, resp, next) => {
  const body = req.body;

  try {
    //Search for any username - without case sensitivity
    let user = await User.find({
      name: { $regex: `${body.userName}`, $options: "i" },
    }).select("-password -notifications -__v");

    resp.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const friendShipRequest = async (req, resp, next) => {
  const { id } = req.params;
  const { friendId, message } = req.body;
  let pull = {
    $pull: { friendsWaitingList: id, notifications: { sender: id } },
  };

  try {
    let isAlreadyRequest = await User.find({
      _id: friendId,
      friendsWaitingList: id,
    });
    if (isAlreadyRequest.length) {
      //Removing the request + notification of the other person
      await User.findOneAndUpdate({ _id: friendId }, pull);
      return resp.status(200).json("Request has been removed!");
    }

    //Insert to the friend's waitinglist + to notifications list
    let notifyObj = { sender: id, message, seen: false };

    await User.findOneAndUpdate(
      { _id: friendId },
      { $push: { friendsWaitingList: id, notifications: notifyObj } }
    );

    return resp.status(200).json("Request has been made!");
  } catch (err) {
    next(err);
  }
};

const friendApproval = async (req, resp, next) => {
  const { id } = req.params;
  const { friendId, message } = req.body;

  try {
    let isRequestExsit = await User.find({
      _id: id,
      friendsWaitingList: friendId,
    });
    if (!isRequestExsit.length)
      return resp.status(200).json("Request is not exsit");

    let result = await approveFriend(id, friendId, message, next);

    if (result.message === "The Friend approval has been done") {
      return resp.status(200).json(result);
    }
  } catch (err) {
    next(err);
  }
};

const removeFriend = async (req, resp, next) => {
  const { id } = req.params;
  const { friendId } = req.body;

  try {
    let isAlreadyFriend = await User.find({ _id: id, friends: friendId });
    if (!isAlreadyFriend.length)
      return resp.status(200).json("Cannot remove non existing friend");

    let user = await User.findOneAndUpdate(
      { _id: id },
      { $pull: { friends: friendId } },
      { new: true }
    )
      .select("-password -__v")
      .populate({ path: "friends", select: excludeFields })
      .populate({ path: "friendsWaitingList", select: excludeFields })
      .populate({
        path: "notifications",
        select: excludeFields,
        populate: { path: "sender", select: excludeFields },
      });

    return resp.status(200).json({ message: "Friend has been removed!", user });
  } catch (err) {
    next(err);
  }
};

const unapproveFriend = async (req, resp, next) => {
  const { id } = req.params;
  const { friendId } = req.body;
  let pull = {
    $pull: {
      friendsWaitingList: friendId,
      notifications: { sender: friendId },
    },
  };

  try {
    let user = await User.findOneAndUpdate({ _id: id }, pull, { new: true })
      .select("-password -__v")
      .populate({ path: "friends", select: excludeFields })
      .populate({ path: "friendsWaitingList", select: excludeFields })
      .populate({
        path: "notifications",
        select: excludeFields,
        populate: { path: "sender", select: excludeFields },
      });

    return resp
      .status(200)
      .json({ message: "Request has been decline!", user });
  } catch (err) {
    next(err);
  }
};

const handleSeenNotification = async (req, resp, next) => {
  const { id } = req.params;

  let update = { $set: { "notifications.$[elem].seen": true } };
  let pull = {
    $pull: { notifications: { message: { $in: ["Friend approval"] } } },
  };
  let filterSet = { arrayFilters: [{ "elem.seen": false }], multi: true };

  try {
    //Set all unseen friend-requests notifications to seen/true
    await User.updateOne({ _id: id }, update, filterSet);

    //Removing all friends approval-requests notifications
    let user = await User.findByIdAndUpdate({ _id: id }, pull, {
      multi: true,
      new: true,
    })
      .select("-password")
      .populate({ path: "friends", select: excludeFields })
      .populate({ path: "friendsWaitingList", select: excludeFields })
      .populate({
        path: "notifications",
        select: excludeFields,
        populate: { path: "sender", select: excludeFields },
      });

    return resp.status(200).json({ message: "Notification has seen", user });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, resp, next) => {
  //Crypt the changed password
  const salt = await genSalt(12);
  const passwordHash = await hash(req.body.password, salt);

  try {
    let data = await User.updateOne(
      { _id: req.params.id },
      { $set: { password: passwordHash } } 
    ).select("-password");

    if (data) return resp.status(200).json("Updated");
  } catch (err) {
    next(err);
  }
};


const updateUser = async(req,resp,next) => {
  const {id} = req.params
  const body = req.body
  
try{

  if(req?.file?.path){
    const data = await uploadToCloudinary(req.file.path,'user-images')
    const newBody = {...body} 
    newBody.image = data

    if (body.removeImage) {
      await removeFromCloudinary(body.removeImage);
    }
    
    let editUser = await User.findByIdAndUpdate(id,newBody,{new:true})
    resp.status(200).json({message:'Updated successfully',editUser}) 

  }
  
  const result = await User.findByIdAndUpdate(id,body,{new:true})
  resp.status(200).json('Updated successfully')

}catch(error){
  next(error)
 }
}


const deleteUser = async (req, resp, next) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    resp.status(200).json("User deleted!");
  } catch (err) {
    next(new Error("No such user!"));
  }
};

module.exports = {
  getAllUsers,
  getUser,
  searchUser,
  addUser,
  updateUser,
  friendShipRequest,
  friendApproval,
  removeFriend,
  unapproveFriend,
  resetPassword,
  deleteUser,
  handleSeenNotification,
};
