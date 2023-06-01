import React, { useEffect, useMemo, useState, useContext, memo } from "react";
import styles from "./conversations.module.css";
import Conversation from "../conversation/conversation";
import { chatContext } from "../../context/chatContext";
import { getConversations } from "../../utils/apiUtils";
import { useErrorBoundary } from "react-error-boundary";
import { useQuery } from "react-query";
import { handleFilterCons } from "../../utils/utils";
import Input from "../UI/Input/Input";
import CardSkeleton from "../UI/cardSkeleton/cardSkeleton";


const Conversations = ({ sortBy, placeholder, dir }) => {
  const { currentUser, currentChat, dispatch, Socket } =
    useContext(chatContext);
  const [allConversations, setAllConversations] = useState([]);
  const { showBoundary } = useErrorBoundary();
  const [query, setQuery] = useState("");
  const [isMoreConversations,setIsMoreConversations]=useState(true)
  const [incomingMessage, setIncomingMessage] = useState(null);

  const { isLoading,refetch:refetchConversations, isRefetching } = useQuery(
    ["conversations"],
    () => getConversations(currentUser._id,allConversations?.length),
    {
      onSuccess: (data) => {
        if(data.length === 15){
          setIsMoreConversations(true)
          return setAllConversations(prev=> [...prev,...data]);
        }
         if(isMoreConversations)setIsMoreConversations(false)
         return setAllConversations(prev=> [...prev,...data]);
      },
      onError: (error) => showBoundary(error),
      staleTime: 2000,
      refetchOnWindowFocus:false
    }
  ); 

 

  useEffect(() => {

    Socket.removeAllListeners("background-message");
    Socket?.on("background-message",(message) => {

      if (!allConversations.length) return;

      //Check if there is already such conversation
      let latestConversation = allConversations?.find(
        (con) => con._id === message.conversation._id
      );


      if (latestConversation) {

        //For unseen messages counter
        setIncomingMessage(message)

        let tempArr = [...allConversations];
        let index = tempArr.indexOf(latestConversation);
        latestConversation.incomingMessage = true
        if(index !== 0){
          tempArr.splice(index, 1), tempArr.unshift(latestConversation);
          setAllConversations(tempArr);
        }

        //Only the reciever will hear the new message's sound
        if (message.sender === currentUser._id) return;
        
        if(currentUser.mute.some(m=>m === message.conversation._id)) return
           new Audio("/assets/notifySound.mp3").play();
      }

      //When a message from a new private chat is recieved
      if (
        message.conversation.participants.includes(currentUser._id) &&
        message.sender !== currentUser._id
      ) {
        //Only the user who isn't the sender will get this refetch of conversations
        refetchConversations();
      }
    });
   

    //When a new chat is created
    Socket.on("arrival-conversation", (conversation) => {

      if (conversation?.message === "Conversation deleted!") {
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
         
          if(currentChat._id !== conversation._id)return
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
        dispatch({
          type: "CURRENT_CHAT",
          payload: conversation,
        });
      }
    });

    return () => Socket.off("arrival-conversation");
  }, [Socket, currentUser, currentChat, allConversations]);

  useEffect(() => {
    if (!query.length) return;
    setQuery("");
  }, [currentChat]);


  useEffect(() => {
    //Sorting conversations by the amount of unseen messages
    if (sortBy === false) {
      let sortCons = [...allConversations];
      sortCons.sort((a, b) => b.unSeen - a.unSeen);
      setAllConversations(sortCons);
      return;
    }
    //Return to sort by date/last active
    refetchConversations();
  }, [sortBy]);

  const filteredConversations = useMemo(
    () => handleFilterCons(allConversations, query,currentUser._id),
    [allConversations,query]
  ); 


  const handleScrolling = (e) =>{
   const {scrollTop,scrollHeight,clientHeight} =  e.target

    if(Math.floor(scrollHeight - scrollTop) === clientHeight && isMoreConversations){
       return  refetchConversations()
    }
  }

  const memoCons = filteredConversations?.map((con) => (
    <Conversation
      key={con._id}
      con={con}
      newMessage={con?.incomingMessage&&incomingMessage}
    />
  ));

  return (
    <>
      <div className={styles.conversationsDiv} >
        <div className={styles.searchInputWrapper}>
          <Input
            type="text"
            width={100}
            height={15}
            fontSize='medium'
            dir={dir}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {isLoading ? (
          <section>
             <CardSkeleton amount={5}/>
          </section>
        ) : (
          <section className={styles.allConversationsWrapper} onScroll={handleScrolling}>
            {isRefetching ? 
            <CardSkeleton amount={5}/> : allConversations.length ?
                 memoCons : <h3>No conversations!</h3>}
          </section>
        )}
      </div>
    </>
  );
};

export default memo(Conversations);
