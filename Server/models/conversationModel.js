const {Schema,model} = require('mongoose') 

const userRef = {type:Schema.Types.ObjectId,ref:'users'}

const ConversationSchema = new Schema({
    chatName:String, //For chat group
    manager:[userRef], //For chat group
    participants:[userRef],
    //Media consider as message that contains image
    media:[{type:Schema.Types.ObjectId,ref:'messages'}],
    image:String,
    lastActive:Date
},
    {timestamps:true}
)

const Conversation = model('conversations',ConversationSchema)

//Also for the ref(populate) of messageModel
module.exports = {Conversation,ConversationSchema}