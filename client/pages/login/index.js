import React, { useEffect, useState, useContext } from 'react'
import {chatContext} from '../../context/chatContext'
import styles from './login.module.css'
import Input from '../../components/UI/Input/Input'
import {checkUser} from '../../utils/apiUtils'
import { useMutation } from 'react-query'
import { Loader } from '../../components/UI/clipLoader/clipLoader'
import {push} from 'next/router'


const Login = () => { 

  const {Socket,dispatch,currentUser} = useContext(chatContext)
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loginMessage,setLoginMessage]=useState(null)

  const {mutate:authUser,isLoading,isError}=useMutation(checkUser,{
    onSuccess:(data)=>{  

      //If invalid details was inserted
      if(typeof data === "string"){

        setLoginMessage(data)
        let timer =  setTimeout(()=>{
          setLoginMessage(null)
        },3000)

        return () => {clearTimeout(timer)}
      }

      if(!data.message)return
        push('/messenger')
      
    }
  }) 

  useEffect(()=>{
     if(!Socket)return
      
     Socket.disconnect()
     dispatch({type:'SOCKET',payload:null})

  },[currentUser])


  const sendCredentials =(e)=>{
    e.preventDefault()
    let obj = {email,password}
    authUser(obj)
  } 

  return (
    <div className={styles.mainLoginWrapper}>
        <div className={styles.loginWrapper}>
            <div>
                <h2>Login</h2>
            </div>
            <div className={styles.formWrapper}>
                <form onSubmit={sendCredentials}>
                 <Input 
                 value={email}
                 placeholder='Email...'
                 type='email'
                 require
                 onChange={(e)=>setEmail(e.target.value)}
                 />
                 <Input 
                 value={password}
                 placeholder={'Password...'}
                 type='password'
                 require
                 onChange={(e)=>setPassword(e.target.value)}
                 /> 
                 {isLoading?<Loader size={22}/>:null}
                 {loginMessage?<span>{loginMessage}</span>:null}
                 {isError?<span>Something went wrong!</span>:null}
                 <br/><br/>
                 <button type='submit'>Login</button>
                </form>
            </div>
        </div>
    </div>
  )
} 


export default Login