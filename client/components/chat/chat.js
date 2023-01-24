import styles from './chat.module.css'
import { useEffect, useState,useRef } from 'react'
import {getCurrentTime} from '../../utils/utils'
import Message from '../message/message'

const Chat = ({socket,uid})=> {
  const [message,setMessage]=useState()
  const [responses,setResponses]= useState([])
  const [room,setRoom]=useState()
  const [isRoom,setIsRoom]=useState(false)
  const scrollRef = useRef() 
  const [fakeReciever,setFakeRecievr]=useState(null)

  useEffect(()=>{
    socket?.on('recieve-message',(data)=>{
        setResponses([...responses,data])
    })
    scrollRef.current?.scrollIntoView({behavior:'smooth',block: 'nearest', inline: 'start' })
  },[socket,responses])

  const handleJoin = ()=>{
    socket.emit('join_room',room)
    setIsRoom(true)
  }

const handleText = ()=>{
  if(!message)return

  let messageObj = {} 
  messageObj.id = uid
  messageObj.text = message
  messageObj.own = true
  messageObj.time = getCurrentTime()

  socket.emit('sendMessage',fakeReciever,messageObj,room)
  setMessage('')
  }

  return (
    <>
    <div className={styles.mainDiv}>
       <div className={styles.chatDiv}>
       <div className={styles.chatBoxHeader}>
       {isRoom?<span>Your are in {room} room</span>:
          <div>
            <input placeholder='Join a room...' 
            onChange={(e)=>setRoom(e.target.value)}/>
            <button onClick={handleJoin}>Join</button>
          </div>}
        </div>

        <div className={styles.chatBoxDiv}>  
          {responses.map((message,index)=>(
            <div key={index} ref={scrollRef}>
               <Message props={message} own={message.id===uid} />
            </div>
          ))}   
        </div>
       <div className={styles.chatBoxBottom}>
          <textarea value={message} 
          className={styles.textAreaInput}
          onChange={(e)=>{setMessage(e.target.value)}}/> &nbsp;
          <button onClick={handleText}>Send</button><br/>
        </div>
      </div>
    </div>
    </>
  )
}
export default Chat