import React,{useContext, useState,useMemo, useEffect} from 'react'
import styles from './chatDetails.module.css'
import { chatContext } from '../../context/chatContext'
import ReturnIcon from '../UI/returnIcon/returnIcon'
import Input from '../UI/Input/Input'
import GroupPerson from '../group-person/groupPerson'


const EditGroup = ({onReturn}) => {
const {currentChat} = useContext(chatContext)
const [isEditGroupName,setIsEditGroupName]=useState(false)
const [newGroupName,setNewGroupName]=useState('') 
const [isMenu,setIsMenu]=useState(null)



const memoMembers = useMemo(()=>(
    currentChat.participants.map(user=>(
    <GroupPerson 
    key={user._id} 
    user={user} 
    onPick={()=>console.log('Hey')}
    onMenu={(e)=>setIsMenu(e)}
    menu={isMenu}
    manager={currentChat?.manager?._id===user._id}/>
   ))
),[isMenu])

  return (
    <main className={styles.mainEditGroup}> 
        <ReturnIcon onClick={onReturn} />
        <header className={styles.headerWrapper}>

        {currentChat.chatName?
        <h2>
          <Input 
          height='20'
          width='50'
          defaultValue={
          currentChat.chatName}
          placeholder='Group name'
          textAlign='center'
          fontSize='x-large'
          fontWeight='bold'
          onChange={(e)=>setNewGroupName(e.target.value)}
          disabled={isEditGroupName}/>
        </h2>:
        <h2>
          <div>
          {currentChat.friend.name}
          </div>
        </h2>} 

        <article className={styles.chatImageWrapper}>

          {currentChat.chatName?
          <img 
          src={currentChat?.image?
               currentChat.image:
               '/images/no-avatarGroup.png'}
          alt={currentChat.chatName}/>:
          <img 
          src={currentChat?.friend.image?
               currentChat.friend.image:
               '/images/no-avatar.png'}
          alt={currentChat.friend.name}/>}

        </article>
        
        </header>
        <section className={styles.membersOfChat}>
          {currentChat.chatName&&memoMembers}
        </section>
    </main>
  )
}

export default EditGroup