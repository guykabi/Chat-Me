import React,{memo, useEffect} from 'react'
import styles from './message.module.css'
import { getTime } from '../../utils/utils'
import { useMutation } from 'react-query'
import { seenMessage,seenOnChatMessage } from '../../utils/apiUtils'

const Message = ({message,own}) => {
  
  const {mutate:switchToSeen} = useMutation(seenMessage)
  const {mutate:switchOnChatSeen} = useMutation(seenOnChatMessage)

  useEffect(()=>{
    
    //Only when chat is loaded and there are unseen messages
    if(message._id){
        if(!own && !message.seen){
             switchToSeen(message._id)
          }
       } 
    //Only when the reciever is on the chat
    else{
        if(!own && !message.seen){  
           switchOnChatSeen(message.conversationId)
         }
       }
  },[])

  return (
    <>
    <div className={styles.mainMessageDiv}>
      <div className={styles.contentWrapper}>
         <div className={own?styles.ownMessage:styles.otherMessage}>
               <div>{message.text}</div>
               <span>{message.createdAt?
               getTime(message.createdAt):
               message.time}
               </span>
         </div>  
      </div>
    </div>
    </>
  )
}

export default memo(Message)