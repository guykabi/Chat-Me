import React,{ useEffect, useState,useContext,useRef} from 'react'
import {chatContext} from '../../context/chatContext'
import styles from './messenger.module.css'
import {io} from 'socket.io-client'
//import {push} from 'next/router'
import Chat from '../../components/chat/chat'
import Conversations from '../../components/conversations/conversations'
import Navbar from '../../components/navbar/navbar'
import OnlineList from '../../components/onlineList/online'
import { getConversations} from '../../utils/apiUtils'
import { exctractCredentials, loginRedirectOnError } from '../../utils/utils'


const Messenger = ({conversations,hasError,user}) => {
    const [socket, setSocket] = useState(null);
    const {currentUser,dispatch} = useContext(chatContext) 
    

    useEffect(()=>{
      if(!currentUser){ 
        dispatch({ type:"CURRENT_USER", payload:user })
      } 
    },[])
     
    
    useEffect(() => {
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);  
      newSocket.emit('addUser',user?._id)
        return () => newSocket.close();
    }, [setSocket]); 


  if(hasError){
   return loginRedirectOnError()
  }
      
  return (
    <div className={styles.messangerWrapper}>
      <Navbar/>
      {currentUser?<div className={styles.innerWrapper}>

          <div className={styles.conversationsWrapper}>
             <h2>Conversations</h2><br/> 
             <Conversations conversations={conversations}/>
          </div>

          <div className={styles.chatWrapper}>
             <Chat socket={socket} uid={user?._id}/>
          </div>

          <div className={styles.onlineWrapper}>
             <h2>Online</h2><br/>
             <OnlineList/>
          </div>

       </div>:<div className='center'>Loading...</div>}
    </div>
  )
} 

export async function getServerSideProps({req}) {

  if(!req.headers.cookie){
    return{props:{hasError:true}}
  }
    const {user,token} = exctractCredentials(req,'accessToken')
    let conversations;

    try{
       conversations = await getConversations(user._id,token)
     }catch(err){
       return {props:{hasError:true}}
    }
     
    return{
      props:{conversations,user}
    }
}

export default Messenger