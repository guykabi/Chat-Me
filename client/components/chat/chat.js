import styles from "./chat.module.css";
import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { handleDateDividing, handleJoiningDate } from "../../utils/utils";
import { useTranslation } from "next-i18next";
import { chatContext } from "../../context/chatContext";
import { useQuery, useMutation } from "react-query";
import { getMessages, sendNewMessage, getConversation } from "../../utils/apiUtils";
import Messages from "../messages/messages";
import { Loader } from "../UI/clipLoader/clipLoader";
import InputEmoji from "react-input-emoji";
import EditGroup from "../chatDetails/chatDetails";
import Modal from "../Modal/modal";
import FileForm from "./fileForm/fileForm";
import Input from "../UI/Input/Input";
import { useErrorBoundary } from "react-error-boundary";
import { FiCamera } from "react-icons/fi";
import {IoSendOutline,IoSend} from 'react-icons/io5'
import Image from "next/image";

const Chat = () => {
  const { currentChat, currentUser, Socket, dispatch } = useContext(chatContext);
  const [showModal, setShowModal] = useState(false);
  const { showBoundary } = useErrorBoundary();
  const {t} = useTranslation('common')
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState(null);
  const [room, setRoom] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState(null);
  const [isEditGroup, setIsEditGroup] = useState(false);
  const fileRef = useRef(null);
  

  const { isLoading } = useQuery(
    ["messages", currentChat],
    () => getMessages(  
           currentChat?._id,
           handleJoiningDate(currentChat,currentUser._id),
           null,currentChat?.unSeen + 30 || 30
          ),
      {
      onSuccess: (data) => {
        if (!data.length) setMessages([]);
        setMessages(handleDateDividing(data));
      },
      onError: (error) => showBoundary(error),
      staleTime: 2000,
      refetchOnWindowFocus: false,
    }
  ); 

  const {refetch:fetchAllChatData} = useQuery('full-conversation',
      ()=>getConversation(currentChat._id,currentUser._id,null,currentChat.joining),{
        onSuccess:({conversation})=>{
          dispatch({type:'CHAT_FIELD',payload:conversation})
        },
        enabled:false,
        staleTime:2000
      })

  const { mutate: sendMessage, isLoading: messageLoad } = useMutation(
    sendNewMessage,
    {
      onSuccess: ({ message, data }) => {
        if (message !== "New message just added") return;
        if (file) setFile(null);

        Socket.emit("sendMessage", data, room);
      },
      onError: (error) => showBoundary(error),
    }
  );


  useEffect(() => {
    
    if (room === currentChat._id) return;
    if(isEditGroup)setIsEditGroup(false)
    setNewMessage("");

    setRoom(currentChat._id);
    Socket.emit("join_room", currentChat._id);

  }, [currentChat]);

  useEffect(() => {
    //Notifying that user is typing
    if (!newMessage) return;
    let sender = currentUser._id;
    Socket.emit("typing", sender, currentUser.name, room);
  }, [newMessage]);

  useEffect(() => {
    //Listens to user's typing
    Socket.on("user_typing", (data) => {
      if (data.sender === currentUser._id || data.room !== currentChat._id)return;
      setTypingText(data.message);
      setIsTyping(true);

      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
      return () => clearTimeout(timer);
    });

    return () => Socket.off("user_typing");
  }, [Socket, currentChat, currentUser]); 


  const handleOpenChatDetails = () =>{
    fetchAllChatData()
    setIsEditGroup(true)
  }

  const handleInputFileClick = useCallback(() => {
    fileRef.current.click();
  }, [fileRef]);

  const handleInputFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleNewMessage = useCallback(
    (fileObj = null) => {
      
      if (!newMessage && newMessage.trim().length === 0 && !file) return;

      //If there is file/image
      if (fileObj.message) {
        sendMessage(fileObj.data);
        return;
      }

      let messageObj = {};
      messageObj.conversation = currentChat._id;
      messageObj.sender = currentUser._id;
      messageObj.text = newMessage && newMessage;
      sendMessage(messageObj);

      setNewMessage("");
    },
    [newMessage, currentChat, file]
  );

  const handleImage = currentChat?.friend ? (
    <Image
      fill
      src={
        currentChat.friend?.image?.url
          ? currentChat.friend.image.url
          : "/images/no-avatar.png"
      }
      alt={currentChat.friend.name || "friend-image"}
      placeholder={currentChat.friend.image?.url ? "blur" : "empty"}
      blurDataURL={currentChat.friend?.image?.base64}
      style={{ objectFit: "cover", borderRadius: "50%" }}
      onClick={() => setShowModal(true)}
    />
  ) : (
    <Image
      fill
      src={
        currentChat?.image?.url
          ? currentChat.image.url
          : "/images/no-avatarGroup.png"
      }
      alt={currentChat.chatName}
      placeholder={currentChat?.image?.url ? "blur" : "empty"}
      blurDataURL={currentChat?.image?.base64}
      style={{ objectFit: "cover", borderRadius: "50%" }}
      onClick={() => setShowModal(true)}
    />
  );

  return (
    <>
      <div className={styles.mainDiv}>
        <main className={styles.chatDiv}>
          <Modal show={showModal} onClose={() => setShowModal(false)}>
            <div className={styles.modalImageWrapper}>{handleImage}</div>
          </Modal>

          {isEditGroup ? (    
            <section className={styles.editGroupSection}>   
              <EditGroup onReturn={() => setIsEditGroup(false)} />
            </section>
          ) : (
            <section className={styles.chatBoxHeader}>
              <div className={styles.imageWrapper}>{handleImage}</div>

              <div
                className={styles.friendName}
                onClick={handleOpenChatDetails}
              >
                {currentChat?.friend
                  ? currentChat.friend?.name
                  : currentChat.chatName}
              </div>

              {isTyping && <div className={styles.typingDiv}>{typingText}</div>}
            </section>
          )}

          <main className={styles.chatBoxDiv}>

            {isLoading ? (
              <div className={styles.loadingMessages}>
                <div>
                  <b>{t('chat.loadMessages')}</b>
                </div>
                <Loader size={30} />
              </div>
            ):
            messages ? <Messages messages={messages} /> : null}
          </main>

          <footer className={styles.chatBoxBottom}>
            <div className={styles.inputEmojiWrapper}>
              <InputEmoji
                value={newMessage}
                onChange={setNewMessage}
                onEnter={handleNewMessage}
                width={40}
                maxLength={80}
                placeholder={t('chat.placeholder')}
                borderRadius={10}
              />
            </div>
            <Modal show={file} onClose={messageLoad? null : () => setFile(null)}>
              <FileForm
                file={file}
                onFile={handleNewMessage}
                loading={messageLoad}
              />
            </Modal>
            <div className={styles.fileUploadWrapper}>
              <FiCamera onClick={handleInputFileClick} />
              <Input
                type="file"
                name="messageFile"
                newMessageInput={true}
                onChange={handleInputFileChange}
                className="invisibleFileInput"
                width={0}
                height={0}
                ref={fileRef}
              />
            </div>

            <div 
            className={
              !newMessage.trim().length?
              styles.disbaleSend:
              styles.sendMessageBtn}
              arialable="Send message">

            {!newMessage.trim().length?
            <IoSendOutline
            size={30}
            />:
            <IoSend
            onClick={handleNewMessage}
            size={30}/>}

            </div>
             
          </footer>
        </main>
      </div>
    </>
  );
};

export default Chat;
