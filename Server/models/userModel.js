import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { formatISO } from "date-fns";
const { hash } = bcrypt;

let createdAt = function () {
  return formatISO(new Date());
};

const userRef = { type: Schema.Types.ObjectId, ref: "users" };
export const UserSchema = new Schema({
  name: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  image: {
    url: { type: String },
    cloudinary_id: { type: String },
    base64: { type: String },
  },
  friends: [userRef],
  friendsWaitingList: [userRef],
  notifications: [
    {
      sender: userRef,
      message: String,
      seen: Boolean,
      createdAt: { type: Date, default: createdAt },
    },
  ],
  mute:[String]
});

UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 12);
  }
});

export const User = model("users", UserSchema);
