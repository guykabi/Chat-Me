import {Schema,model} from 'mongoose'
import { formatISO } from "date-fns";

let createdAt = function () {
    return formatISO(new Date());
};

const userRef = {type:Schema.Types.ObjectId,ref:'users'}

export const ConversationSchema = new Schema({
    chatName:String, //For chat group
    manager:[userRef], //For chat group
    participants:[userRef],
    media:[{type:Schema.Types.ObjectId,ref:'messages'}],
    image:{
        url:{type:String},
        cloudinary_id:{type:String},
        base64:{type:String}},
    joining:[{user:String,createdAt: { type: String, default: createdAt } }],
    lastActive:Date
},
    {timestamps:true}
)

export const Conversation = model('conversations',ConversationSchema)

