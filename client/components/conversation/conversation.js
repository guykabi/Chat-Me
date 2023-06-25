import React,{useEffect, useState,useContext,memo} from 'react'
import Image from 'next/image'
import noAvatar from '../../public/images/no-avatar.png'
import noAvatarGroup from '../../public/images/no-avatarGroup.png'
import styles from './conversation.module.css' 
import { useErrorBoundary } from "react-error-boundary";
import { chatContext } from '../../context/chatContext'
import {useQuery} from 'react-query'
import {formatISO} from 'date-fns'
import { handleSeenTime } from '../../utils/utils'
import { getConversation } from '../../utils/apiUtils'
import {GoMute} from 'react-icons/go'


const Conversation = ({con,newMessage}) => {
  const { showBoundary } = useErrorBoundary();
  const [friend,setFriend]=useState(null)
  const {currentUser,currentChat,dispatch} = useContext(chatContext)
  const [numsOfUnSeen,setNumOfUnseen]=useState(0)
  const [isCurrentOne,setIsCurrentOne]=useState(false)
  const [seenTime,setSeenTime]=useState(null)
  const [isMute,setIsMute]=useState(false)


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
  if(con?.lastActive)setSeenTime(handleSeenTime(con?.lastActive))

  if(!con?.lastActive)setSeenTime('New chat')
  if(currentUser?.mute?.some(chat=>chat === con._id)) setIsMute(true)   

  //If not a group chat
  if(con.chatName)return
  if(con?.friend) return setFriend(con.friend)
    let friend = con?.participants?.find(p=>p._id !== currentUser?._id)
    setFriend(friend)  

},[]) 


useEffect(()=>{
   if(newMessage?.conversation?._id !== con._id)return
   setSeenTime(handleSeenTime(formatISO(new Date())))
   
   if(
      newMessage.sender !== currentUser._id ||
      !currentChat
     ) setNumOfUnseen(prev=>prev+=1)

},[newMessage])


useEffect(()=>{
  if(currentChat?._id === con._id){
    setIsCurrentOne(true)
    if(numsOfUnSeen)setNumOfUnseen(0)
    return
  }
  if(isCurrentOne){
  setIsCurrentOne(false)
  setNumOfUnseen(0)
  } 
},[currentChat])


useEffect(()=>{
   if(currentUser?.mute?.some(chat=>chat === con._id)) {
     if(isMute) return
     setIsMute(true) 
   }
   if(isMute) setIsMute(false)
  
},[currentUser])


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
        {!isCurrentOne&&seenTime?
        <div 
        className={styles.lastActiveDate}
        role='timer'>
          {seenTime}
        </div>:null}
        {numsOfUnSeen||isMute?
         <div className={styles.conversationPopUps}>
           {isMute?<GoMute/>:null}
         {numsOfUnSeen?
         <div className={styles.numOfUnSeen}>
           {numsOfUnSeen>99?`99+`:numsOfUnSeen}
         </div>:null}
        </div>:null}
    </article>
    </>
  )
}

export default  memo(Conversation)