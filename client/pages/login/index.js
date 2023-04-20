import React, { useEffect, useState, useContext } from 'react'
import Head from 'next/head'
import {chatContext} from '../../context/chatContext'
import Button from '../../components/UI/Button/button'
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
      <Head><title>Chat me login</title></Head>
        <div className={styles.loginWrapper}>
            <header>
                <h2>Login</h2>
            </header>
            <div className={styles.formWrapper}>
                <form onSubmit={sendCredentials} className={styles.loginForm}>
                 <Input 
                 width={40}
                 height={20}
                 value={email}
                 placeholder='Email...'
                 type='email'
                 require
                 onChange={(e)=>setEmail(e.target.value)}
                 />
                 <Input 
                 width={40}
                 height={20}
                 value={password}
                 placeholder={'Password...'}
                 type='password'
                 require
                 onChange={(e)=>setPassword(e.target.value)}
                 /> 
                 {isLoading?
                 <section className={styles.loaderWrapper}>
                 <Loader size={22}/>
                 </section>
                 :null}
                 {loginMessage?<span>{loginMessage}</span>:null}
                 {isError?<span>Something went wrong!</span>:null}
                 <Button
                 type='submit'
                 text='Login'
                 className='primaryBtn'
                 width={12}
                 height={10}/>
                </form>
            </div>
        </div>
    </div>
  )
} 


export default Login