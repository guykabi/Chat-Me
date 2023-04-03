import {Schema,model} from 'mongoose'

const userRef = {type:Schema.Types.ObjectId,ref:'users'}

export const ConversationSchema = new Schema({
    chatName:String, //For chat group
    manager:[userRef], //For chat group
    participants:[userRef],
    //Media consider as message that contains image
    media:[{type:Schema.Types.ObjectId,ref:'messages'}],
    image:{url:{type:String},cloudinary_id:{type:String},base64:{type:String}},
    lastActive:Date
},
    {timestamps:true}
)

export const Conversation = model('conversations',ConversationSchema)

