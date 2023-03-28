const {Schema,model} = require('mongoose') 
const {ConversationSchema} = require('../models/conversationModel')
const {hash} = require('bcryptjs/dist/bcrypt')
const moment = require('moment');

let createdAt = function(){
    let d = new Date();
    let formattedDate = moment(d).format("MM-DD-YYYY, h:mm:ss a");
    return formattedDate;
};

const userRef = {type: Schema.Types.ObjectId, ref: 'users' }
const UserSchema = new Schema({
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
  

const MessageSchema = new Schema({
    conversation:{type: Schema.Types.ObjectId, ref: 'conversations' },
    sender:userRef,
    text:String,
    image:{
         url:{type:String},
         cloudinary_id:{type:String},
         base64:{type:String}},
    seen:[{user:userRef,createdAt:{type:String,default:createdAt}}]
},
    {timestamps:true}
) 


const User = model('users',UserSchema)
const Message = model('messages',MessageSchema) 
model('conversations',ConversationSchema)

module.exports = {User,Message}