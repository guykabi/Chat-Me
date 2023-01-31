import React,{useContext, useEffect,useRef,memo} from 'react'
import styles from './messages.module.css'
import Message from '../message/message'
import { chatContext } from '../../context/chatContext'

const Messages = ({messages,socket}) => {
    const {currentChat,currentUser} = useContext(chatContext)
    const scrollRef = useRef()
     
    useEffect(()=>{
        scrollRef.current?.scrollIntoView({
            behavior:'smooth',
            block: 'nearest',
            inline: 'start' 
          })
    },[socket,messages])

  return (
    <>
     <div className={styles.messagesDiv}>
     {messages?.map((message,index)=>(
            <div key={index} ref={scrollRef}>
               <Message message={message} own={message.sender===currentUser._id} />
            </div>
          ))}   
     </div>
    </>
  )
}

export default memo(Messages)