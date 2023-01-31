import React, { useContext, useEffect, useState } from 'react' 
import styles from './onlineList.module.css'
import Online from '../online/online'
import { chatContext } from '../../context/chatContext'

const OnlineList = ({socket}) => {  
  const [onlineUsers,setOnlineUsers]=useState()
  const {currentUser} = useContext(chatContext)

 useEffect(()=>{
   socket?.on('getUsers',(users)=>{
     let filterUsers = users.filter(user=>user.userId !== currentUser._id)
     setOnlineUsers(filterUsers)
   })
 },[socket])


  return (
    <div className={styles.onlineListWrapper}>
      {onlineUsers?.map((user,index)=>(
              <Online key={index} user={user}/>
      ))}
        
    </div>
  )
}

export default OnlineList