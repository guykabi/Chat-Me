import React,{ useEffect, useState,useContext,useRef} from 'react'
import {chatContext} from '../../context/chatContext'
import styles from './messenger.module.css'
import {io} from 'socket.io-client'
import Chat from '../../components/chat/chat'
import Conversations from '../../components/conversations/conversations'
import Navbar from '../../components/navbar/navbar'
import OnlineList from '../../components/onlineList/online'
import { getConversations} from '../../utils/apiUtils'
import { useQuery } from 'react-query'
import { exctractCredentials, loginRedirectOnError,needToReSign } from '../../utils/utils'


const Messenger = ({hasError,user,tokens}) => {
    const [socket, setSocket] = useState(null);
    const {currentUser,currentChat,dispatch} = useContext(chatContext) 
    
    const {data:conversations,error} = useQuery('conversations',
          ()=>getConversations(user._id,tokens),{refetchInterval:30000}) 

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


  //When no token provided
  if(hasError){
   return loginRedirectOnError()
  } 

  if(error){
    if(error?.response?.data?.message === 'Failed to authenticate refresh token'){
          return needToReSign(user.name)
    }
    return loginRedirectOnError('Connection error...')
  }
      
  return (
    <div className={styles.messangerWrapper}>
      <Navbar/>
      {currentUser?<div className={styles.innerWrapper}>

          {conversations&&<div className={styles.conversationsWrapper}>
            <span className='threeDots'></span>
             <h2>Conversations</h2><br/> 
             <Conversations conversations={conversations}/>
          </div>}

          <div className={styles.chatWrapper}>
             {currentChat?<Chat socket={socket}/>:
             <div className={styles.noChatDiv}>Open chat to start talk...</div>}
          </div>

          <div className={styles.onlineWrapper}>
             <h2>Online</h2><br/>
             <OnlineList socket={socket}/>
          </div>

       </div>:<div className='center'><h2>Loading...</h2></div>}
    </div>
  )
} 

export async function getServerSideProps({req}) {

  if(!req.headers.cookie){
    return{props:{hasError:true}}
  }
    const {user,tokensObj} = exctractCredentials(req)
    /*let conversations;

    try{
       conversations = await getConversations(user._id,tokensObj)
     }catch(err){
       return {props:{hasError:true}}
    }*/
     
    return{
      props:{user,tokens:tokensObj}
    }
}

export default Messenger