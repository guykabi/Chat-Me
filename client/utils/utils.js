import * as cookie from 'cookie'
import {push} from 'next/router'


export const getTime = (date)=>{
        const formatter = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit"
        });  

        return formatter.format(Date.parse(date))
    } 



  export const getCurrentTime = () =>{
    let dateWithouthSecond = new Date();
    let timer = dateWithouthSecond
    .toLocaleTimeString(
         navigator.language, 
         {hour: '2-digit', 
         minute:'2-digit'}) 
         
         return timer
  }


export const exctractCredentials = (req)=>{
    let accessToken = cookie.parse(req.headers?.cookie)
    let token = JSON.parse(accessToken.token.slice(2)) 
    let tokensObj = {accessToken:token.accessToken,refreshToken:token.refreshToken}
    let user = JSON.parse(accessToken.userData)
    return {user,tokensObj}
} 


export const loginRedirectOnError = (title)=>{
      setTimeout(()=>{
        push('/login')
      },4000)
      return (
         <div className='center'>
            {title&&<h1>{title}</h1>}
            Cannot load page, try to login!
        </div>
     )
 } 

 
export const needToReSign = (name) =>{
      setTimeout(()=>{
        push('/login')
      },4000)
      return (
         <div className='center'>
           <section>
            <strong>Dear {name}, it's been a while since you last sign in</strong>
           </section> 
        </div>
      )
}



