import React,{useEffect,useMemo, useState,useContext} from 'react'
import styles from './conversations.module.css'
import Conversation from '../conversation/conversation'
import { chatContext} from '../../context/chatContext'
import { getConversations } from '../../utils/apiUtils'
import {useQuery} from 'react-query'
import { needToReSign,loginRedirectOnError } from '../../utils/utils'


const Conversations = () => { 
   
  const [allConversations,setAllConversations]=useState(null)
  const {currentUser,Socket} = useContext(chatContext)

  const {error,isLoading} = useQuery('conversations',
          ()=>getConversations(currentUser._id),{
            onSuccess:(data)=>{setAllConversations(data)}
          },{refetchInterval:30000}) 

  
  useEffect(()=>{
    Socket?.on('background-message',(message)=>{

      if(!allConversations)return
      let item = allConversations?.find(con=>con._id === message.conversationId)
      
      if(message.sender === currentUser._id || item ){ 
         let tempArr = [...allConversations]
         let index = tempArr.indexOf(item)
         tempArr.splice(index,1),tempArr.unshift(item)
         setAllConversations(tempArr)
      }

    })
},[Socket,allConversations]) 


if(error){
  if(error?.response?.status === 401){
        return needToReSign(currentUser.name)
  }
  return loginRedirectOnError('Connection error...')
}


  const renderedCons =useMemo(()=>allConversations?.map((con)=>(
    <Conversation key={con._id} {...con}/>
)),[allConversations])


  return (
    <div className={styles.conversationsDiv}> 
     <div className={styles.searchInputWrapper}>
        <input type='text' placeholder='Search for chat...'/>
     </div>
     {isLoading?
     <div><strong>Loading conversations...</strong></div>:
     <div className={styles.allConversationsWrapper}>
     {renderedCons}
     </div>}
    </div>
  )
}

export default Conversations