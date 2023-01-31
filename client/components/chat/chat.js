import styles from './chat.module.css'
import { useEffect, useState,useContext} from 'react'
import { chatContext } from '../../context/chatContext'
import {getCurrentTime} from '../../utils/utils'
import {useQuery,useMutation} from 'react-query'
import { getMessages,sendNewMessage } from '../../utils/apiUtils'
import Messages from '../messages/messages'

const Chat = ({socket})=> {
  
  const {currentChat,currentUser} = useContext(chatContext)
  const [newMessage,setNewMessage]=useState('')
  const [messages,setMessages]= useState([])
  const [room,setRoom]=useState(currentChat._id)
  const [isTyping,setIsTyping]=useState(false) 
  const[typingText,setTypingText]=useState(null)


 const {data} = useQuery(['messages',currentChat],()=>(
    getMessages(currentChat?._id)),
 {
  onSuccess:(data)=>{setMessages(data)},
  staleTime:10000
}) 

const {mutate,isError} = useMutation(sendNewMessage)
 
  useEffect(()=>{
    if(newMessage || messages?.length ) 
     setNewMessage('')
     setMessages(data) 
     //setRoom(currentChat._id)
     socket.emit('join_room',room)
  },[currentChat])
  

  useEffect(()=>{
  
    socket.on('user_typing',(data)=>{
      if(data.reciever !== currentUser._id)return
         setTypingText(data.message)
         setIsTyping(true)

         const timer = setTimeout(() => {
          setIsTyping(false)
        }, 1000)
        return () => clearTimeout(timer)
    }) 

    socket.on('recieve-message',(data)=>(
      setMessages(prev =>[...prev,data])
    )) 
   
  },[socket]) 



  useEffect(()=>{
    if(!newMessage)return
    socket.emit('typing',currentChat.friend._id,currentUser.name,room)
  },[newMessage])



const sendMessage = ()=>{
  if(!newMessage || newMessage.trim().length === 0)return

   let messageObj = {} 
   messageObj.conversationId = currentChat._id
   messageObj.sender = currentUser._id
   messageObj.text = newMessage
   messageObj.time = getCurrentTime()
  
   socket.emit('sendMessage',messageObj,room)
   mutate(messageObj)
   setNewMessage('')
  }


  return (
    <>
    <div className={styles.mainDiv}>
       {messages?<div className={styles.chatDiv}>

         <div className={styles.chatBoxHeader}>

            <span className={styles.imageWrapper}>

               {!currentChat.friend.image?<img src={currentChat.friend.image?
               currentChat.friend.image:'/images/no-avatar.png'}/>
               :
               <img src={currentChat.image?
               currentChat.image:'/images/no-avatarGroup.png'}/>}

            </span>

            <div className={styles.friendName}>{currentChat?.friend.name}</div>
            {isTyping&&<div className={styles.typingDiv}>{typingText}</div>}
            <span className='threeDots'></span>
         </div>

         <div className={styles.chatBoxDiv}>  
                 <Messages socket={socket} messages={messages} />
         </div>

         <div className={styles.chatBoxBottom}>
            <textarea 
            value={newMessage} 
            className={styles.textAreaInput}
            onChange={(e)=>setNewMessage(e.target.value)}/> &nbsp;
            <button onClick={sendMessage}>Send</button><br/> 
         </div>

       </div>:<div className='center'>Couldn't get messages,try again</div>}
    </div>
  </>
  )
} 


export default Chat