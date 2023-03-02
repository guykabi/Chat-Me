const {Schema,model} = require('mongoose') 

const ConversationSchema = new Schema({
    chatName:String, //For chat group
    manager:{type:Schema.Types.ObjectId,ref:'users'}, //For chat group
    participants:[{type:Schema.Types.ObjectId,ref:'users'}],
    //Media consider as message that contains image
    media:[{type:Schema.Types.ObjectId,ref:'messages'}],
    //unSeenCount:[{type:Schema.Types.ObjectId,ref:'messages'}],
    lastActive:Date
},
    {timestamps:true}
)

const Conversation = model('conversations',ConversationSchema)

//Also for the ref(populate) of messageModel
module.exports = {Conversation,ConversationSchema}