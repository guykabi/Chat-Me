import React,{memo} from 'react'
import styles from './messageOperations.module.css'
import {AiOutlineLike} from 'react-icons/ai'
import {BsTrash3} from 'react-icons/bs'

const MessageOperations = () => {
  return (
    <>
        <div className={styles.messageMenuDiv}>
           <div>
            <AiOutlineLike/>
            Like message
            </div>
           <div>
           <BsTrash3/>
           Delete message
           </div>
        </div>
    </>
  )
}

export default memo(MessageOperations)