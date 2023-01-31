import React,{useEffect, useState,useContext} from 'react'
import styles from './conversation.module.css' 
import { chatContext } from '../../context/chatContext'

const Conversation = (props) => {
  const [friend,setFriend]=useState(null)
  const {currentUser,currentChat,dispatch} = useContext(chatContext)
  
useEffect(()=>{
  //If not a group chat
  if(!props.chatName){
    let friend = props.participants?.find(p=>p._id !== currentUser?._id)
    setFriend(friend)
  }
  
},[])

const selectedConversation = ()=>{
  let conversation = {...props}
  //If it's not a group chat!
  if(!props.chatName){
    conversation.friend = friend
  }
  dispatch({type:'CURRENT_CHAT',payload:conversation})
}

  return (
    <>
    <div className={currentChat?._id === props?._id?
         styles.currentConversationDiv:
         styles.conversationDiv} 
         onClick={selectedConversation}>

        <div className={styles.conversationImage}> 
          <img src={friend?.image
          ?'/images/Andromeda_Galaxy.jpg'
          :'/images/no-avatar.png'}/>
        </div> 

        <div className={styles.conversationName}>
          {props.chatName?props.chatName:friend?.name}
        </div>
        
    </div>
    </>
  )
}

export default Conversation