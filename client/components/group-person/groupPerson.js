import React,{useContext} from 'react'
import styles from './groupPerson.module.css'
import { chatContext } from '../../context/chatContext'

const GroupPerson = (props) => {
   const {
    user,
    onPick,
    onRemove,
    onAddManager,
    onRemoveManager,
    manager,
    menu,
    onMenu} = props
    const {currentChat,currentUser} = useContext(chatContext)


const handleOpenMenu = (e) =>{
  e.stopPropagation();
  if(menu===user._id){
    onMenu(null)
    return
  }
  onMenu(user._id)
} 

const handlePick = (e) =>{
  e.stopPropagation();
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
  <section className={styles.memberOperationMenu}>

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
     onClick={handlePick}>

     {menu===user._id&&memberOperations}

      <div className={styles.userImageWrapper}>
          <img  src={user?.image?user.image:'/images/no-avatar.png'}/>
      </div>

      <div className={styles.userNameWrapper}>

        <section>
         {user?.name} 
        </section>&nbsp;

        {manager?<span> - Manager</span>:null}

        {currentChat?.manager.some(m=>m._id === currentUser._id)&&
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
