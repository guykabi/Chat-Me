import { Schema, model } from "mongoose";
import { formatISO } from "date-fns";

let createdAt = function () {
  return formatISO(new Date());
};

const userRef = { type: Schema.Types.ObjectId, ref: "users" };

export const MessageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "conversations" },
    sender: userRef,
    text: String,
    image: {
      url: { type: String },
      cloudinary_id: { type: String },
      base64: { type: String },
      video: { type: Boolean },
    },
    likes: [userRef],
    seen: [{ user: userRef, createdAt: { type: Date, default: createdAt } }],
  },
  { timestamps: true }
);

export const Message = model("messages", MessageSchema);
