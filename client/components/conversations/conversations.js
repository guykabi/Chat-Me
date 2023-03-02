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


  const {error,isLoading,refetch} = useQuery('conversations',
          ()=>getConversations(currentUser._id),{      
            onSuccess:(data)=>{setAllConversations(data)},
            staleTime:2000
          }) 

  
  useEffect(()=>{
     
    Socket.removeAllListeners('background-message')
    Socket?.on('background-message',(message)=>{
       
      if(!allConversations.length)return
      
      let latestConversation = allConversations
      ?.find(con=>con._id === message.conversation._id)

      if(message.sender === currentUser._id && latestConversation ){ 
         
         let tempArr = [...allConversations]
         let index = tempArr.indexOf(latestConversation)
         tempArr.splice(index,1),tempArr.unshift(latestConversation) 
         
         setAllConversations(tempArr)
         return
      } 
      
      //Fetching new conversations when a message from a new chat is recieved
      if(message.conversation.participants.includes(currentUser._id)){

        //Only the user who isn't the sender will get this refetch of conversations
        refetch()
      }
    })   


    //When a new chat is created
    Socket.on('arrival-conversation',conversation=>{
        
       if(!conversation){
         //When a new conversation with no messages was deleted -
         //fetching updated conversations
         refetch()
         return
       }

        setAllConversations(prev=> [conversation,...prev]) 

        let conPlusFriend;
        if(!conversation.chatName){
           //Adding a friend field to conversation
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