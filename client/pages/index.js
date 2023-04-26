import styles from '../styles/IntroductionPage.module.css'
import { exctractCredentials} from '../utils/utils'; 
import { tokenValidation } from '../utils/apiUtils';
import {useMutation} from 'react-query'
import { Loader } from '../components/UI/clipLoader/clipLoader';
import {push} from 'next/router'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import {useErrorBoundary} from 'react-error-boundary'

 const Introduction = ({isLoggedIn}) => { 
  const {showBoundary} = useErrorBoundary()
  const  [isConnect,setIsConnect]=useState(null)
  const {mutate,error,isLoading} = useMutation(tokenValidation,{
    onSuccess:()=>{
        push('/messenger')
    }
  })

  useEffect(()=>{
     let connect = localStorage.getItem('connect')
      
     if(connect === 'false' || isLoggedIn === false){
       setIsConnect(true)
       return
     }
     if(isLoggedIn == undefined && connect === 'true'){
      mutate()
     }
  },[isLoggedIn])
   
  
if(isLoading){
  return(
    <div className='center'>
      <h2>Loading...</h2>
      <Loader/>
    </div>
  )
}

  if(error){
    showBoundary(error)
}
 
  return (  
    <>
      {isConnect&&
      <section className={styles.homePageWrapper}>
      <main className={styles.mainHomeDiv}>
       <h1>Chat-Me</h1>
         <div className={styles.titlesWrapper}>
             <div className={styles.signIn}>
              <Link href='/login'>Sign in</Link>
             </div>
             <div>or</div>
             <div className={styles.signUp}>Sign up</div>
         </div>
      </main>
      </section>}
     </>
  )
} 

export async function getServerSideProps({req}){

  const user = exctractCredentials(req)

  if(user == 'No cookie'){ 
    return{
      props:{isLoggedIn:false}
    } 
  }    
  

  return{
    props:{userName:user.name}
   }
}

export default Introduction