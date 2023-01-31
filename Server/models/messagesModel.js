const {Schema,model} = require('mongoose') 
const {hash} = require('bcryptjs/dist/bcrypt')

const UserSchema = new Schema({
    name:String,
    lastName:String,
    email:{type: String,unique: true},
    password:String,
    image:String,
    friends:[{type: Schema.Types.ObjectId, ref: 'users' }]
  })  

  //Crypt the new user password
UserSchema.pre('save',async function (){
  if(this.isModified('password')){
      this.password = await hash(this.password,12)     
  }
})
  

const MessageSchema = new Schema({
    conversationId:String,
    sender:{type: Schema.Types.ObjectId, ref: 'users' },
    text:String,
    seen:Boolean
},
    {timestamps:true}
) 

const User = model('users',UserSchema)
const Message = model('messages',MessageSchema) 

module.exports = {User,Message}