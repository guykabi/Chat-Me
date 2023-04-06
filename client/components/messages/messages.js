import React, {
  useContext,
  useEffect,
  useRef,
  memo,
  useState,
  useMemo,
} from "react";
import { needToReSign, onError,handleUnSeenMessages } from "../../utils/utils";
import styles from "./messages.module.css";
import Message from "../message/message";
import { chatContext } from "../../context/chatContext";
import { useMutation, useQuery } from "react-query";
import { getMessages, deleteConversation } from "../../utils/apiUtils";


const Messages = ({ messages }) => {

  const { currentUser, currentChat, Socket } = useContext(chatContext);
  const scrollRef = useRef();
  const [allMessages, setAllMessages] = useState(null);
  const [amountToSkip, setAmountToSkip] = useState(30);
  const [isMoreMessages, setIsMoreMessages] = useState(false);
  const [newChatToDelete, setNewChatToDelete] = useState(null);
  const [isUnseenMessages,setIsUnSeenMessages]=useState(false)
  const [isOverTwentyUnSeen,setIsOverTwentyUnSeen]=useState(false)
  const [isScrollable,setIsScrollable]=useState(true)

  
  const { refetch: loadMore, error } = useQuery(
    ["more-messages"],
    () => getMessages(currentChat?._id, amountToSkip),
    {
      onSuccess: (data) => {
        if (!data.length)return
        
          let reverseMessages = [...data].reverse();
          if(isOverTwentyUnSeen){
            //Only onmount, if chat has more than 20 unseen messages 
            reverseMessages = handleUnSeenMessages(reverseMessages,currentChat.unSeen) 
            setIsOverTwentyUnSeen(false)
          }
          setAllMessages((prev) => [...reverseMessages, ...prev]);

          if (data.length >= 30) {
            setAmountToSkip((prev) => (prev += 30));
          }

          if (data.length < 30) {
            setIsMoreMessages(false);
          }
        
      },
      enabled: false,
    }
  );


  const { mutate: removeConversation } = useMutation(deleteConversation, {
    onSuccess: (data) => {
      if (data.message !== "Conversation deleted!") return;
      const {conId,message} = data
      Socket.emit("new-conversation",{message,conId}); 
    },
  });

  useEffect(() => {
    //Only on chat switching - or new chat creation
    if (!messages.length)return setAllMessages([])

    if(isUnseenMessages)setIsUnSeenMessages(false)

    if(currentChat?.unSeen < 1)setAllMessages(messages);

    if (messages.length === 30) setIsMoreMessages(true);

    if(currentChat?.unSeen > 0 && currentChat?.unSeen <= 20){
      setIsUnSeenMessages(true)
      //Place the line of unseen on the correct index
      let result = handleUnSeenMessages(messages,currentChat.unSeen)
      setAllMessages(result)
   }

    if(currentChat?.unSeen > 20){
      setAmountToSkip(prev => prev += currentChat.unSeen)
      setIsOverTwentyUnSeen(true)
      loadMore()
    }

    //Reset the amount when switching chats
    if (!(amountToSkip > 30)) return;
    setAmountToSkip(30); 

  }, [messages]);


  useEffect(() => {
    //Detecting if it's a new chat without messages
    if (!messages.length && !allMessages?.length && !currentChat?.chatName) {
       //Sets the new chat in advance to delete - if no message will be send
       setNewChatToDelete(currentChat._id);
       return;
    }
     
    if(newChatToDelete)setNewChatToDelete(null);
  

    //Extra condition - scrolling down only on start or new message
    if(!isScrollable) return;
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "end",
    });

  }, [allMessages]); 


  useEffect(() => {
    Socket.on("recieve-message", ({ message }) => {
        
      if (message?.conversation?._id !== currentChat._id) return;
      
      if (allMessages.some((m) => m._id === message._id)) { 
        setIsScrollable(false)

        //When user deleted a message
        if(message?.event === 'Deleted'){
          let index = allMessages.findIndex((m) => m._id === message._id);
          let newMessages = [...allMessages];
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
      
      //When new message arrive, remove the unseen messages's marked line
      if(isUnseenMessages || isOverTwentyUnSeen){
        let newMessages = [...allMessages]
        newMessages.splice((messages.length) - currentChat.unSeen,1)
        newMessages.push(message)
        setAllMessages(newMessages)

        if(isUnseenMessages)setIsUnSeenMessages(false)
        if(isOverTwentyUnSeen)setIsOverTwentyUnSeen(false)
      }
      else{
        setAllMessages((prev) => [...prev, message]);
      }
      
      if(!isScrollable) setIsScrollable(true)
      new Audio('/assets/notifySound.mp3').play()

      //In order to avoid messages duplication -
      //increasing the amount of documnets that need  to skip 
      //on when new message is added
      if (allMessages.length >= 30) {
        setAmountToSkip((prev) => (prev += 1));
      }


      //If at least one message was sent - there is no need to delete new chat
      if (!newChatToDelete) return;
      setNewChatToDelete(null);

    });

    return () => Socket.off("recieve-message");

  }, [Socket, currentChat, newChatToDelete, allMessages]);


  useEffect(() => {
    //If no message was sent in the new chat (private one only) - delete it
    if (!newChatToDelete)return
    removeConversation(newChatToDelete);
    setNewChatToDelete(null);
  },[currentChat]);

  const handleMoreLoading = (e) => {
    if (e.target.scrollTop === 0 && isMoreMessages) {
      loadMore();
    }
  };

  if (error) {
    if (error?.response?.status === 401) {
      return needToReSign(currentUser.name);
    }
    return onError();
  }

  const memoMessages = useMemo(() => allMessages, [allMessages]);

  return (
    <>
      <section className={styles.messagesDiv} onScroll={handleMoreLoading}>
        {memoMessages?.map((message) => (
          <Message
            key={message._id}
            ref={scrollRef}
            message={message}
            own={message?.sender === currentUser._id}
          />
        ))}
      </section>
    </>
  );
};

export default memo(Messages);
