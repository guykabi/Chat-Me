import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {Message} from '../models/messagesModel.js'
import { User } from "../models/userModel.js";
const { compare } = bcrypt;
const { sign } = jwt;
import {formatISO} from 'date-fns'


const excludeFields =
  "-password -friends -friendsWaitingList -notifications -mute -__v";

export const generateInitialToken = async (data, password) => {
  if (password) {
    //Compares the password that the client typed with the encryped one on the DB
    const isMatch = await compare(password, data.password);
    if (!isMatch) return { invalidPassword: "Invalid password" };
  }

  const accessToken = sign({ id: data._id }, process.env.ACCESS_SECRET_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const refreshToken = sign({ id: data._id }, process.env.REFRESH_TOKEN, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });

  return { accessToken, refreshToken };
};

export const generateTokens = () => {
  const accessToken = sign(
    { id: Math.floor(Math.random() * 38248) },
    process.env.ACCESS_SECRET_TOKEN,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = sign(
    { id: Math.floor(Math.random() * 382442) },
    process.env.REFRESH_TOKEN,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
  );
  return { accessToken, refreshToken };
}; 


export const modifyConversation = async (conversations,id) =>{
  
  let count;
  let fromDate;
  
  let allCons = await Promise.all(
    conversations.map(async (con) => {
      
     let newCon = { ...con };

      //Counts unseen message only from after the date user joined the group
      fromDate = newCon?.joining.find(j=>j.user === id)?.createdAt
      
       count = await Message.count({
       conversation: con._id,
       createdAt:{$gte: formatISO(new Date(fromDate))},
       sender: { $ne: id },
       "seen.user": { $ne: id }});
      
      //Removing participants of group - unnecessary for the beginning
      if(con.chatName) delete newCon.participants
      delete newCon.joining
      newCon.unSeen = count;
      return newCon;
    }))
    return allCons
  
}



export const approveFriend = async (id, friendId, next) => {
  try {
    //Delete the pending friendship request + notification
    let user = await User.findOneAndUpdate(
      { _id: id },
      {
        $pull: {
          friendsWaitingList: friendId,
          notifications: { sender: friendId },
        },
      },
      { new: true }
    )
      .select("-password -friends").lean()
      .populate({ path: "friendsWaitingList", select: excludeFields })
      .populate({ path: "notifications", select: excludeFields });

    //Adding the user to the user's array of friends!
    await User.findOneAndUpdate({ _id: friendId }, { $push: { friends: id } });

    let result = { message: "The Friend approval has been done", user };
    return result;
  } catch (err) {
    return next(err);
  }
};
