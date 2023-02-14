import React,{useContext, useEffect,useRef,memo, useState,useMemo} from 'react'
import { needToReSign,loginRedirectOnError } from '../../utils/utils'
import styles from './messages.module.css'
import Message from '../message/message'
import { chatContext } from '../../context/chatContext'
import {useQuery} from 'react-query'
import {getMessages} from '../../utils/apiUtils'


const Messages = ({messages}) => {
  
    const {currentUser,currentChat,Socket} = useContext(chatContext)
    const scrollRef = useRef()
    const [allMessages,setAllMessages]=useState()  
    const [amountToSkip,setAmountToSkip]=useState(30)
    const[isMoreMessages,setIsMoreMessages]=useState()

     
    const {refetch:loadMore,error} = useQuery(['more-messages',currentChat],()=>(
      getMessages(currentChat?._id,amountToSkip)),
   {
    onSuccess:(data)=>{   
      
      if(data.length){
           let reverseMessages = [...data].reverse()
           setAllMessages(prev=> [...reverseMessages, ...prev])
        
         if(data.length === 30){
           setAmountToSkip(prev=>prev+=30)
         }

         if(data.length < 30){
           setIsMoreMessages(false)
          }
          
       }
    }, 
    enabled:false
  })   

   
   useEffect(()=>{
    if(!messages)return
      setAllMessages(messages)
      setIsMoreMessages(true)
      //Reset the amount when switching chats
      if(!(amountToSkip > 30))return
      setAmountToSkip(30)
   },[messages])


   useEffect(()=>{
    
      Socket.removeAllListeners('recieve-message')
      Socket.on('recieve-message',({message})=>{
     
      //In order to avoid messages duplication - 
      //increase the amouint of documnets to skip on
      setAmountToSkip( prev => prev += 1)
      setAllMessages(prev =>[...prev,message])

      }) 
   },[Socket])
  


    useEffect(()=>{    
      if(!isMoreMessages)return
        scrollRef.current?.scrollIntoView({
        behavior:'smooth',
        block: 'start',
        inline: 'nearest' 
      })   
    },[allMessages]) 

  

    const handleMoreLoading =(e)=>{
        if(e.target.scrollTop === 0 && isMoreMessages){
          loadMore()
        }
      } 


      if(error){
        if(error?.response?.status === 401){
          return needToReSign(currentUser.name)
         }
        return loginRedirectOnError()
      }
      
    const memoMessages = useMemo(()=>allMessages,[allMessages])
   
  return (
    <>
     <div className={styles.messagesDiv} onScroll={handleMoreLoading} >  
     {memoMessages?.map((message)=>(
        <div key={message._id} ref={scrollRef}>
              <Message message={message} own={message.sender===currentUser._id} />
        </div>))}
     </div>
    </>
  )
}

export default memo(Messages)