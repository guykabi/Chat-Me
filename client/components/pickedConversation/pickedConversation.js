import React,{useContext,memo} from 'react'
import styles from "./pickedConversation.module.css";
import { chatContext } from '../../context/chatContext';
import noAvatarGroup from '../../public/images/no-avatarGroup.png'
import noAvatar from '../../public/images/no-avatar.png'
import Image from 'next/image'

const PickedConversation = ({ con, onRemove }) => {

const {currentUser} = useContext(chatContext)

const getUserName = ()=> {
  let user = con.participants.find(p=>p._id !== currentUser._id)
  return user.name
}

  return (
    <>
    <article className={styles.pickedConShow}>
    {con?.chatName?
         <Image 
         src={con?.image?.url ? con.image.url : noAvatarGroup}
         alt={con.chatName} 
         width={20}
         height={20}
         style={{borderRadius:'50%'}}/>:
         <Image
         src={con?.image?.url ? con.image.url : noAvatar}
         alt={getUserName()} 
         width={20}
         height={20}
         style={{borderRadius:'50%'}}
         />}

        <div aria-label="chat-name">
            {con?.chatName?con.chatName:getUserName()}
        </div>
        
        <span
          className={styles.xDelete}
          onClick={() => onRemove(con)}
          role="button"
        >
          x
        </span>
    </article>
    </>
  )
}

export default memo(PickedConversation)