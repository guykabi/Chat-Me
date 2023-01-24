import styles from '../styles/IntroductionPage.module.css'
import { exctractCredentials,loginRedirectOnError,needToReSign } from '../utils/utils'; 
import { sendRefreshToken } from '../utils/apiUtils';
import Link from 'next/link'

 const Introduction = ({isLoggedIn,reSignIn,hasError,userName}) => { 
  
 if(hasError){
   return loginRedirectOnError('Welcome to messenger')
 } 

if(reSignIn){
   return needToReSign(userName)
}

  return (  
     <div className='center'>
      <h1>Welcome to messenger</h1>
      {!isLoggedIn&&
        <div className={styles.titlesWrapper}>
            <h4> <Link href='/login'>Sign in</Link></h4>
            <h6>or</h6>
            <h4>Sign up</h4>
        </div>}
     </div>
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
  
  try{
      await sendRefreshToken(token)
   }catch({response}){
      if(response?.data === 'Failed to authenticate refresh token'){
        return {props:{reSignIn:true,userName:user.name}}
      }
        return {props:{hasError:true}}
   }

  return{
    redirect: {destination: "/messenger"}
   }
}

export default Introduction