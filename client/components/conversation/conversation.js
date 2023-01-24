import React,{useEffect, useState,useContext} from 'react'
import styles from './conversation.module.css' 
import { chatContext } from '../../context/chatContext'

const Conversation = ({participants,name}) => {
  const [friendName,setFriendName]=useState(null)
  const {currentUser} = useContext(chatContext)
  
useEffect(()=>{
  if(!name){//If not a group chat
    let friend = participants?.find(p=>p._id !== currentUser?._id)
      setFriendName(friend)
  }
},[])


  return (
    <>
    <div className={styles.conversationDiv}>
        <div className={styles.conversationImage}> 
          <img src={friendName?.image
          ?'/images/Andromeda_Galaxy.jpg'
          :'/images/no-avatar.png'}/>
        </div> 
        <div className={styles.conversationName}>
          {name?name:friendName?.name}
        </div>
    </div>
    </>
  )
}

export default Conversation