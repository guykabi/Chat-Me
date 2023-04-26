import React,{useEffect, useState} from 'react'
import styles from './error.module.css'
import { push, useRouter } from "next/router";
import Button from '../UI/Button/button';

const ErrorFallBack = ({ error, resetErrorBoundary }) => {

const [isRefreshToken,setIsRefreshToken]=useState(false)
const {reload} = useRouter()

useEffect(()=>{
    if(error?.response?.data?.message === 'Failed to authenticate refresh token'){
        setIsRefreshToken(true)
        setTimeout(() => {
        resetErrorBoundary()
        setIsRefreshToken(false)
         push("/login");
       }, 4000)
    }
},[]) 

const directToLogin = () =>{
  resetErrorBoundary()
  push("/login")
}


  return (
    <>
     {isRefreshToken?
       <section className={styles.errorWrapper}>
        <pre>
         Its been a while since you last signed in 
        </pre>
       </section> :  
       <section className={styles.errorWrapper}>
        <header>
         <h2>Sorry</h2>
         <h3> its seems that something went wrong</h3>
        </header>
        <section className={styles.btnsWrapper}>
        <Button
          className="primaryBtn"
          text="Try again"
          width="8"
          height="10"
          arialable="Refresh button"
          onClick={()=>reload()}
        />
        <Button
          className="primaryBtn"
          text="Login page"
          width="8"
          height="10"
          arialable="Direct to login button"
          onClick={directToLogin}
        />
        </section>
       </section>}
    </>
  )
}

export default ErrorFallBack