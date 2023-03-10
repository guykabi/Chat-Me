import React,{useContext, useEffect,useState,memo} from 'react'
import styles from './person.module.css'
import {chatContext} from '../../context/chatContext'
import { setUserStatus , excludeFieldsUserData } from '../../utils/utils'
import { friendRequest,approveFriend,unapproveFriend,removeFriend , createConversation } from '../../utils/apiUtils'
import {useMutation, useQuery} from 'react-query'
import { useGetUser } from '../../hooks/useUser'


const Person = ({user,decreaseNotify}) => { 

const {currentUser,Socket,dispatch} = useContext(chatContext) 
const [personStatus,setPersonStatus]=useState() 
const [toDeclineRequest,setToDeclineRequest]=useState(false)


//React-Query functions for request/cancel-request/add/remove friend or conversation!

const {mutate:friendshipRequest} =useMutation(friendRequest,{
   onSuccess:(data)=>{
      if(data === 'Request has been made!'){

         setPersonStatus('Pending')
         
         //Sending to notify the user about the request he just got!
         let notifyObj = { 
         reciever:user._id, 
         sender:excludeFieldsUserData(currentUser),
         message:'Friend request'}

         Socket.emit('notification',notifyObj)

      }

      if(data === 'Request has been removed!' && personStatus === 'Pending'){

         setPersonStatus('+')

         let notifyObj = {
         reciever:user._id,
         sender:excludeFieldsUserData(currentUser),
         message:data}

         Socket.emit('notification',notifyObj)

      }
   }
})

const {mutate:approveRequest} = useMutation(approveFriend,{
   onSuccess:(data)=>{
     if(data.message === 'The Friend approval has been done'){

      //Checking the correct status of the fresh approved user
      setPersonStatus(setUserStatus(data.user,user))
      dispatch({type:'CURRENT_USER',payload:data.user})
      
      //Send back to navbar to remove approved request from list!
      decreaseNotify()

      let notifyObj = {
      reciever:user._id,
      sender:excludeFieldsUserData(currentUser),
      message:data.message}

      Socket.emit('notification',notifyObj)

     }
   }
}) 


const {mutate:unapprove} = useMutation(unapproveFriend,{
   onSuccess:(data)=>{

     if(data.message = 'Request has been decline!'){
      
      setPersonStatus(setUserStatus(data.user,user))
      setToDeclineRequest(false)
      dispatch({type:'CURRENT_USER',payload:data.user})
      //Send back to navbar to remove rejected request from list!
      decreaseNotify()

      let notifyObj = {
      reciever:user._id,
      sender:excludeFieldsUserData(currentUser),
      message:data.message}

      Socket.emit('notification',notifyObj)

     }
   }
})  


const {mutate:remove} = useMutation(removeFriend,{
  onSuccess:(data)=>{

     if(data.message = 'Friend has been removed!'){

     setPersonStatus('+')
     dispatch({type:'CURRENT_USER',payload:data.user})

    }
  }
})   


const {mutate:newConversation} = useMutation(createConversation,{
  onSuccess:(data)=>{
    if(data === 'Conversation already exist')return
      Socket.emit('new-conversation',currentUser._id,data.conversation)
  }
})


//Triggered by the incoming socket to get user update data
const onSuccess = () =>{
    dispatch({type:'CURRENT_USER',payload:data})
}
const {data,refetch:getUserData} = useGetUser(currentUser._id,false,onSuccess)


useEffect(()=>{
    let status = setUserStatus(currentUser,user)
    setPersonStatus(status)
   
    if(status !== 'Approve')return
     setToDeclineRequest(true)
},[])  



useEffect(()=>{
  
  const eventHandler = (data) =>{  
   
    if(data.message === 'Friend request'){ 
      setPersonStatus('Approve')
      setToDeclineRequest(true)
      getUserData()
    }
    if(data.message === 'Request has been removed!'){
       //If the person declined the user request
       setPersonStatus('+')
       getUserData()
    }
    if(data.message === 'The Friend approval has been done'){
      
      //User just got approved!
      setPersonStatus('Friend') 
      getUserData()
      
   }
   if(data.message === 'Request has been decline!'){
      setPersonStatus('+')
    } 
  } 
    
    Socket.on('incoming-notification',eventHandler)
    return()=> Socket.off('incoming-notification',eventHandler)
  
},[Socket])



 const handlePersonStatusChange = (e) =>{
    e.stopPropagation()
    let obj = {currentUserId:currentUser._id,friendId:user._id}
    if(personStatus === '+'){
      
       //Send friendship request
       friendshipRequest(obj)
       return
    }
    if(personStatus === 'Pending'){

       //Cancelling the friendship request
       friendshipRequest(obj)
       return
    } 
    if(personStatus === 'Approve'){

      //Approve person's friendship request
      approveRequest(obj)
      setToDeclineRequest(false)
      return
    }
    if(personStatus === 'Friend'){
      
      //Unfriend
      remove(obj)
      return
    }

 } 

 const unapproveRequest = (e) =>{
   e.stopPropagation()
   let obj = {currentUserId:currentUser._id,friendId:user._id}
   unapprove(obj)
 } 

 const addConversation = () =>{
  newConversation({userId:currentUser._id,friendId:user._id})
 }

  return (
   <>
    <div  
    className={styles.personWrapper}  
    onMouseDown={(e)=>e.preventDefault()}
    onClick={addConversation}>
    
       <div className={styles.personImageWrapper}>
         <img src={user.image?user.image:'/images/no-avatar.png'}/>
       </div>

       <div className={styles.personNameWrapper}>
          <div>{user.name}</div>
       </div> 
     
       <div className={styles.addSign}>
           {toDeclineRequest&&
           <div 
           className={styles.declineRequestDiv} 
           onClick={unapproveRequest}
           role='button'
           onMouseDown={(e) => e.preventDefault()}>
           Decline
           </div>} 
           <div 
           className={styles.personActionSign}
           role='button'
           onClick={handlePersonStatusChange} 
           onMouseDown={(e) => e.preventDefault()}>
           {personStatus}
           </div>
       </div>

    </div>
    </>
  )
}

export default memo(Person)