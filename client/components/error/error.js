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


  return (
    <>
     {isRefreshToken?
       <section className={styles.errorWrapper}>
        <pre>
         It's been a while since you last signed in 
        </pre>
       </section> :  
       <section className={styles.errorWrapper}>
        <header>
         <h2>Sorry</h2>
         <h3> it's seems that something went wrong</h3>
        </header>
        <Button
          className="primaryBtn"
          text="Try again"
          width="8"
          height="10"
          arialable="Refresh button"
          onClick={()=>reload()}
        />
       </section>}
    </>
  )
}

export default ErrorFallBack