import React,{useMemo} from 'react'
import styles from './conversations.module.css'
import Conversation from '../conversation/conversation'

const Conversations = ({conversations}) => {

  const renderedCons =useMemo(()=>conversations.map((con,index)=>(
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