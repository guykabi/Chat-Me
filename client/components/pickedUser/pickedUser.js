import React,{memo} from 'react'
import styles from './pickedUser.module.css'

const PickedUser = ({user,onRemove}) => {
  return (
    <>
    <div className={styles.pickedUserShow}>
      <img src={user?.image ? user.image : "/images/no-avatar.png"}
           alt={user.name} />
      <span aria-label="user-image">{user.name}</span>
      <span
        className={styles.xDelete}
        onClick={() => onRemove(user)}
        role="button"
      >
        x
      </span>
    </div>
    </>
  )
}

export default memo(PickedUser)