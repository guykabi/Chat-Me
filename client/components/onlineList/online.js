import React, { useContext, useEffect, useState } from 'react' 
import styles from './onlineList.module.css'
import Online from '../online/online'
import { chatContext } from '../../context/chatContext'


const OnlineList = () => {  

  const [onlineUsers,setOnlineUsers]=useState([])
  const {currentUser,Socket} = useContext(chatContext)

useEffect(()=>{
 //When messanger page reload for the first time
 if(onlineUsers.length)return
      Socket.emit('all-connected')
},[])


 useEffect(()=>{
    
    Socket.removeAllListeners('getUsers')
    
    const handleGetUsersEvent = (users) =>{
    
      let allOnLineUsers = users.filter(user=>user.userId !== currentUser._id)
      .map(u=>u.userId)
 
      let onlineFriends = currentUser.friends.
      filter(f=> allOnLineUsers.includes(f._id))

      setOnlineUsers(onlineFriends)
   }
   
   Socket.on('getUsers',handleGetUsersEvent)


   //When a new friend added - add him (if he is connect) to the online list!    
   const handleNotifyEvent =  ({users,message,sender}) =>{
    
    if(message !== 'approved your friend request')return 
    
    let friends = [...currentUser.friends]
    friends.push(sender)

    let allOnLineUsers = users?.
    filter(f=>f.userId !== currentUser._id)
    .map(u=>u.userId)
    
    let onlineFriends = friends
    ?.filter(f=> allOnLineUsers?.includes(f._id))

    setOnlineUsers(onlineFriends)

   } 

   Socket.on('incoming-notification',handleNotifyEvent)
   return () => Socket.off('incoming-notification',handleNotifyEvent)
  
 },[Socket, currentUser])



 useEffect(()=>{
  //When there is a change on the user's friends

     let allOnLineUsers = onlineUsers?.map(u=>u._id)
     let onlineFriends =  currentUser.friends
     ?.filter(f=> allOnLineUsers.includes(f._id))
     
     setOnlineUsers(onlineFriends)

 },[currentUser.friends])


  return (
    <div className={styles.onlineListWrapper}>
      {onlineUsers?.map((user)=>(
              <Online key={user._id} user={user}/>
      ))}
        
    </div>
  )
}

export default OnlineList