import React,{memo} from 'react'
import styles from './message.module.css'

const Message = ({props,own}) => {
  return (
    <>
    <div className={styles.mainMessageDiv}>
      <div className={styles.contentWrapper}>
         <div className={own?styles.ownMessage:styles.otherMessage}>
              {props.text} <br/>
              <span>{props.time}</span>
         </div>  
      </div>
    </div>
    </>
  )
}

export default Message