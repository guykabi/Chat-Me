import styles from '../styles/IntroductionPage.module.css'
import { exctractCredentials,loginRedirectOnError,needToReSign } from '../utils/utils'; 
import { sendRefreshToken } from '../utils/apiUtils';
import {useMutation} from 'react-query'
import {push} from 'next/router'
import Link from 'next/link'
import { useEffect } from 'react';

 const Introduction = ({isLoggedIn,userName,token}) => { 
  
  const {mutate,error,isLoading} = useMutation(sendRefreshToken,{
    onSuccess:()=>{
        push('/messenger')
    }
  })

  useEffect(()=>{
    if(!token) return
      mutate(token)
  },[])
   
  
if(isLoading){
  return(
    <div className='center'>
      <h2>Loading...</h2>
    </div>
  )
}

  if(error){
    if(error?.response?.data?.message){
      return needToReSign(userName)
    }
    return loginRedirectOnError('Welcome to messenger')
  }
 
  return (  
    <>
      {isLoggedIn===false&&<div className='center'>
       <h1>Welcome to messenger</h1>
         <div className={styles.titlesWrapper}>
             <h4> <Link href='/login'>Sign in</Link></h4>
             <h6>or</h6>
             <h4>Sign up</h4>
         </div>
      </div>}
     </>
  )
} 

export async function getServerSideProps({req}){

  if(!req.headers.cookie){ 
    return{
      props:{isLoggedIn:false}
    }
  }    

  /*If there is a cookie, send refresh token to get a new accesstoken*/
  const {user,token} = exctractCredentials(req,'refreshToken')
  
  return{
    props:{token,userName:user.name}
   }
}

export default Introduction