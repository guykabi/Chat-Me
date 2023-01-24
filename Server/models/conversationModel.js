const {Schema,model} = require('mongoose') 
//const {User} = require('./messagesModel')

const ConversationSchema = new Schema({
    name:String, //For chat group
    manager:{type:Schema.Types.ObjectId,ref:'users'},
    participants:[{type:Schema.Types.ObjectId,ref:'users'}],
    //Media consider as message that contains image - checked in client
    media:[{type:Schema.Types.ObjectId,ref:'messages'}]
    
})

module.exports = model('conversations',ConversationSchema)