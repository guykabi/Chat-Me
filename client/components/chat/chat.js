import styles from './chat.module.css'
import { useEffect, useState,useContext} from 'react'
import { needToReSign,onError } from '../../utils/utils'
import { chatContext} from '../../context/chatContext'
import {useQuery,useMutation} from 'react-query'
import { getMessages,sendNewMessage } from '../../utils/apiUtils'
import Messages from '../messages/messages'
import { Loader } from '../UI/clipLoader/clipLoader'


const Chat = ()=> {
  
  const {currentChat,currentUser,Socket} = useContext(chatContext)
  const [newMessage,setNewMessage]=useState('')
  const [messages,setMessages]= useState([])
  const [room,setRoom]=useState(currentChat._id)
  const [isTyping,setIsTyping]=useState(false) 
  const [typingText,setTypingText]=useState(null)


 const {data,error,isLoading} = useQuery(['messages',currentChat],()=>(
    getMessages(currentChat?._id)),
  {
    onSuccess:(data)=>{
      setMessages(data.reverse())
    }, 
    staleTime:2000,
    refetchOnWindowFocus:false
 }) 
 

const {mutate:sendMessage,isError} = useMutation(sendNewMessage,{
  onSuccess:({message,data})=>{
    
    if(message !== 'New message just added')return
    Socket.emit('sendMessage',data,room)
  }
}) 


  useEffect(()=>{

    if(newMessage || messages?.length ) {
     setNewMessage('')
     setMessages(data) 
    }
     setRoom(currentChat._id)
     Socket.emit('join_room',currentChat._id) 
      
  },[currentChat]) 

  
  useEffect(()=>{
    //Notifying that user is typing
    if(!newMessage)return
    let reciever = currentChat.friend._id
    Socket.emit('typing',reciever,currentUser.name,room)

  },[newMessage])

 
  useEffect(()=>{
    //Listens to user's typing
    Socket.on('user_typing',(data)=>{
    
      if(data.reciever !== currentUser._id || data.room !== currentChat._id)return
         setTypingText(data.message)
         setIsTyping(true)

         const timer = setTimeout(() => {
          setIsTyping(false)
        }, 1000)
        return () => clearTimeout(timer)
    })  

  },[Socket])


  
const handleNewMessage = ()=>{
  if(!newMessage || newMessage.trim().length === 0)return

   let messageObj = {} 
   messageObj.conversation = currentChat._id
   messageObj.sender = currentUser._id
   messageObj.text = newMessage
   messageObj.seen = false

  //Condition if its the first message of that chat... 
   sendMessage(messageObj)
   setNewMessage('')
  }  


  if(error){
    if(error?.response?.status === 401){
      return needToReSign(currentUser.name)
     }
    
    return onError()
  } 
  

  return (
    <>
    <div className={styles.mainDiv}>
       <div className={styles.chatDiv}>

         <div className={styles.chatBoxHeader}>

            <span className={styles.imageWrapper}>

               {!currentChat.friend?.image?<img src={currentChat.friend?.image?
               currentChat.friend?.image:'/images/no-avatar.png'}/>
               :
               <img src={currentChat?.image?
               currentChat?.image:'/images/no-avatarGroup.png'}/>}

            </span>

            <div className={styles.friendName}>
              {currentChat?.friend?
              currentChat.friend?.name:
              currentChat.chatName}
            </div> 
              {isTyping&&<div className={styles.typingDiv}>{typingText}</div>}
              <span className='threeDots'></span>
         </div>

         <div className={styles.chatBoxDiv} >  
                 {messages.length?<Messages messages={messages}/>:null}
                 {isLoading&&
                  <div className={styles.loadingMessages}>
                  <div>Loading messages...</div>
                  <Loader size={20}/>
                  </div>}
         </div>

         <div className={styles.chatBoxBottom}>
            <textarea 
            dir='auto'
            value={newMessage} 
            className={styles.textAreaInput}
            onChange={(e)=>setNewMessage(e.target.value)}/> &nbsp;
            <button onClick={handleNewMessage}>Send</button><br/> 
         </div>

       </div>
    </div>
  </>
  )
} 


export default Chat