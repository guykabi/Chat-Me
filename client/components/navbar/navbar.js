import React, { useState,useContext, useMemo, useEffect } from 'react'
import styles from './navbar.module.css'
import {push} from 'next/router'
import { logOut,searchUser } from '../../utils/apiUtils'
import {useQuery,useMutation} from 'react-query'
import {chatContext} from '../../context/chatContext'
import Person from '../person/person'
import {Loader} from '../UI/clipLoader/clipLoader'
import Notification from '../notification/notification'
import NotificationIcon from '../UI/notificationIcon/notificationIcon'
import { useGetUser } from '../../hooks/useUser'


const Navbar = () => {
  const {currentUser,Socket,dispatch} = useContext(chatContext)
  const [isMenu,setIsMenu]=useState(false)
  const [isSearching,setIsSearching]=useState(false) 
  const [searchedUser,setSearchedUser]=useState()
  const [allUsers,setAllUsers]=useState(null)
  const [noUserFound,setNoUserFound]=useState(false)
  const [notifications,setNotifications]=useState()
  const [numOfNotifications,setNumOfNotifications]=useState(0)
  const [openNotifications,setOpenNotifications]=useState(false)
   

  const {mutate:search,error,isLoading} = useMutation(searchUser,{
      onSuccess:(data)=>{
        if(!data.length || data[0]._id === currentUser._id){
           setAllUsers(null)
           setNoUserFound(true)
           return
        } 
        setAllUsers(data)
    }}) 


  const onSuccess = ()=>{
    if(!currentUser)return
      dispatch({type:'CURRENT_USER',payload:data})
   } 

  const {data,refetch:getUserData} = useGetUser(currentUser?._id,false,onSuccess)
  

  const{isError,refetch} = useQuery('logout',logOut,{
      onSuccess:(data)=>{
        if(data.message === 'User logged out successfully'){
          dispatch({type:'CURRENT_USER',payload:null}),
          Socket.close()
          push('/login')
  }},enabled: false})   
    

  useEffect(()=>{    
     setNotifications(currentUser.notifications)
     setNumOfNotifications(currentUser.notifications.length)
  },[])
  


 useEffect(()=>{
  if(noUserFound) setNoUserFound(false)

  if(!searchedUser){
    setAllUsers(null)
    setIsSearching(false) 
    return
  }

   setIsSearching(true)//To show all the search results
   let obj= {userName:searchedUser}
    const timer = setTimeout(()=>{
      search(obj)
    },400)
    return () => clearTimeout(timer)
   
 },[searchedUser])  

 

 useEffect(()=>{

  const eventHandler = (data)=>{  

     getUserData()
    //Removing the friendship request notification
    if(data.message === 'Request has been removed!'){
         
         let filteredNotifications = notifications.
         filter(noti => noti.sender === data.sender)
         
         setNotifications(filteredNotifications)
         
         if(numOfNotifications < 1) return
          setNumOfNotifications(prev=>prev-=1)
         
         return

     } 

     if(data.message === 'The Friend approval has been done'){
      data.message = 'approved your friend request'
      setNotifications(prev=>[...prev,data])
      setNumOfNotifications(prev=>prev+=1)
     }
      
     if(data.message !== 'Friend request')return
      
      setNotifications(prev=>[...prev,data])
      setNumOfNotifications(prev=>prev+=1)

    } 

    Socket?.on('incoming-notification',eventHandler) 
    return()=> Socket?.off('incoming-notification',eventHandler)

   },[Socket,notifications,currentUser])


 const serachInputOnFocus = () =>{
  getUserData() 

  if(!searchedUser)return 
  setIsSearching(true)
  let obj= {userName:searchedUser}
  search(obj)
 } 

 const serachInputOnBlur = () =>{
    setIsSearching(false)
    getUserData()
 }


const handleNotification = () =>{
   setOpenNotifications(!openNotifications)
   if(numOfNotifications > 0) setNumOfNotifications(0)

   if(openNotifications){
      //If there 'approved request' notification (unsaved/temporary)
      let unSavedNotifications = notifications
      .filter(n=> n.message !== 'approved your friend request')

      setNotifications(unSavedNotifications)
   }

   if(isMenu && !openNotifications)setIsMenu(false)
}  

const decreaseNotify = () =>{

  let filteredNotifications = notifications.
  filter(noti => noti.sender === data.sender)
  setNotifications(filteredNotifications)  

  if(numOfNotifications < 1)return   
  setNumOfNotifications(prev=>prev-=1)
} 


const handleSideMenu = () =>{
  setIsMenu(!isMenu)
  
  if(!openNotifications)return 
  
  let unSavedNotifications = notifications
  .filter(n=> n.message !== 'approved your friend request')
  setNotifications(unSavedNotifications)

  setNumOfNotifications(0)
  setOpenNotifications(false)
}

 
const memoUsers = useMemo(()=>
  allUsers?.filter(user=>user._id !== currentUser._id)?.map((user)=>(
  <Person key={user._id} user={user} decreaseNotify={decreaseNotify}/>
)),[allUsers,currentUser])


const notis = notifications?.map((notif,index)=>(
  <Notification key={index} notification={notif} decreaseNotify={decreaseNotify}/>
)) 

        
    
  return (
    <nav className={styles.mainNav}>
        <div className={styles.logo} role='banner'>Next chat</div>

        <div className={styles.searchInput}>
          <input 
          type='text'
          placeholder='Find new friend to chat with...' 
          onFocus={serachInputOnFocus}
          onChange={(e)=>setSearchedUser(e.target.value)}
          onBlur={serachInputOnBlur}
          />
  
          {isSearching&&
          <div className={styles.foundPersons}> 
          {noUserFound?
           <div className={styles.userSearchErrorMsg}>
           User not found...
           </div>:
           isLoading?
           <div className={styles.userSearchErrorMsg}>
           Searching... <br/> 
           <Loader size={15}/>
           </div>:
           memoUsers}
          </div>}
        </div>

          <div className={styles.notificationIcon} 
               onClick={handleNotification}
               onBlur={()=>setOpenNotifications(false)}
               onMouseDown={(e)=>e.preventDefault()}>

            <NotificationIcon count={numOfNotifications}/>
            {openNotifications&&
            <div className={styles.notificationDropper} >
              {notis}
            </div>}

          </div>

        <div 
        className={styles.userImage} 
        onClick={handleSideMenu}>
            <img 
            src={currentUser?.image?
            currentUser?.image:
            '/images/no-avatar.png'} 
            
            alt={currentUser?.image?
            currentUser?.image:
            '/images/no-avatar.png'}/>
        </div>

        {isMenu&&
        <div className={styles.isMenuDiv}>
          <div 
          role='link'
          onClick={()=>push('messenger/userPage')}>Private</div>
          <div 
          role='link'
          onClick={refetch}>Logout</div>
        </div>}
    </nav>
  )
}

export default Navbar