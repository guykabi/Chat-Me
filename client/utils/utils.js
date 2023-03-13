import * as cookie from 'cookie'
import {push,useRouter} from 'next/router'


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
    let Cookie = cookie.parse(req.headers?.cookie)
    let user = JSON.parse(Cookie.userData)
    return user
} 


export const onError = (title)=>{
  const {reload} = useRouter()
      return (
         <div className='center'>
            {title&&<h1>{title}</h1>}
            Cannot load page! <br/> 
            <button onClick={() => reload()}>
            Refresh
            </button>
        </div>
     )
 } 

 
//When refresh token is not valid any more
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

//For sender field on the socket notification event 
export const excludeFieldsUserData = (userData) =>{
   const newData = {} 
   newData._id = userData._id
   newData.name = userData.name
   newData.lastName = userData.lastName
   newData.image = userData.image 
   
   return newData
   
}

export const setUserStatus = (currentUser,user) =>{
  
  if(currentUser.friends.find(u=>u._id === user._id)){
    if(currentUser.friendsWaitingList.find(u=>u._id === user._id)){
       return 'Approve'
     }
    return 'Friend'
  }

 if(user?.friendsWaitingList.find(u=> u === currentUser._id)){
    return 'Pending'
  }

 if(currentUser?.friendsWaitingList.find(u=>u._id === user._id)){
    return 'Approve'
  }

 else{
    return '+'
 }

}


export const handleChatFriendField = (conversation,userId) =>{
  let newConversation = {...conversation} 
  newConversation.friend = userId
  return newConversation
}