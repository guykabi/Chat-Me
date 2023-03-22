import React, { memo, useEffect, useRef, useState,useContext } from "react";
import { chatContext } from "../../context/chatContext";
import styles from "./message.module.css";
import { getTime } from "../../utils/utils";
import { useMutation } from "react-query";
import { seenMessage } from "../../utils/apiUtils";
import MessageOperations from "./messageOperation/messageOperations";

const Message = ({ message, own }) => {
  const {currentChat,currentUser} = useContext(chatContext)
  const [openMessageMenu, setOpenMessageMenu] = useState(false);
  const [memeberName,setMemberName]=useState(null)
  const menuRef = useRef(null);
  const { mutate: switchToSeen } = useMutation(seenMessage);

  useEffect(() => {
    //Checks if message is unseen
    if (!own && !message.seen.some(s=>s.user === currentUser._id)){
      switchToSeen({messageId:message._id,userId:currentUser._id});
    }


    if(!currentChat.chatName || message.sender === currentUser._id)return 
     let member = currentChat.participants.find(p=>p._id === message.sender)
     setMemberName(member?.name?member.name:'past-member')
  }, []);

  const handleMessageOperation = () => {
    if (!own) return;
    setOpenMessageMenu(!openMessageMenu);
  };

  const closeOpenMenus = (e) => {
    if (
      menuRef.current &&
      openMessageMenu &&
      !menuRef.current.contains(e.target)
    ) {
      setOpenMessageMenu(false);
    }
  };

  document.addEventListener("mousedown", closeOpenMenus);

  return (
    <>
      <article className={styles.mainMessageDiv} ref={own ? menuRef : null}>
        <div className={styles.contentWrapper} onClick={handleMessageOperation}>
          <div className={own ? styles.ownMessage : styles.otherMessage}>

            {currentChat.chatName&&
            <div>
             <strong>{memeberName}</strong>
            </div>}
            <div dir="auto" className={styles.messageTextDiv}>
              {message.text}
            </div>
            <div className={styles.timeBatch}>
              {getTime(message.createdAt)}
            </div>
            {openMessageMenu && <MessageOperations />}
            
          </div>
          
        </div>
      </article>
    </>
  );
};

export default memo(Message);
