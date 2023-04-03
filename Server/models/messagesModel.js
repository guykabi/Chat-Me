import {Schema,model} from 'mongoose'
import {ConversationSchema} from '../models/conversationModel.js'
import bcrypt from 'bcryptjs'
import moment from 'moment'
const {hash} = bcrypt

let createdAt = function(){
    let d = new Date();
    let formattedDate = moment(d).format("MM-DD-YYYY, h:mm:ss a");
    return formattedDate;
};

const userRef = {type: Schema.Types.ObjectId, ref: 'users' }
export const UserSchema = new Schema({
    name:String,
    lastName:String,
    email:{type: String,unique: true},
    password:String,
    image:{url:{type:String},cloudinary_id:{type:String}},
    friends:[userRef],
    friendsWaitingList:[userRef],
    notifications:[
       {sender:userRef,
       message:String,
       seen:Boolean,
       createdAt:{type:String,default:createdAt}}
     ]
  })  

  //Crypt the new user password
UserSchema.pre('save',async function (){
  if(this.isModified('password')){
      this.password = await hash(this.password,12)     
  }
})
  

export const MessageSchema = new Schema({
    conversation:{type: Schema.Types.ObjectId, ref: 'conversations' },
    sender:userRef,
    text:String,
    image:{
         url:{type:String},
         cloudinary_id:{type:String},
         base64:{type:String}},
    likes:[userRef],   
    seen:[{user:userRef,createdAt:{type:String,default:createdAt}}]
},
    {timestamps:true}
) 


export const User = model('users',UserSchema)
export const Message = model('messages',MessageSchema) 
model('conversations',ConversationSchema)

