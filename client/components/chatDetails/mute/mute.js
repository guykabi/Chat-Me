import React,{useContext, useEffect, useState} from 'react'
import { toast } from 'react-toastify';
import styles from './mute.module.css'
import {useMutation} from 'react-query'
import {chatContext} from '../../../context/chatContext'
import {muteConversation} from '../../../utils/apiUtils'
import {GoUnmute, GoMute} from 'react-icons/go'


const Mute = () => {

  const {currentUser,currentChat,dispatch} = useContext(chatContext)
  const [isMute,setIsMute]=useState()

  const {mutate:muteChat} = useMutation(muteConversation,{
     onSuccess:data=>{
        setIsMute(data.mute)
        dispatch({type:'USER_FIELD',payload:data.user})
     },
     onError: () => toast.error('Unable to mute/unmute',{
        position:'top-center',
        theme:'colored'
      })
  })  


 useEffect(()=>{
  let isMute = currentUser?.mute?.some(chat=>chat === currentChat._id)
  setIsMute(isMute)
 },[]) 


const handleMuteChat = () =>{
    let body = {mute:currentChat._id} 
    muteChat({userId:currentUser._id,body})
}

  return (
    <>
    <div className={styles.muteWrapper}>
      {isMute?
      <GoMute size={20} onClick={handleMuteChat}/>:
      <GoUnmute size={20} onClick={handleMuteChat}/>}
    </div>
    </>
  )
}

export default Mute