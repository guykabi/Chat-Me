import {Schema,model} from 'mongoose'
import {ConversationSchema} from '../models/conversationModel.js'
import bcrypt from 'bcryptjs'
import {formatISO} from 'date-fns'
const {hash} = bcrypt

let createdAt = function(){
    return formatISO(new Date())
};

const userRef = {type: Schema.Types.ObjectId, ref: 'users' }
export const UserSchema = new Schema({
    name:String,
    lastName:String,
    email:{type: String,unique: true},
    password:String,
    image:{
        url:{type:String},
        cloudinary_id:{type:String},
        base64:{type:String}},
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
         base64:{type:String},
         video:{type:Boolean}},
    likes:[userRef],   
    seen:[{user:userRef,createdAt:{type:String,default:createdAt}}]
},
    {timestamps:true}
) 


export const User = model('users',UserSchema)
export const Message = model('messages',MessageSchema) 

