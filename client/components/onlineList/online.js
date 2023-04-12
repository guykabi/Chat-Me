import React, { useContext, useEffect, useState } from 'react' 
import styles from './onlineList.module.css'
import Online from '../online/online'
import { chatContext } from '../../context/chatContext'


const OnlineList = () => {  

  const [onlineUsers,setOnlineUsers]=useState([])
  const {currentUser,Socket} = useContext(chatContext)


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
   const handleNotifyEvent = ({users,message}) =>{
  
    if(message !== 'The Friend approval has been done')return 
    
    let allOnLinUsers = users?.map(u=>u._id)
    let onlineFriends =  currentUser.friends
    ?.filter(f=> allOnLinUsers.includes(f._id))
    
    setOnlineUsers(onlineFriends)
   } 

   Socket.on('incoming-notification',handleNotifyEvent)
   return () => Socket.off('incoming-notification',handleNotifyEvent)
  
 },[Socket])


 //When messanger page reload for the first time (user redirected to the page)
 if(!onlineUsers.length){     
        Socket.emit('all-connected')
        Socket.removeAllListeners('all-connected')
 }

 useEffect(()=>{
  //When there is a change on the user's friends
  if(!onlineUsers)return 
     
     let allOnLinUsers = onlineUsers?.map(u=>u._id)
     let onlineFriends =  currentUser.friends
     ?.filter(f=> allOnLinUsers.includes(f._id))
     
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