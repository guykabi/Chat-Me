import React,{useEffect,useMemo, useState,useContext} from 'react'
import styles from './conversations.module.css'
import Conversation from '../conversation/conversation'
import { chatContext} from '../../context/chatContext'
import { getConversations } from '../../utils/apiUtils'
import {useQuery} from 'react-query'
import { needToReSign,onError,handleChatFriendField } from '../../utils/utils'


const Conversations = () => { 
   
  const {currentUser,dispatch,Socket} = useContext(chatContext)
  const [allConversations,setAllConversations]=useState([])


  const {error,isLoading} = useQuery('conversations',
          ()=>getConversations(currentUser._id),{
            onSuccess:(data)=>{setAllConversations(data)},
            staleTime:5000
          }) 

  
  useEffect(()=>{
     
    //Placing incoming conversation at the top of the list
    Socket.removeAllListeners('background-message')
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


    //When a new chat is created
    Socket.on('arrival-conversation',conversation=>{
        setAllConversations(prev=> [conversation,...prev]) 
        let conPlusFriend;
        if(!conversation.chatName){
         conPlusFriend =  handleChatFriendField(conversation,currentUser._id)
        }

        dispatch({type:'CURRENT_CHAT',payload:conPlusFriend})
    })
    return () => Socket.off('arrival-conversation')

},[Socket,allConversations]) 



if(error){
  if(error?.response?.status === 401){
        return needToReSign(currentUser.name)
  }
  return onError('Connection error...')
}


  const memoCons =useMemo(()=>allConversations?.map((con)=>(
    <Conversation key={con._id} con={con} />
  )),[allConversations])


  return (
    <div className={styles.conversationsDiv}> 
     <div className={styles.searchInputWrapper}>
        <input type='text' placeholder='Search for chat...'/>
     </div>
     {isLoading?
     <div><strong>Loading conversations...</strong></div>:
     <div className={styles.allConversationsWrapper}>
     {memoCons}
     </div>}
    </div>
  )
}

export default Conversations