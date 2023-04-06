import React, { useEffect, useMemo, useState, useContext,memo } from "react";
import styles from "./conversations.module.css";
import Conversation from "../conversation/conversation";
import { chatContext } from "../../context/chatContext";
import { getConversations } from "../../utils/apiUtils";
import { useQuery } from "react-query";
import {
  needToReSign,
  onError,
  handleChatFriendField,
  handleFilterCons,
} from "../../utils/utils";


const Conversations = ({sortBy}) => {
  const { currentUser, currentChat, dispatch, Socket } =
    useContext(chatContext);
  const [allConversations, setAllConversations] = useState([]);
  const [query, setQuery] = useState("");
  const [incomingMessage, setIncomingMessage] = useState(null);


  const { error, isLoading, refetch } = useQuery(
    ["conversations"],
    () => getConversations(currentUser._id),
    {
      onSuccess: (data) => {
        setAllConversations(data);
      },
      staleTime: 2000
    }
  ); 

  
  useEffect(() => {
    Socket.removeAllListeners("background-message");
    Socket?.on("background-message", (message) => {
       
      if (!allConversations.length) return;
      
      //Check if there is already such conversation
      let latestConversation = allConversations?.find(
        (con) => con._id === message.conversation._id
      );

      //For adding to the counter of unseen messages
      if (message.conversation._id !== currentChat?._id) {
        setIncomingMessage(message.conversation);
      }


      if (message.sender === currentUser._id || latestConversation) {

        let tempArr = [...allConversations];
        let index = tempArr.indexOf(latestConversation);
        tempArr.splice(index, 1), tempArr.unshift(latestConversation);
        setAllConversations(tempArr);
       
        //Only the reciever will hear the new message's sound
        if (message.sender === currentUser._id) return;
        
        new Audio("/assets/notifySound.mp3").play();
      }

      //Fetching new conversations when a message from a new chat is recieved
      if (message.conversation.participants.includes(currentUser._id) 
          && message.sender !== currentUser._id) {
        //Only the user who isn't the sender will get this refetch of conversations
        refetch();
      }

    });


    //When a new chat is created
    Socket.on("arrival-conversation", (conversation) => {

      if (conversation.message === 'Conversation deleted!') {
        //When a new conversation with no messages was deleted
        let updatedConversations = [...allConversations];
        let index = allConversations.findIndex(
          (con) => con._id === conversation.conId
        );
        updatedConversations.splice(index, 1);
        setAllConversations(updatedConversations);
        return;
      }
     
      //Edited conversation arriving - that already exists
      if (allConversations.find((con) => con._id === conversation._id)) {
        let updatedConversations = [...allConversations];
        let index = allConversations.findIndex(
          (con) => con._id === conversation._id
        );

        //If  the user was removed from the group
        if (!conversation.participants.find((p) => p._id === currentUser._id)) {
          updatedConversations.splice(index, 1);
          setAllConversations(updatedConversations);
          dispatch({ type: "CURRENT_CHAT", payload: null });
          return;
        }
        
        //If conversation was edited
        updatedConversations.splice(index, 1, conversation);
        setAllConversations(updatedConversations);
        return;
      }

      if (!conversation.participants.find((p) => p._id === currentUser._id))return;

      setAllConversations((prev) => [conversation, ...prev]);

      if (
        //If the current user is the manager or the creator of the new conversation
        conversation?.manager.find((m) => m._id === currentUser._id) ||
        conversation.participants[0]._id === currentUser._id
      ) {
       
        let conPlusFriend;
        if (!conversation.chatName) {
          //Adding a friend field to conversation
          let friend = conversation.participants.find(
            (p) => p._id !== currentUser._id
          );
          conPlusFriend = handleChatFriendField(conversation, friend);
        }
        
        dispatch({
          type: "CURRENT_CHAT",
          payload: conPlusFriend ? conPlusFriend : conversation,
        });
        
      }
    });

    return () => Socket.off("arrival-conversation");
  }, [Socket, currentUser,currentChat ,allConversations]);


  useEffect(() => {
    if (!query.length) return;
    setQuery("");
  }, [currentChat]);


useEffect(()=>{
 //Sorting conversations by the amount of unseen messages
 if(sortBy === false){ 
   let sortCons = [...allConversations]
   sortCons.sort((a,b)=> b.unSeen - a.unSeen) 
   setAllConversations(sortCons)
   return
 } 
 //Return to sort by date/last active
 refetch()
 
},[sortBy])


  if (error) {
    if (error?.response?.status === 401) {
      return needToReSign(currentUser.name);
    }
    return onError("Connection error...");
  }


  const filteredConversations = useMemo(
    () => handleFilterCons(allConversations, query),
    [allConversations, query]
  );

  const memoCons = filteredConversations?.map((con) => (
     <Conversation
      key={con._id}
      con={con}
      newMessage={incomingMessage === con._id}
    />
  ));

  return (
    <>
      <div className={styles.conversationsDiv}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            placeholder="Search for chat..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {isLoading ? (
          <title>
            <strong>Loading conversations...</strong>
          </title>
        ) : (
          <section className={styles.allConversationsWrapper}>
            {memoCons?memoCons:<h3>No conversations yet!</h3>}
          </section>
        )}
      </div>
    </>
  );
};

export default memo(Conversations);
