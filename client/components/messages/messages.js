import React, {
  useContext,useEffect,useRef,
  memo,useState,useMemo,
} from "react";
import { useErrorBoundary } from "react-error-boundary";
import {handleUnSeenMessages,handleDateDividing,handleJoiningDate} from "../../utils/utils";
import styles from "./messages.module.css";
import Message from "../message/message";
import { chatContext } from "../../context/chatContext";
import { useMutation, useQuery } from "react-query";
import {getMessages,deleteConversation,addGroupMember} from "../../utils/apiUtils";
import Day from "./Day/day";
import {format} from 'date-fns'
import { Loader } from "../UI/clipLoader/clipLoader";

const Messages = ({ messages }) => {
  const { currentUser, currentChat, Socket } = useContext(chatContext);
  const { showBoundary } = useErrorBoundary();
  const scrollRef = useRef() , windowRef = useRef()
  const [allMessages, setAllMessages] = useState(null);
  const [amountToSkip, setAmountToSkip] = useState(30);
  const [isMoreMessages, setIsMoreMessages] = useState(false);
  const [newChatToDelete, setNewChatToDelete] = useState(null);
  const [isUnseenMessages, setIsUnSeenMessages] = useState(false);
  const [isScrollable, setIsScrollable] = useState(true);
  const [scrollHeight, setScrollHeight] = useState(null);
  

  const { refetch: loadMore,isFetching,isLoading } = useQuery(["more-messages"],
    () => getMessages(
                      currentChat?._id,
                      handleJoiningDate(currentChat,currentUser._id),
                      amountToSkip
                     ),
      {
      onSuccess: (data) => {
        if (!data.length) return;
        
        let reverseMessages = handleDateDividing
        (data, allMessages[0]?.createdAt)

        setAllMessages((prev) => [...reverseMessages, ...prev]);

       if(data.length == 30) return setAmountToSkip((prev) => (prev += 30));
      
        if (data.length < 30) {
          setIsMoreMessages(false);
        }
      },
      onError: (error) => showBoundary(error),
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );


  const { mutate: removeConversation } = useMutation(deleteConversation, {
    onSuccess: (data) => {
      if (data.message !== "Conversation deleted!") return;
      const { conId, message } = data;
      Socket.emit("new-conversation", { message, conId });
    },
    onError: (error) => showBoundary(error),
  });

  const { mutate: addMember } = useMutation(addGroupMember, {
    onSuccess: (data) => {
      if (data.message !== "Member added") return;
      Socket.emit("new-conversation", data.conversation);
    },
    onError: (error) => showBoundary(error),
  });

  useEffect(() => {
    //Only on chat switching - or new chat creation
    if (!messages.length) return setAllMessages([]);

    if (isUnseenMessages) setIsUnSeenMessages(false);

    //Removing the dates types messages - checks pure messages length
    let pureMessagesLength = messages.filter((m) => !m?.type).length
    if (pureMessagesLength >= 30) setIsMoreMessages(true);

    if (currentChat?.unSeen === 0 || !currentChat?.unSeen) return setAllMessages(messages);

    if (currentChat?.unSeen > 0) {

      setIsUnSeenMessages(true);
      if(pureMessagesLength >= 30) setAmountToSkip(pureMessagesLength)

      //Place the line of unseen on the correct index
      let finalMessages = handleUnSeenMessages(messages, currentChat.unSeen);
      setAllMessages(finalMessages);
    }


  }, [messages]);


  useEffect(() => {
    //Detecting if it's a new chat without messages
    if (!messages.length && !allMessages?.length && !currentChat?.chatName) {
      //Sets the new chat in advance to delete - if no message will be send
      setNewChatToDelete(currentChat._id);
      return;
    }

    if (newChatToDelete) setNewChatToDelete(null);

    //Extra condition - scrolling down only on start or new message
    if (isScrollable){
        scrollRef.current?.scrollIntoView({
         behavior: "auto",
         block: "end",
         inline: "end",
       }); 
    }

  
    //When more messages are fetched, keeps the same position of view
    //Preventing from getting in onmount/first render of messages / new message enter
    if (!allMessages || allMessages?.length < 31 || !scrollHeight) return;
    let position = windowRef.current.scrollHeight - scrollHeight;
    windowRef.current.scrollTo({ top: position, left: 0, behavior: "auto" });
    setScrollHeight(null);

  }, [allMessages]);


  useEffect(() => {
    Socket.on("recieve-message", ({ message }) => {
      
      if (message?.conversation?._id !== currentChat._id) return;

      if (allMessages.some((m) => m._id === message._id)) {
        setIsScrollable(false);

        //When user deleted a message
        if (message?.event === "Deleted") {
          let index = allMessages.findIndex((m) => m._id === message._id);
          let newMessages = [...allMessages];

          //If it is the first message of particular date - delete also the date banner
          if(newMessages[index-1].type && newMessages?.[index+1]?.type){
            newMessages.splice(index-1, 2);
            return setAllMessages(newMessages);
          }
          newMessages.splice(index, 1);
          setAllMessages(newMessages);
          return;
        }

        //When user liked a message
        let index = allMessages.findIndex((m) => m._id === message._id);
        let newMessages = [...allMessages];
        newMessages.splice(index, 1, message);
        setAllMessages(newMessages);
        return;
      }

      //When new message arrive, remove the unseen messages's marked line if there is!
      if (isUnseenMessages) {
        let nonDates = allMessages.filter((m) => !m?.type);
        let lastMsg = nonDates[nonDates.length - 1].createdAt;
       
        let newMessages = [...allMessages];
        newMessages.splice((newMessages.length-1) - currentChat.unSeen, 1);
        
        //If no message was sent today - add today date banner before
        if (
          format(new Date(lastMsg),'yyyy/MM/dd') <
          format(new Date(),'yyyy/MM/dd')
        ) {
          let day = { _id: Math.random(), type: "date", date: "Today" };
          newMessages.push(day);
          newMessages.push(message);
          setAllMessages(newMessages);
          return;
        }

        newMessages.push(message);
        setAllMessages(newMessages);

        if (isUnseenMessages) setIsUnSeenMessages(false);

      } else {
        let nonDates = allMessages.filter((m) => !m?.type);
        let lastMsg = nonDates[nonDates.length - 1]?.createdAt;
      
        //If no message was sent today - add today date banner before
        if (
          !allMessages.length ||
          format(new Date(lastMsg),'yyyy/MM/dd') <
          format(new Date(),'yyyy/MM/dd') 
        ) {
          let day = { _id: Math.random(), type: "date", date: "Today" };
          setAllMessages((prev) => [...prev, day, message]);
        } else {
          setAllMessages((prev) => [...prev, message]);
        }
      }

      if (!isScrollable) setIsScrollable(true);
      new Audio("/assets/notifySound.mp3").play();

      //In order to avoid messages duplication -
      //increasing the amount of documnets that need to be skiped
      //when new message is added
      if (allMessages.length >= 30) {
        setAmountToSkip((prev) => (prev += 1));
      }

      //If at least one message was sent - there is no need to delete new chat
      if (!newChatToDelete) return;

      setNewChatToDelete(null);
      let obj = { participant: currentChat.friend._id };
      addMember({ conId: currentChat._id, obj });
    });

    return () => Socket.off("recieve-message");

  }, [Socket, currentChat, newChatToDelete, allMessages]);


  useEffect(() => {
    if(currentChat.unSeen < 1) setIsScrollable(true)
    if(isMoreMessages) setIsMoreMessages(false)
    
    //If no message was sent in the new chat (private one only) - delete it
    if (!newChatToDelete) return;
    removeConversation(newChatToDelete);
    setNewChatToDelete(null)

    //Reset the amount when switching chats
    if (amountToSkip > 30) setAmountToSkip(30);

  }, [currentChat]);

  const handleMoreLoading = (e) => {
    if (e.target.scrollTop === 0 && isMoreMessages) {
      setScrollHeight(e.target.scrollHeight);
      loadMore();
    }
  };

  const memoMessages = useMemo(() => allMessages, [allMessages]);

  return (
    <>
      <section
        className={styles.messagesDiv}
        onScroll={handleMoreLoading}
        ref={windowRef}
      > 
      {isFetching || isLoading?<div>
       <Loader size={20}/> <br/>
       <b>Loading more...</b>
      </div>:null}

        {memoMessages?.map((message,i) => {
          if (message?.type) {
            return <Day key={message._id} date={message} />
          } else {
            if(message?.banner){
              return(
                <Message
                key={message._id}
                message={message}
                ref={scrollRef}
                own={message?.sender === currentUser._id}
              />
              )
            }
            return (
              <Message
                key={message._id}
                message={message}
                ref={i==memoMessages.length-1&&!isUnseenMessages?scrollRef:null}
                own={message?.sender === currentUser._id}
              />
            );
           }
        })}
      </section>
    </>
  );
};

export default memo(Messages);
