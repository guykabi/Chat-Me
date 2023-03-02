import React,{ useEffect,useContext} from 'react'
import {chatContext} from '../../context/chatContext'
import styles from './messenger.module.css'
import Chat from '../../components/chat/chat'
import Conversations from '../../components/conversations/conversations'
import Navbar from '../../components/navbar/navbar'
import OnlineList from '../../components/onlineList/online'
import { exctractCredentials, onError } from '../../utils/utils'
import { useGetUser } from '../../hooks/useUser'


const Messenger = ({hasError,user}) => {
    
    const {currentUser,currentChat,Socket,dispatch} = useContext(chatContext)
    const {data,error} = useGetUser(user._id) 
  
    useEffect(()=>{
      
      if(!currentUser && data){ 
        dispatch({ type:"CURRENT_USER", payload:data })
       } 

      if(!currentUser) return
         Socket?.emit('addUser',user._id)

    },[data,currentUser])
      
   
  if(hasError || error){
    if(error)return onError('Connection problem...')
    
    //When no token provided 
    return onError()
  } 

      
  return (
    <>
    {currentUser?<div className={styles.messangerWrapper}>
      <Navbar/>
      <div className={styles.innerWrapper}>

          <div className={styles.conversationsWrapper}>
             <span className='threeDots'></span>
             <h2>Conversations</h2><br/> 
             <Conversations/>
          </div>

          <div className={styles.chatWrapper}>
             {currentChat?<Chat/>:
             <div className={styles.noChatDiv}>
             Open chat to start talk...
             </div>}
          </div>

          <div className={styles.onlineWrapper}>
             <h2>Online</h2><br/>
             <OnlineList/>
          </div>

       </div>
    </div>:<div className='center'><h2>Loading...</h2></div>}
   </>
  )
} 

export async function getServerSideProps({req}) {

  if(!req.headers.cookie){
    return{props:{hasError:true}}
  }
    const user = exctractCredentials(req) 
     
    return{
      props:{user}
    }
}

export default Messenger