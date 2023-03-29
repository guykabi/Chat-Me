import React,{useContext,memo} from 'react'
import styles from './group.module.css'
import noAvatarGroup from '../../public/images/no-avatarGroup.png'
import Image from 'next/image'
import { chatContext } from '../../context/chatContext'

const Group = ({group,onPick}) => {
   
const {currentChat,currentUser,dispatch} = useContext(chatContext)


const handlePick = (e) =>{
  e.stopPropagation();
  dispatch({type:'CURRENT_CHAT',payload:group})
} 


  return (
    <>
     <article className={styles.groupMainDiv} onClick={handlePick}>

      <div className={styles.groupImageWrapper}>
          <Image 
           width={70}
           height={70}
           style={{borderRadius:'50%',objectFit:'cover'}}
           src={group?.image?.url?group.image.url:noAvatarGroup}
           alt={group.chatName}
          />
      </div>

      <div className={styles.groupNameWrapper}>

        <section>
         {group?.chatName} 
        </section>&nbsp;

      </div>
      
     </article>
    </>
  )
} 

export default memo(Group)
