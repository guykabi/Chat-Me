import React, {
  useContext,
  useEffect,
  useRef,
  memo,
  useState,
  useMemo,
} from "react";
import { needToReSign, onError } from "../../utils/utils";
import styles from "./messages.module.css";
import Message from "../message/message";
import { chatContext } from "../../context/chatContext";
import { useMutation, useQuery } from "react-query";
import { getMessages, deleteConversation } from "../../utils/apiUtils";

const Messages = ({ messages }) => {
  const { currentUser, currentChat, Socket } = useContext(chatContext);
  const scrollRef = useRef();
  const [allMessages, setAllMessages] = useState([]);
  const [amountToSkip, setAmountToSkip] = useState(30);
  const [isMoreMessages, setIsMoreMessages] = useState(false);
  const [newChatToDelete, setNewChatToDelete] = useState(null);

  const { refetch: loadMore, error } = useQuery(
    "more-messages",
    () => getMessages(currentChat?._id, amountToSkip),
    {
      onSuccess: (data) => {
        if (data.length) {
          let reverseMessages = [...data].reverse();
          setAllMessages(prev => [...reverseMessages, ...prev]);

          if (data.length === 30) {
            setAmountToSkip(prev => (prev += 30));
          }

          if (data.length < 30) {
            setIsMoreMessages(false);
          }
        }
      },
      enabled: false,
    }
  );

  const { mutate: removeConversation } = useMutation(deleteConversation, {
    onSuccess: (data) => {
      if (data !== "Conversation deleted!") return;

      //Emit event to trigger the conversations-component to fetch updated conversations
      Socket.emit("new-conversation", currentUser._id);
    },
  });



  useEffect(() => {
    //Only on chat switching - or new chat creation
    if (!messages.length) return;
    setAllMessages(messages);

    if (messages.length === 30) setIsMoreMessages(true);

    //Reset the amount when switching chats
    if (!(amountToSkip > 30)) return;
    setAmountToSkip(30);
  }, [messages]);



  useEffect(() => {
    //Detecting if it's a new chat without messages
    if (!messages.length && !allMessages.length) {
      //Sets the new chat in advance to delete - if no message will be send
      setNewChatToDelete(currentChat._id);
      return;
    }

    setNewChatToDelete(null);

    if (isMoreMessages) return;
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });

  }, [allMessages]);


  useEffect(() => {
    
    Socket.on("recieve-message", ({ message }) => {

      if (message.conversation._id !== currentChat._id) return;
      
      //In order to avoid messages duplication -
      //increasing the amount of documnets to skip on when new message is added
      if( allMessages.length >= 30){
        setAmountToSkip((prev) => (prev += 1));
      }
      
      setAllMessages((prev) => [...prev, message]);

      //If at least one message was sent - there is no need to delete new chat
      if (!newChatToDelete) return;
      setNewChatToDelete(null);
    });

    return ()=> Socket.off("recieve-message");
  }, [Socket,currentChat,newChatToDelete]);


  useEffect(() => {
    //If no message was sent in the new chat - delete it
    if (!newChatToDelete) return;
    setNewChatToDelete(null);
    removeConversation(newChatToDelete);
  }, [currentChat]);


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
        {memoMessages?.map(message => (
          <div key={message._id} ref={scrollRef}>
            <Message
              message={message}
              own={message.sender === currentUser._id}
            />
          </div>
        ))}
      </section>
    </>
  );
};

export default memo(Messages);
