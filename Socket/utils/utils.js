let users = []

 const addUsers = (userId,socketId)=>
{    
    if(!userId) return
    //Checking if user is already exists/connect
    !users.some((user)=>user.userId === userId)&&
    users.push({userId,socketId})
    return users
}  

 const removeUser = (socketId)=>{
    users = users.filter(user=>user.socketId !==socketId)
    return users
}  

const getUser = (id) =>{
   let foundUser = users.find(u=>u.userId === id)  
   return foundUser
} 

const getAllUsers = () =>{
    return users
}

 

module.exports = {addUsers,removeUser,getUser,getAllUsers}