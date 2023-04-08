import React,{useContext,memo} from 'react'
import styles from './group.module.css'
import noAvatarGroup from '../../public/images/no-avatarGroup.png'
import noAvatar from '../../public/images/no-avatar.png'
import Image from 'next/image'
import { chatContext } from '../../context/chatContext'

const Group = ({group,onPick}) => {
   
const {dispatch,currentUser} = useContext(chatContext)

const handlePick = (e) =>{
  e.stopPropagation();
  dispatch({type:'CURRENT_CHAT',payload:group})
} 

const onGroupPick = (e) =>{
  e.stopPropagation()
  onPick(group)
}

const getUserName = ()=> {
  let user = group.participants.find(p=>p._id !== currentUser._id)
  return user.name
}

  return (
    <>
     <article className={styles.groupMainDiv} onClick={onPick?onGroupPick:handlePick}>

      <div className={styles.groupImageWrapper}>
          {group?.chatName?
          <Image 
           width={70}
           height={70}
           style={{borderRadius:'50%',objectFit:'cover'}}
           src={group?.image?.url?group.image.url:noAvatarGroup}
           alt={group.chatName}
          />:
          <Image
           width={70}
           height={70}
           style={{borderRadius:'50%',objectFit:'cover'}}
           src={group?.image?.url?group.image.url:noAvatar}
           alt={getUserName()}
          />}
      </div>

      <div className={styles.groupNameWrapper}>

        <section>
         {group?.chatName?group.chatName:getUserName()} 
        </section>&nbsp;

      </div>
      
     </article>
    </>
  )
} 

export default memo(Group)
