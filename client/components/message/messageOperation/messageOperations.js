import React,{memo} from 'react'
import styles from './messageOperations.module.css'

const MessageOperations = () => {
  return (
    <>
        <div className={styles.messageMenuDiv}>
           <div>Like message</div>
           <div>Delete message</div>
        </div>
    </>
  )
}

export default memo(MessageOperations)