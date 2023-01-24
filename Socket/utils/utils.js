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

 const getUser =  (userId)=>
{
    return users.find(user=>user.userId === userId)
}

module.exports = {getUser,addUsers,removeUser}