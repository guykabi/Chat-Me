import React,{useEffect, useState,useContext,memo} from 'react'
import Image from 'next/image'
import noAvatar from '../../public/images/no-avatar.png'
import noAvatarGroup from '../../public/images/no-avatarGroup.png'
import styles from './conversation.module.css' 
import { chatContext } from '../../context/chatContext'
import { handleSeenTime } from '../../utils/utils'


const Conversation = ({con,newMessage}) => {
  const [friend,setFriend]=useState(null)
  const {currentUser,currentChat,dispatch} = useContext(chatContext)
  const [numsOfUnSeen,setNumOfUnseen]=useState()
  const [isCurrentOne,setIsCurrentOne]=useState(false)
  
useEffect(()=>{
  
  setNumOfUnseen(con.unSeen)
  //If not a group chat
  if(con.chatName)return
    let friend = con?.participants?.find(p=>p._id !== currentUser?._id)
    setFriend(friend)  
},[con])


useEffect(()=>{
  if(!newMessage)return
  setNumOfUnseen(prev=>prev+=1)
},[newMessage]) 


useEffect(()=>{
  setIsCurrentOne(false)
  if(currentChat?._id === con._id){
    setIsCurrentOne(true)
    if(numsOfUnSeen)setNumOfUnseen(0)
  }
},[currentChat])

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
    <article className={currentChat?._id === con?._id?
         styles.currentConversationDiv:
         styles.conversationDiv} 
         role='button'
         onClick={selectedConversation}>

        <div className={styles.conversationImage}> 
          {friend?
          <Image 
          width={35}
          height={35}
          style={{borderRadius:'50%'}}
          src={friend?.image?.url
          ?friend.image.url
          :noAvatar}
          alt={friend.name}
          />:
          <Image
          width={35}
          height={35}
          style={{borderRadius:'50%'}}
          placeholder="blur"
          blurDataURL={con?.image?.base64}
          src={con?.image?.url
            ?con.image.url
            :noAvatarGroup}
            alt={con.chatName}
          />}
        </div> 

        <div className={styles.conversationName}>
          {con.chatName?con.chatName:friend?.name}
        </div>
        {!isCurrentOne&&con.lastActive?<div 
        className={styles.lastActiveDate}
        role='timer'>
          {handleSeenTime(con.lastActive)}
        </div>:null}
        {numsOfUnSeen?
        <div className={styles.numOfUnSeen}>
          {numsOfUnSeen}
        </div>:
        null}
    </article>
    </>
  )
}

export default  memo(Conversation)