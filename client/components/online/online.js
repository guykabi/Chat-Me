import React from 'react'
import styles from './online.module.css'

const Online = ({user}) => {
  return (
    <div className={styles.mainOnlineDiv}>
        <div className={styles.chatOnlineImgContainer}>
            <img className={styles.chatOnlineImg} src='/images/no-avatar.png' />
            <div className={styles.chatOnlineBadge}></div>
        </div>
        <span className={styles.chatOnlineName}>{user.userId}</span>
        <div></div>
    </div>
  )
}

export default Online