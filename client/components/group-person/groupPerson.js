import React,{useContext} from 'react'
import styles from './groupPerson.module.css'
import { chatContext } from '../../context/chatContext'

const GroupPerson = ({user,onPick,manager,menu,onMenu}) => {
  
  const {currentChat,currentUser} = useContext(chatContext)


const memberOperations = (
    <section className={styles.memberOperationMenu}>
      <div role='button'>Define as manager</div>
      <div role='button'>Remove</div>
    </section>
  )


const handleOpenMenu = () =>{
  if(menu===user._id){
    onMenu(null)
    return
  }
  onMenu(user._id)
}

  return (
    <>
     <article className={styles.personMainDiv} onClick={()=>onPick(user)}>

     {menu===user._id&&memberOperations}

      <div className={styles.userImageWrapper}>
          <img  src={user?.image?user.image:'/images/no-avatar.png'}/>
      </div>
      <div className={styles.userNameWrapper}>

        <section>
         {user?.name} 
        </section>&nbsp;

        {manager&&<span> - Manager</span>}

        {currentUser._id===currentChat?.manager?._id&&
         currentUser._id!==user._id&&
         manager!==undefined&&
        <div 
        className={styles.threeDotsCostum}
        onClick={handleOpenMenu}
        role='button'>
        </div>}

      </div>
     </article>
    </>
  )
} 

export default GroupPerson
