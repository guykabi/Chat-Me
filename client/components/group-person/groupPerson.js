import React,{useContext,memo} from 'react'
import styles from './groupPerson.module.css'
import noAvatar from '../../public/images/no-avatar.png'
import useClickOutSide from '../../hooks/useClickOutside'
import Image from 'next/image'
import { chatContext } from '../../context/chatContext'
import { handleSeenTime } from '../../utils/utils'
import { FcLike } from "react-icons/fc";


const GroupPerson = (props) => {
   const {
    user,
    onPick,
    onRemove,
    onAddManager,
    onRemoveManager,
    manager,
    isLike,
    time} = props
    const {currentChat,currentUser} = useContext(chatContext)
    const { visibleRef, isVisible, setIsVisible } = useClickOutSide(false);

   const managerOption = (
    currentChat?.manager.some(m=>m._id === currentUser._id)&&
    currentUser._id!==user._id&&
    manager!==undefined) 

    

const handlePick = (e) =>{
  e.stopPropagation();
  if(manager)return 
  onPick(user)
} 


const handleRemoval = (e) =>{
  e.stopPropagation();
  onRemove(user._id)
}

const handleAddManager = (e) =>{
  e.stopPropagation();
  onAddManager(user._id)
}

const handleRemoveManager = (e) =>{
  e.stopPropagation();
  onRemoveManager(user._id)
}

const memberOperations = (
  <section className={styles.memberOperationMenu} ref={visibleRef}>

    {manager?
    <div 
    role='button' 
    onClick={handleRemoveManager}
    >Remove manager</div>:
    <div 
    role='button' 
    onClick={handleAddManager}
    >Define as manager</div>}

    <div 
    role='button' 
    onClick={handleRemoval}
    >Remove</div>

  </section>
)

  return (
    <>
     <article className={styles.personMainDiv} 
     onClick={onPick?handlePick:null}>

     {isVisible&&memberOperations}

      <div className={styles.userImageWrapper}>
          <Image 
           width={30}
           height={30}
           style={{borderRadius:'50%'}}
           src={user?.image?user.image.url:noAvatar}
           alt={user.name}
          />
      </div>

      <div className={styles.userNameWrapper}>

        <section>
         {user?.name} 
        </section>&nbsp;

        {manager?<span> - Manager</span>:null}
        {time?<div className={styles.seenTime}>
        {handleSeenTime(time.createdAt)}
        </div>:null}
        {isLike?<div className={styles.likeSign}>
        <FcLike/>
        </div>:null}
        {managerOption&&
        <div 
        className={styles.threeDotsCostum}
        onClick={()=>setIsVisible(!isVisible)}
        role='button'>
        </div>}

      </div>
      
     </article>
    </>
  )
} 

export default memo(GroupPerson)
