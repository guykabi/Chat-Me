import React,{useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import styles from './modal.module.css'
import {AiOutlineCloseCircle} from 'react-icons/ai'

const Modal = ({show,onClose,children,title,isError,isFileMessage}) => {
    const [onMount,setOnMount]=useState(false)

useEffect(()=>{
  setOnMount(true)
},[]) 

const handleClose = (e) =>{
  e.preventDefault()
  onClose()
}

const modalContent = show ? (
    <>
    <article className={styles.overlay} > 

       <section className={styles.mainModal} >
       
       {isFileMessage?<div 
        className={styles.deleteSign}
        onClick={handleClose}>
       <AiOutlineCloseCircle/>
       </div>:null}

       {!isError||!isFileMessage?<div 
       className={styles.deleteModalSign}
       role='button'
       onClick={handleClose}>
      <AiOutlineCloseCircle/>
      </div>:null}
           {title?
           <header className={styles.modalHeader}>
               {title}
           </header>:null}
           <main className={styles.modalContent}>
             {children}
           </main>
       </section>
    </article>
   </>):null
 

 if(onMount){
     return ReactDOM.createPortal(
         modalContent,
         document.getElementById('modal-root')
     ) 
  } else{
  return null
 }

}


export default Modal