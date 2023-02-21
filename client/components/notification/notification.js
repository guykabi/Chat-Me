import React from 'react'
import styles from './notification.module.css'


const Notification = ({notification}) => {
  return (
    <div className={styles.notificationMainDiv}>
       <div>{notification.message}-{notification.sender.name}</div>
    </div>
  )
}

export default Notification