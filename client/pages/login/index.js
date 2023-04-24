import React, { useEffect, useState, useContext } from 'react'
import Head from 'next/head'
import Modal from '../../components/Modal/modal'
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
  const [userName,setUserName]=useState(null)
  const [showStayConnect,setShowStayConnect]=useState(false)

  const {mutate:authUser,isLoading,isError}=useMutation(checkUser,{
    onSuccess:(data)=>{  

      //If invalid details was inserted - present the error message
      if(typeof data === "string"){

        setLoginMessage(data)
        let timer =  setTimeout(()=>{
          setLoginMessage(null)
        },3000)

        return () => {clearTimeout(timer)}
      }

      if(data.message !== 'User got authorized')return
          setUserName(data.userData.name)
          setShowStayConnect(true)
    }
  }) 

  

  const sendCredentials =(e)=>{
    e.preventDefault()
    let obj = {email,password}
    authUser(obj)
  } 

  const handleStayConnect = () =>{
    localStorage.setItem('connect',true)
    setShowStayConnect(false)
    push('/messenger')
  }

  const handleNotStayConnect = () =>{
    localStorage.setItem('connect',false)
    setShowStayConnect(false)
    push('/messenger')
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
            <Modal show={showStayConnect}>
              <section className={styles.stayConnect}>
                <h3>{`${userName}, do you want to stay connect?`}</h3>
                <section className={styles.modalBtns}>
                <Button 
                width={6}
                text='Yes'
                className='primaryBtn'
                onClick={handleStayConnect}/>
                <Button 
                width={6}
                text='No'
                className='primaryBtn'
                onClick={handleNotStayConnect}/>
                </section>
              </section>
            </Modal>
        </div>
    </div>
  )
} 


export default Login