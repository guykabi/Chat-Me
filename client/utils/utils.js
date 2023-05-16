import * as cookie from "cookie";
import { push, useRouter } from "next/router";
import Modal from "../components/Modal/modal";
import Button from "../components/UI/Button/button";
import {format,intervalToDuration,formatRelative,addDays} from 'date-fns'



export const getMessageTime = (date) => {
  if(!date)return null
  return format(new Date(date), 'HH:mm')
};


//For messages's seen time + conversation's last active time
export const handleSeenTime = (date) =>{
  
  let formatDate  = format(new Date(date),'yyyy/MM/dd');
  let duration = intervalToDuration({start:new Date(date) , end:new Date()})
  
  if(duration.days >= 7){
   return formatDate
  }
  else{
   let time = formatRelative(addDays(new Date(date), 0 ), new Date())
   if(time.includes('last'))return time.split('last')
   return time
 }
} 

 
export const checkDevice = (userAgent) =>{
  return Boolean(userAgent.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  )) 
}

export const exctractCredentials = (req) => {
  let Cookie = cookie.parse(req?.headers?.cookie);
  if(!Cookie || 
    Cookie?.NEXT_LOCALE && Object.keys(Cookie).length == 1
    ) return 'No cookie'

  let user = JSON.parse(Cookie?.userData)
  return user;
};


//For sender field on the socket notification event
export const excludeFieldsUserData = (userData) => {
  const newData = {};
  newData._id = userData._id;
  newData.name = userData.name;
  newData.lastName = userData.lastName;
  newData.email = userData.email
  newData.image = userData.image;

  return newData;
};

export const setUserStatus = (currentUser, user) => {
  if (currentUser.friends.find((u) => u._id === user._id)) {
    if (currentUser.friendsWaitingList.find((u) => u._id === user._id)) {
      return "Approve";
    }
    return "Friend";
  }

  if (user?.friendsWaitingList.find((u) => u === currentUser._id)) {
    return "Pending";
  }

  if (currentUser?.friendsWaitingList.find((u) => u._id === user._id)) {
    return "Approve";
  } else {
    return "Add";
  }
};

export const handleChatFriendField = (conversation, userId) => {
  let newConversation = { ...conversation };
  newConversation.friend = userId;
  return newConversation;
};


export const handleFilterCons = (allConversations, query) => {
 
  return allConversations?.filter((con) => {
    return (
      con.chatName?.toLowerCase().includes(query?.trim().toLowerCase()) ||
      (!con.chatName &&
        (con.participants[0].name
          .toLowerCase()
          .includes(query?.trim().toLowerCase()) ||
          con.participants[1].name
            .toLowerCase()
            .includes(query?.trim().toLowerCase())))
    );
  });
};  



export const searchPastMember = (userId,data) =>{
    let pastMember = data.find(u=>u._id === userId)
    if(!pastMember)return null
    return pastMember.name
} 

//Dividing the messages to dates regions
//Example of the first item from previous rendered messages,
//To check if it's the same date
export const handleDateDividing = (messages,example=null) =>{
    let datedMessages = []
    let currentDateGroup;

    messages.reverse().forEach((m,i)=>{
     
    currentDateGroup = format(new Date(m.createdAt),'yyyy/MM/dd')
    let dateCondition = currentDateGroup==format(new Date(),'yyyy/MM/dd')?'Today':currentDateGroup

      if(i === 0 && messages.length < 30){
        let dateMessage = {_id:Math.random(),type:'date',date:dateCondition}
        datedMessages.push(dateMessage)
        datedMessages.push(m)
        return
      }


      if(i === 0 && messages.length === 30){
        datedMessages.push(m)
        return
      } 

      if(i === messages.length -1 && example){
       if(currentDateGroup == format(new Date(example),'yyyy/MM/dd')){
        datedMessages.push(m)
        return
       }
       if(currentDateGroup > format(new Date(example),'yyyy/MM/dd')){
        let dateMessage = {_id:Math.random(),type:'date',date:dateCondition}
        datedMessages.push(m)
        datedMessages.push(dateMessage)
       } 
       return
      }

     
      if(currentDateGroup > format(new Date(messages[i-1]?.createdAt),'yyyy/MM/dd')){
        let dateMessage = {_id:Math.random(),type:'date',date:dateCondition}
        datedMessages.push(m)
        datedMessages.splice(-1,0,dateMessage)
        return
      } 

      datedMessages.push(m)

    })

    return datedMessages;
}


//Inserting demy message to mark the position of unseen messages
export const handleUnSeenMessages = (messages,index) =>{
      let messagesWithUnSeen = [...messages]
      let unSeenLine = {} 
      unSeenLine.banner = `${index} unseen messages`
      unSeenLine._id = Math.random()
      messagesWithUnSeen.splice((messages.length) - index,0,unSeenLine)
      return messagesWithUnSeen
} 


