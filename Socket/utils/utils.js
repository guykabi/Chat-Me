let users = []

export const addUsers = (userId,socketId)=>
{    
    if(!userId) return
    //Checking if user is already exists/connect
    !users.some((user)=>user.userId === userId)&&
    users.push({userId,socketId})
    return users
}  

export const removeUser = (socketId)=>{
    users = users.filter(user=>user.socketId !==socketId)
    return users
}  

export const getUser = (id) =>{
   let foundUser = users.find(u=>u.userId === id)  
   return foundUser
} 

export const getAllUsers = () =>{
    return users
}

 

