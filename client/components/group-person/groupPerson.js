import React from 'react'
import styles from './groupPerson.module.css'


const GroupPerson = ({user,onPick}) => {
  return (
    <>
     <article className={styles.personMainDiv} onClick={()=>onPick(user)}>
      <div className={styles.userImageWrapper}>
          <img  src={user?.image?user.image:'/images/no-avatar.png'}/>
      </div>
      <div className={styles.userNameWrapper}>
        {user?.name}
      </div>
     </article>
    </>
  )
} 

export default GroupPerson
