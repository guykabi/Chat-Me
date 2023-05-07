import React,{useEffect, useState,useContext,memo} from 'react'
import Image from 'next/image'
import noAvatar from '../../public/images/no-avatar.png'
import noAvatarGroup from '../../public/images/no-avatarGroup.png'
import styles from './conversation.module.css' 
import { useErrorBoundary } from "react-error-boundary";
import { chatContext } from '../../context/chatContext'
import {useQuery} from 'react-query'
import { handleSeenTime } from '../../utils/utils'
import {getConversation} from '../../utils/apiUtils'


const Conversation = ({con,newMessage}) => {
  const { showBoundary } = useErrorBoundary();
  const [friend,setFriend]=useState(null)
  const {currentUser,currentChat,dispatch} = useContext(chatContext)
  const [numsOfUnSeen,setNumOfUnseen]=useState()
  const [isCurrentOne,setIsCurrentOne]=useState(false)

  const {refetch:fetchChatData} = useQuery(['conversation'],
     ()=>getConversation(con._id,currentUser._id,true),{
      onSuccess:({conversation})=>{
      dispatch({type:'CURRENT_CHAT',payload:conversation})
     },
     onError: (error) => showBoundary(error),
     enabled:false
  })

  
useEffect(()=>{
  setNumOfUnseen(con.unSeen)
  //If not a group chat
  if(con.chatName)return
  if(con?.friend) return setFriend(con.friend)
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
  //Preventing from the same conversation to be picked again!
  if(currentChat?._id === con._id) return
  fetchChatData()
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
          width={40}
          height={40}
          style={{borderRadius:'50%'}}
          src={friend?.image?.url
          ?friend.image.url
          :noAvatar}
          alt={friend.name ||'chat-image'}
          placeholder={friend?.image?.url?'blur':'empty'}
          blurDataURL={friend?.image?.base64}
          />:
          <Image
          width={40}
          height={40}
          style={{borderRadius:'50%'}}
          src={con?.image?.url
            ?con.image.url
            :noAvatarGroup}
            alt={con.chatName||'chat-image'}
            placeholder={con?.image?.url?'blur':'empty'}
            blurDataURL={con?.image?.base64}
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