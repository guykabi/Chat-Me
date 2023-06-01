import {User} from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import {approveFriend} from '../utils/utils.js'
import {uploadToCloudinary,removeFromCloudinary} from '../services/cloudinary.js'
import {sendEmail} from '../services/email.js'
import { getPlaiceholder } from "plaiceholder";
const {hash,genSalt} = bcrypt


const excludeFields =
  "-password -friends -friendsWaitingList -notifications -mute -__v";

export const getAllUsers = async (req, resp, next) => {
  try {
    let users = await User.find({}).select(excludeFields).lean()
    return resp.status(200).json(users);
  } catch (err) {
    return next(err);
  }
};

export const getUser = async (req, resp, next) => {
  const { id } = req.params;

  try {
    let user = await User.findById(id)
      .select("-password -__v").lean()
      .populate({ path: "friends", select: excludeFields })
      .populate({ path: "friendsWaitingList", select: excludeFields })
      .populate({
        path: "notifications",
        select: excludeFields,
        populate: { path: "sender", select: excludeFields },
      })
     

    return resp.status(200).json(user);
  } catch (err) {
    return next(new Error("No such user!"));
  }
}; 


export const handleEmailSending =async (req,resp,next) =>{
  const {body} = req
  
   try{
      let user = await User.find({email:body.email}).lean()
      if(!user.length)return resp.status(200).json('Email does not exist')
      
      let emailResult = await sendEmail(user[0],body.url,next)
      return resp.status(200).json(emailResult) 

   }catch(error){
     next(error)
   }
}

export const addUser = async (req, resp, next) => {
  const newUser = new User(req.body);
  try {
    await newUser.save();
    resp.status(200).json("User added");
  } catch (err) {
    next(err);
  }
};



export const searchUser = async (req, resp, next) => {
  const body = req.body;

  try {
    //Search for any username - without case sensitivity
    let user = await User.find({
      _id:{$ne:body.userId},
      name: { $regex: `${body.userName}`, $options: "i" },
    }).select("-password -notifications -__v").lean()

    resp.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const friendShipRequest = async (req, resp, next) => {
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

export const friendApproval = async (req, resp, next) => {
  const { id } = req.params;
  const { friendId, message } = req.body;

  try {
    let isRequestExist = await User.find({
      _id: id,
      friendsWaitingList: friendId,
    });
    if (!isRequestExist.length)
      return resp.status(200).json("Request is not exsit");

    let result = await approveFriend(id, friendId, message, next);

    if (result.message === "The Friend approval has been done") {
      return resp.status(200).json(result);
    }
  } catch (err) {
    next(err);
  }
};

export const removeFriend = async (req, resp, next) => {
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
      .select("-password -friendsWaitingList -notifications -__v").lean()
      .populate({ path: "friends", select: excludeFields })
     

    return resp.status(200).json({ message: "Friend has been removed!", user });
  } catch (err) {
    next(err);
  }
};

export const unapproveFriend = async (req, resp, next) => {
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
      .select("-password -friends -__v")
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



export const resetPassword = async (req, resp, next) => {
  //Crypt the changed password
  const salt = await genSalt(12);
  const passwordHash = await hash(req.body.password, salt);
  
  try {
    let data = await User.updateOne(
      { _id: req.params.id },
      { $set: { password: passwordHash } } 
    ).select("-password");

    if (data) return resp.status(200).json("Password updated");
  } catch (err) {
    next(err);
  }
};


export const updateUser = async(req,resp,next) => {

  const {id} = req.params
  const body = req.body
  
try{

  if(req?.file){

    const file = await uploadToCloudinary(req.file,'user-images',next)
    const { base64 } = await getPlaiceholder(file.url);
    const newBody = {...body} 

    file.base64 = base64;
    newBody.image = file

    if (body.removeImage) {
      await removeFromCloudinary(body.removeImage);
    }
    
    let editUser = await User.findByIdAndUpdate(id,newBody,{new:true})
    .select('-friends -friendsWaitingList -notifications').lean()
    
    return resp.status(200).json({message:'Updated successfully',editUser}) 

  }
  
  let editUser = await User.findByIdAndUpdate(id,body,{new:true})
  .select('-friends -friendsWaitingList -notifications').lean()
  
  resp.status(200).json({message:'Updated successfully',editUser})

}catch(error){
  next(error)
 }
}


export const muteChats = async(req, resp, next) =>{
  const {id} = req.params
  const {mute} = req.body

     try{
      
        let isMuted = await User.find({_id:id, mute: { $in: [mute] }})
        if(isMuted.length){
          let user = await User.findByIdAndUpdate(id,{$pull:{mute}},{new:true})
          .select('-friends -friendsWaitingList -notifications').lean()
        
          return resp.status(200).json({user,mute:false})
        } 

        let user = await User.findByIdAndUpdate(id,{$push:{mute}},{new:true})
        .select('-friends -friendsWaitingList -notifications').lean()

        return resp.status(200).json({user,mute:true})

     }catch(err){
      next(err)
     }
}


export const deleteUser = async (req, resp, next) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    resp.status(200).json("User deleted!");
  } catch (err) {
    next(new Error("No such user!"));
  }
};

