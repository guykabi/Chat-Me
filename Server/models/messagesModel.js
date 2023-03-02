const {Schema,model} = require('mongoose') 
const {ConversationSchema} = require('../models/conversationModel')
const {hash} = require('bcryptjs/dist/bcrypt')
const moment = require('moment');

let createdAt = function(){
    let d = new Date();
    let formattedDate = moment(d).format("MM-DD-YYYY, h:mm:ss a");
    return formattedDate;
};

const UserSchema = new Schema({
    name:String,
    lastName:String,
    email:{type: String,unique: true},
    password:String,
    image:String,
    friends:[{type: Schema.Types.ObjectId, ref: 'users' }],
    friendsWaitingList:[{type: Schema.Types.ObjectId, ref: 'users'}],
    notifications:[
       {sender:{type: Schema.Types.ObjectId, ref: 'users'},
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
    sender:{type: Schema.Types.ObjectId, ref: 'users' },
    text:String,
    seen:Boolean
},
    {timestamps:true}
) 


const User = model('users',UserSchema)
const Message = model('messages',MessageSchema) 
model('conversations',ConversationSchema)

module.exports = {User,Message}