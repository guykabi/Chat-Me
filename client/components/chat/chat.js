import styles from './chat.module.css'
import { useEffect, useState,useContext} from 'react'
import { needToReSign,onError } from '../../utils/utils'
import { chatContext} from '../../context/chatContext'
import {useQuery,useMutation} from 'react-query'
import { getMessages,sendNewMessage } from '../../utils/apiUtils'
import Messages from '../messages/messages'
import { Loader } from '../UI/clipLoader/clipLoader'
import InputEmoji from "react-input-emoji";
import Button from '../UI/Button/button'
import EditGroup from '../chatDetails/chatDetails'
import Modal from '../Modal/modal'



const Chat = ()=> {
  
  const {currentChat,currentUser,Socket} = useContext(chatContext)
  const [showModal,setShowModal]=useState(false)
  const [newMessage,setNewMessage]=useState('')
  const [messages,setMessages]= useState([])
  const [room,setRoom]=useState(currentChat._id)
  const [isTyping,setIsTyping]=useState(false) 
  const [typingText,setTypingText]=useState(null)
  const [isEditGroup,setIsEditGroup]=useState(false)

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
    new Audio('/assets/notifySound.mp3').play()
  }
}) 


  useEffect(()=>{

    if(newMessage || messages?.length ) {
     setNewMessage('')
     setMessages(data) 
    }

     setRoom(currentChat._id)
     Socket.emit('join_room',currentChat._id) 

     if(!isEditGroup)return
     setIsEditGroup(false)
      
  },[currentChat]) 

  
  useEffect(()=>{
    //Notifying that user is typing
    if(!newMessage)return
    let sender = currentUser._id
    Socket.emit('typing',sender,currentUser.name,room)

  },[newMessage])

 
  useEffect(()=>{
    //Listens to user's typing
    Socket.on('user_typing',(data)=>{
       
      if(data.sender === currentUser._id || data.room !== currentChat._id)return
         setTypingText(data.message)
         setIsTyping(true)

         const timer = setTimeout(() => {
          setIsTyping(false)
        }, 1000)
        return () => clearTimeout(timer)
    })  

    return () => Socket.off('user_typing')

  },[Socket,currentChat,currentUser])


  
const handleNewMessage = ()=>{
  if(!newMessage || newMessage.trim().length === 0)return

   let messageObj = {} 
   messageObj.conversation = currentChat._id
   messageObj.sender = currentUser._id
   messageObj.text = newMessage
   messageObj.seen = false
   
   sendMessage(messageObj)
   setNewMessage('')
  }  

const handleImage = (currentChat?.friend?
    <img 
    src={currentChat.friend?.image?
    currentChat.friend?.image:'/images/no-avatar.png'}
    alt={currentChat.friend?.image?
    currentChat.friend.image:'no-avatar.png'}
    onClick={()=>setShowModal(true)}/>:

    <img src={currentChat?.image?
    currentChat?.image:'/images/no-avatarGroup.png'}
    alt={currentChat?.image?
    currentChat.image:'no-avatarGroup.png'}
    onClick={()=>setShowModal(true)}/>)



  if(error){
    if(error?.response?.status === 401){
      return needToReSign(currentUser.name)
     }
    
    return onError()
  } 
  

  return (
    <>
    <div className={styles.mainDiv}>
      
       <main className={styles.chatDiv}>

         <Modal 
         show={showModal} 
         onClose={()=>setShowModal(false)}
         >
          <div className={styles.modalImageWrapper}>
          {handleImage}
          </div>
         </Modal>

         {isEditGroup?
          <section className={styles.editGroupSection}>
           <EditGroup onReturn={()=>setIsEditGroup(false)}/>
          </section>:
          <section className={styles.chatBoxHeader}>

            <span className={styles.imageWrapper}>
                 {handleImage}               
            </span>
            
            <div 
            className={styles.friendName} 
            onClick={()=>setIsEditGroup(!isEditGroup)}>

              {currentChat?.friend?
              currentChat.friend?.name:
              currentChat.chatName}

            </div> 
              {isTyping&&
              <div className={styles.typingDiv}>{typingText}</div>}
              <span className='threeDots'></span>
              
         </section>}

         <main className={styles.chatBoxDiv} >  
                 {messages?.length?
                 <Messages messages={messages}/>:null}

                 {isLoading&&
                  <div className={styles.loadingMessages}>
                  <div>Loading messages...</div>
                  <Loader size={20}/>
                  </div>}
         </main>

         <footer className={styles.chatBoxBottom}>
            <div className={styles.inputEmojiWrapper}>
              <InputEmoji
              value={newMessage}
              onChange={setNewMessage}
              width={40}
              height={15}
              placeholder="Type a message..."
              borderRadius={10}
              />
            </div>
           
              <Button 
              className={'secondaryBtn'}
              width={10}
              height={35}
              text='Send'
              arialable='Send message'
              onClick={handleNewMessage}/>
            
         </footer>

       </main>
    </div>
  </>
  )
} 


export default Chat