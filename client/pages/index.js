import styles from '../styles/IntroductionPage.module.css'
import { exctractCredentials,onError,needToReSign } from '../utils/utils'; 
import { tokenValidation } from '../utils/apiUtils';
import {useMutation} from 'react-query'
import {push} from 'next/router'
import Link from 'next/link'
import { useEffect } from 'react';

 const Introduction = ({isLoggedIn,userName}) => { 
  
  const {mutate,error,isLoading} = useMutation(tokenValidation,{
    onSuccess:()=>{
        push('/messenger')
    }
  })

  useEffect(()=>{
      mutate()
  },[])
   
  
if(isLoading){
  return(
    <div className='center'>
      <h2>Loading...</h2>
    </div>
  )
}

  if(error){
    if(error?.response?.status === 401){
      //If refreshToken is no more valid
      return needToReSign(userName)
    }
    return onError('Welcome to Chat Me')
  }
 
  return (  
    <>
      {isLoggedIn===false&&
      <main className='center'>
       <h1>Welcome to messenger</h1>
         <div className={styles.titlesWrapper}>
             <h4><Link href='/login'>Sign in</Link></h4>
             <h6>or</h6>
             <h4>Sign up</h4>
         </div>
      </main>}
     </>
  )
} 

export async function getServerSideProps({req}){

  if(!req.headers.cookie){ 
    return{
      props:{isLoggedIn:false}
    } 
  }    

  const user= exctractCredentials(req)
  
  return{
    props:{userName:user.name}
   }
}

export default Introduction