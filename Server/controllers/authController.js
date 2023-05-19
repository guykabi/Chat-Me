import { User } from "../models/userModel.js";
import { generateInitialToken } from "../utils/utils.js";
import { verify } from "jsonwebtoken";
import { uploadToCloudinary } from "../services/cloudinary.js";
import { getPlaiceholder } from "plaiceholder";

export const checkValidity = async (req, resp, next) => {
  try {
    resp.status(200).json({ success: true, message: "New access token" });
  } catch (err) {
    next(err);
  }
};

export const checkUserCredentials = async (req, resp, next) => {
  const { email, password } = req.body;

  try {
    let data = await User.findOne({ email })

    if (!data) {
      //Checks if signed in through google
      if (req.body.sub) {
        //If not - create a new user
        if (req.body?.image) {
          const data = await uploadToCloudinary(
            req.body.image,
            "user-images",
            next
          );
          const { base64 } = await getPlaiceholder(data.url); //For blur-placeholder
          data.base64 = base64;
          req.body.image = data;
        }
        const newUser = new User(req.body);
        data = await newUser.save();
      } else {
        return resp.status(200).json("Email does not exist");
      }
    }

    const { accessToken, refreshToken, invalidPassword } =
      await generateInitialToken(data, password);
    if (invalidPassword) return resp.status(200).json(invalidPassword);

    resp
      .cookie(
        "token",
        { accessToken, refreshToken },
        {
          maxAge: process.env.COOKIE_EXPIRE_IN,
          httpOnly: true,
        }
      )

      .cookie("userData", JSON.stringify(data), {
        maxAge: process.env.COOKIE_EXPIRE_IN,
        httpOnly: true,
      });

    resp.status(200).json({ message: "User got authorized", userData: data });
  } catch (err) {
    next(err);
  }
};

export const validateResetLink = async (req, resp, next) => {
  const { id, token } = req.body;
  try {
    let user = await User.findById(id);
    if (!user) return resp.status(200).json("Not such user");

    verify(token, process.env.RESET_TOKEN, async (err) => {
      if (err) {
        return next(new Error("Invalid token from reset link"));
      }
      return resp.status(200).json("Valid reset password token");
    });
  } catch (error) {
    next(error);
  }
};

export const logOut = async (req, resp) => {
  resp.clearCookie("token");
  resp.clearCookie("userData");

  resp
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};
