import React,{useMemo, useState} from 'react'
import styles from './conversations.module.css'
import Conversation from '../conversation/conversation'

const Conversations = ({conversations}) => { 
   
  const [allConversations,setAllConversations]=useState(conversations)
   
  const renderedCons =useMemo(()=>allConversations?.map((con,index)=>(
    <Conversation key={index} {...con}/>
)),[conversations])


  return (
    <div className={styles.conversationsDiv}> 
     <div className={styles.searchInputWrapper}>
        <input type='text' placeholder='Search for chat...'/>
     </div>
     <div className={styles.allConversationsWrapper}>
        {renderedCons}
     </div>
    </div>
  )
}

export default Conversations