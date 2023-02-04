const {Schema,model} = require('mongoose') 

const ConversationSchema = new Schema({
    chatName:String, //For chat group
    manager:{type:Schema.Types.ObjectId,ref:'users'},
    participants:[{type:Schema.Types.ObjectId,ref:'users'}],
    //Media consider as message that contains image - checked in client
    media:[{type:Schema.Types.ObjectId,ref:'messages'}],
    lastActive:Date
},
    {timestamps:true}
)

module.exports = model('conversations',ConversationSchema)