import React,{useContext, useEffect, useState} from 'react'
import styles from './notification.module.css'
import { chatContext } from '../../context/chatContext'
import { useMutation } from 'react-query'
import {excludeFieldsUserData, exctractCredentials} from '../../utils/utils'
import { approveFriend , unapproveFriend } from '../../utils/apiUtils'


const Notification = ({notification,decreaseNotify}) => {
 const {currentUser,dispatch,Socket} = useContext(chatContext)
 const [isRequest,setIsRequest]=useState(true)


  const {mutate:approveRequest} = useMutation(approveFriend,{
    onSuccess:({message,user})=>{
     
      if(message !== 'The Friend approval has been done')return
      dispatch({type:'CURRENT_USER',payload:user})
        
      //Send back to navbar to remove approved request from list!
      decreaseNotify()
      
      let notifyObj = {
      reciever:notification.sender._id,
      sender:excludeFieldsUserData(currentUser),
      message}
      
      Socket.emit('notification',notifyObj) 
    }
  
  })

  const {mutate:unapprove} =  useMutation(unapproveFriend,{
    onSuccess:({message,user})=>{
  
      if(message !== 'Request has been decline!')return
      dispatch({type:'CURRENT_USER',payload:user})
        
      //Send back to navbar to remove declined request from list!
      decreaseNotify()
      
      let notifyObj = {
      reciever:notification.sender._id,
      sender:excludeFieldsUserData(currentUser),
      message}
    
      Socket.emit('notification',notifyObj) 
    }
  
  })  

  useEffect(()=>{
    if(notification.message === 'Friend request')return
       setIsRequest(false)
  },[])


 const handleApprove = () =>{
  let obj = {currentUserId:currentUser._id,friendId:notification.sender._id}
  approveRequest(obj)
 } 

 const handleDecline = () =>{
  let obj = {currentUserId:currentUser._id,friendId:notification.sender._id}
  unapprove(obj)
 }
   
  return (
    <div className={styles.notificationMainDiv}>

      <div className={styles.notifyPersonImgWrapper}>
        <img
         className={styles.notifyPersonImg} 
         src={notification.sender.image?
         notification.sender.image:
         '/images/no-avatar.png'}/>
      </div>
     
        {notification.sender.name} {notification.message}
        {isRequest&&
        <div className={styles.notificationButtonsDiv}>
         <button 
         onClick={handleDecline}>
         Decline
         </button>

         <button 
         onClick={handleApprove}>
         Approve
         </button>
        </div>}
   
    </div>
  )
}

export default Notification