import React,{memo} from 'react'
import styles from './message.module.css'
import { getTime } from '../../utils/utils'

const Message = ({message,own}) => {
  
  return (
    <>
    <div className={styles.mainMessageDiv}>
      <div className={styles.contentWrapper}>
         <div className={own?styles.ownMessage:styles.otherMessage}>
               <div>{message.text}</div>
              <span>{message.createdAt?getTime(message.createdAt):message.time}</span>
         </div>  
      </div>
    </div>
    </>
  )
}

export default memo(Message)