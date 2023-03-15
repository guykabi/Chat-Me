import React,{useEffect,useMemo, useState,useContext} from 'react'
import styles from './conversations.module.css'
import Conversation from '../conversation/conversation'
import { chatContext} from '../../context/chatContext'
import { getConversations } from '../../utils/apiUtils'
import {useQuery} from 'react-query'
import { needToReSign,onError,handleChatFriendField,handleFilterCons } from '../../utils/utils'


const Conversations = () => { 
   
  const {currentUser,dispatch,Socket} = useContext(chatContext)
  const [allConversations,setAllConversations]=useState([])
  const [query,setQuery]=useState("")

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

      if(!conversation.participants.find(p=>p._id === currentUser._id))return
        
        setAllConversations(prev=> [conversation,...prev]) 

       
      if( //If the current user is the manager or the creator of the new conversation
      conversation.manager._id === currentUser._id  ||
      conversation.participants[0] === currentUser._id
      ){
        
        let conPlusFriend;
        if(!conversation.chatName){
           //Adding a friend field to conversation
           let friend = conversation.participants.find(p=>p._id !== currentUser._id)
           conPlusFriend = handleChatFriendField(conversation,friend)
        }
        
        dispatch({type:'CURRENT_CHAT',payload:conPlusFriend?conPlusFriend:conversation})
      }
    })

    return () => Socket.off('arrival-conversation')

},[Socket,currentUser,allConversations]) 


if(error){
  if(error?.response?.status === 401){
        return needToReSign(currentUser.name)
  }
  return onError('Connection error...')
}


const filteredConversations = useMemo(()=>(
       handleFilterCons(allConversations,query)      
),[allConversations,query]) 

const memoCons =filteredConversations.map((con)=>(
     <Conversation key={con._id} con={con} />
))


  return (
    <>
     <div className={styles.conversationsDiv}> 
     <div className={styles.searchInputWrapper}>
         <input 
         type='text' 
         placeholder='Search for chat...'
         onChange={(e)=>setQuery(e.target.value)}
         />
      </div>
      {isLoading?
       <title><strong>Loading conversations...</strong></title>:
       <section className={styles.allConversationsWrapper}>
       {memoCons}
       </section>}
     </div>
   </>
  )
}

export default Conversations 