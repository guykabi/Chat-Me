import React,{useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import styles from './modal.module.css'
import Button from '../UI/Button/button'

const Modal = ({show,onClose,children,title}) => {
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
    <artic className={styles.overlay} >
       <section className={styles.mainModal} >
           {title?
           <header className={styles.modalHeader}>
               {title}
           </header>:null}
           <main className={styles.modalContent}>
             {children}
           </main>
           <div className={styles.btnWrapper}>
            <Button
            className='primaryBtn'
            text='Close'
            width='10'
            height='15'
            arialable='Close'
            onClick={handleClose}/>
           </div>
       </section>
    </artic>
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