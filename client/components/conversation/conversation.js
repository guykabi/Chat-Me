import React,{useEffect, useState,useContext,memo} from 'react'
import Image from 'next/image'
import styles from './conversation.module.css' 
import { chatContext } from '../../context/chatContext'

const Conversation = ({con}) => {
  const [friend,setFriend]=useState(null)
  const {currentUser,currentChat,dispatch} = useContext(chatContext)

 
useEffect(()=>{
  //If not a group chat
  if(con.chatName)return
    let friend = con?.participants?.find(p=>p._id !== currentUser?._id)
    setFriend(friend)

},[con])



const selectedConversation = ()=>{
  let conversation = {...con}

  //If it's not a group chat!
  if(!con.chatName){
    //Adding a friend name field
    conversation.friend = friend
  }

  //Preventing from the same conversation to be picked again!
  if(currentChat?._id === conversation._id) return
  dispatch({type:'CURRENT_CHAT',payload:conversation})
}

  return (
    <>
    <div className={currentChat?._id === con?._id?
         styles.currentConversationDiv:
         styles.conversationDiv} 
         onClick={selectedConversation}>

        <div className={styles.conversationImage}> 
          <Image src={friend?.image
          ?'/images/Andromeda_Galaxy.jpg'
          :'/images/no-avatar.png'}
          alt={currentUser.name}
          width={35}
          height={35}
          loading='lazy'
          />
        </div> 

        <div className={styles.conversationName}>
          {con.chatName?con.chatName:friend?.name}
        </div>
        
    </div>
    </>
  )
}

export default  memo(Conversation)