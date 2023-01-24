import React, { useState } from 'react'
import styles from './navbar.module.css'
import {push} from 'next/router'
import { logOut } from '../../utils/apiUtils'
import {useQuery} from 'react-query'


const Navbar = () => {
  const [isMenu,setIsMenu]=useState(false)
   
  const{isError,refetch} = useQuery('logout',logOut,{
      enabled: false,
      onSuccess:(data)=>{
        if(data.message === 'User logged out successfully'){
          push('/login')
        } 
      }
    })
 
    /*if(isError){
       //In case user want to logOut but server doesn't response
       document.cookie.token = 'none'
       document.cookie.userData = 'none'
       push('/login')
    }*/

  return (
    <div className={styles.mainNav}>
        <div className={styles.logo}>Next chat</div>
        <div className={styles.searchInput}>
          <input type='text' placeholder='Find new friend to chat with...' />
        </div>
        <div className={styles.userImage} onClick={()=>setIsMenu(!isMenu)}>
            <img src='/images/Andromeda_Galaxy.jpg'/>
        </div>
        {isMenu&&<div className={styles.isMenuDiv}>
          <div>Private</div>
          <div onClick={refetch}>Logout</div>
        </div>}
    </div>
  )
}

export default Navbar