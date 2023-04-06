import * as cookie from "cookie";
import { push, useRouter } from "next/router";
import Modal from "../components/Modal/modal";
import Button from "../components/UI/Button/button";
import moment from 'moment'


export const getTime = (date) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if(!date)return null
  return formatter.format(Date.parse(date));
};



export const handleSeenTime = (date) =>{
  let d = new Date(date).toISOString()
  let d2 = moment().format();
  let diff = moment(d2).diff(d, 'days')

  if(diff >= 7){
   return moment(date).calendar()
  }
  else{
   let d = new Date(date).toISOString()
   let time = moment(d).calendar()
   if(time.includes('Yesterday'))return 'Yesterday'
   if(time.includes('Today'))return time.split('Today at')
   return time.split('Last')
 }
  
} 





export const exctractCredentials = (req) => {
  let Cookie = cookie.parse(req.headers?.cookie);
  let user = JSON.parse(Cookie.userData);
  return user;
};

export const onError = (title) => {
  const { reload } = useRouter();
  return (
    <Modal show={true} isError={true}>
      <div className="center">
        {title ? <h1>{title}</h1> : null}
        <p>Cannot load page!</p>
        <Button
          className="primaryBtn"
          text="Refresh"
          width="8"
          height="10"
          arialable="Refresh button"
          onClick={() => reload()}
        />
      </div>
    </Modal>
  );
};

//When refresh token is not valid any more
export const needToReSign = (name) => {
  setTimeout(() => {
    push("/login");
  }, 4000);
  return (
    <div className="center">
      <section>
        <strong>Dear {name}, it's been a while since you last sign in</strong>
      </section>
    </div>
  );
};

//For sender field on the socket notification event
export const excludeFieldsUserData = (userData) => {
  const newData = {};
  newData._id = userData._id;
  newData.name = userData.name;
  newData.lastName = userData.lastName;
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
    return "+";
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
    return pastMember.name
} 



//Inserting demy message to indicate to mark the position of unseen messages
export const handleUnSeenMessages = (messages,index) =>{
      let messagesWithUnSeen = [...messages]
      let unSeenLine = {} 
      unSeenLine.banner = `${index} unseen messages`
      unSeenLine._id = Math.random()
      messagesWithUnSeen.splice((messages.length) - index,0,unSeenLine)
      return messagesWithUnSeen
}