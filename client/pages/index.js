import styles from '../styles/IntroductionPage.module.css'
import { exctractCredentials,loginRedirectOnError,needToReSign } from '../utils/utils'; 
import { tokenValidation } from '../utils/apiUtils';
import {useMutation} from 'react-query'
import {push} from 'next/router'
import Link from 'next/link'
import { useEffect } from 'react';

 const Introduction = ({isLoggedIn,userName,tokens}) => { 
  
  const {mutate,error,isLoading} = useMutation(tokenValidation,{
    onSuccess:()=>{
        push('/messenger')
    }
  })

  useEffect(()=>{
    if(!tokens) return
      mutate(tokens)
  },[])
   
  
if(isLoading){
  return(
    <div className='center'>
      <h2>Loading...</h2>
    </div>
  )
}

  if(error){
    if(error?.response?.data?.message === 'Failed to authenticate refresh token'){
      //If refreshToken is no more valid
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

  const {user,tokensObj} = exctractCredentials(req)
  
  return{
    props:{tokens:tokensObj,userName:user.name}
   }
}

export default Introduction