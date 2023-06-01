import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
const { compare } = bcrypt;
const { sign } = jwt;

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
