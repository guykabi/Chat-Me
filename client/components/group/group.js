import React,{useContext,memo} from 'react'
import styles from './group.module.css'
import noAvatarGroup from '../../public/images/no-avatarGroup.png'
import noAvatar from '../../public/images/no-avatar.png'
import Image from 'next/image'
import {getConversation} from '../../utils/apiUtils'
import { chatContext } from '../../context/chatContext'
import {useQuery} from 'react-query'

const Group = ({group,onPick}) => {
   
const {dispatch,currentUser} = useContext(chatContext) 

const {refetch:getChatData} = useQuery('conversation',
  ()=>getConversation(group._id,currentUser._id,true),{
    onSuccess:({conversation})=>{
        dispatch({type:'CURRENT_CHAT',payload:conversation})
    },
    enabled:false
  })

const handlePick = (e) =>{
  e.stopPropagation();
  getChatData()
} 

const onGroupPick = (e) =>{
  e.stopPropagation()
  onPick(group)
}

const getUserName = ()=> {
  let user = group.participants.find(p=>p._id !== currentUser._id)
  return user.name
} 

const getUserImage = () =>{
  let user = group.participants.find(p=>p._id !== currentUser._id)
  return user?.image
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
           placeholder={group?.image?.base64?'blur':'empty'}
           blurDataURL={group?.image?.base64}
           alt={group.chatName}
          />:
          <Image
           width={70}
           height={70}
           style={{borderRadius:'50%',objectFit:'cover'}}
           src={getUserImage()?getUserImage().url:noAvatar}
           placeholder={group?.image?.base64?'blur':'empty'}
           blurDataURL={group?.image?.base64}
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
