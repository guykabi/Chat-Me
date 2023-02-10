let users = []

 const addUsers = (userId,socketId)=>
{    
    if(!userId) return
    !users.some((user)=>user.userId === userId)&&
     users.push({userId,socketId})
     console.log(users);
     return users
}  

 const removeUser = (socketId)=>{
    users = users.filter(user=>user.socketId !==socketId)
    return users
} 

 

module.exports = {addUsers,removeUser}