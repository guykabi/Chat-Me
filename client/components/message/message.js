import React, {
   memo, useEffect,
  useState, useContext,
  forwardRef,useCallback,
} from "react";
import styles from "./message.module.css";
import { chatContext } from "../../context/chatContext";
import { useTranslation } from "next-i18next";
import { getMessageTime, searchPastMember } from "../../utils/utils";
import useClickOutSide from "../../hooks/useClickOutside";
import { useMutation } from "react-query";
import {useErrorBoundary} from 'react-error-boundary'
import { seenMessage, handleForwardMessage } from "../../utils/apiUtils";
import MessageOperations from "./messageOperation/messageOperations";
import { FcLike } from "react-icons/fc";
import { AiOutlineDown } from "react-icons/ai";
import Image from "next/image";
import Video from "../UI/video/video";
import Modal from "../Modal/modal";
import GroupPerson from "../group-person/groupPerson";
import { useGetCacheQuery } from "../../hooks/useGetQuery";
import Picker from "../picker/picker";

  const Message = forwardRef(({ message, own }, ref) => {
  const { currentChat, currentUser, Socket } = useContext(chatContext);
  const {showBoundary} = useErrorBoundary()
  const {t} = useTranslation()
  const [memeberName, setMemberName] = useState(null);
  const [showMessageDetailsModal, setShowMessageDetailsModal] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [toggleDetailsMenu, setToggleDetailsMenu] = useState(true);
  const { visibleRef, isVisible, setIsVisible } = useClickOutSide(false);
  const allUsers = useGetCacheQuery("users");
  const conversations = useGetCacheQuery("conversations");

   
  const { mutate: switchToSeen } = useMutation(seenMessage,{
    onError:error=>showBoundary(error)
  });

  const { mutate: forward,isLoading } = useMutation(handleForwardMessage, {
    onSuccess: (data) => {
      if (data.message !== "Forward message succeeded") return;
      setShowForward(false);
      Socket.emit("forward-message", data.data, data.receivers);
    },
    onError:error=>showBoundary(error)
  });

  
  useEffect(() => {

    //Checks if message is a banner's type message
    if (message?.banner) return;
    
    //Checks if message is unseen
    if (!own && !message.seen.some((s) => s.user === currentUser._id)) {
      switchToSeen({ messageId: message._id, userId: currentUser._id });
    }
     
    if (!currentChat.chatName || message.sender === currentUser._id) return;
    let member = currentChat.participants.find((p) => p._id === message.sender);
    setMemberName(
      member?.name ? member.name : searchPastMember(message.sender, allUsers)
    ); 

  }, []);

  const handleMessageOperationMenu = () => {
    setIsVisible(!isVisible);
  };

  const openDetailsModal = useCallback(() => {
    setShowMessageDetailsModal(true);
  }, [showMessageDetailsModal]);

  const closeMessageDetailsModal = () => {
    setToggleDetailsMenu(true);
    setShowMessageDetailsModal(false);
  };

  const openImage = (e) => {
    e.stopPropagation();
    setShowImage(true);
  };

  const openForwardModal = () => {
    setShowForward(true);
  };

  const closeForward = () => {
    setShowForward(false);
  };

  const handleForward = (e) => {
    let forwardMessage = {};
    forwardMessage.text = message.text;
    forwardMessage.sender = currentUser._id;
    if (message?.image) {
      forwardMessage.file = message.image?.url;
    }
     
    forward({ receivers: e, forwardMessage });
  };


  const onShowImageModalClose = () =>{
    setShowImage(false)
  }


  const messageDetails = (
    <section className={styles.messageDetailsWrapper}>
      <header className={styles.messageDetailsHeader}>
        <div
          className={
            toggleDetailsMenu ? styles.seenHeaderActive : styles.seenHeader
          }
          role="button"
          onClick={() => setToggleDetailsMenu(true)}
        >
          <h3>{t('modal.seen')}</h3>
        </div>
        <div
          className={
            toggleDetailsMenu ? styles.likesHeader : styles.likesHeaderActive
          }
          role="button"
          onClick={() => setToggleDetailsMenu(false)}
        >
          <h3>{t('modal.likes')}</h3>
        </div>
      </header>
      <main className={styles.mainContentDetails}>
        {toggleDetailsMenu ? (
          <div>
            {currentChat.participants
              .filter((p) => message?.seen?.find((m) => m.user === p._id))
              .map((member) => (
                <GroupPerson
                  key={member._id}
                  user={member}
                  time={message.seen.find((m) => m.user === member._id)}
                />
              ))}
          </div>
        ) : (
          <div>
            {currentChat.participants
              .filter((p) => message.likes.includes(p._id))
              .map((member) => (
                <GroupPerson key={member._id} user={member} isLike={true} />
              ))}
          </div>
        )}
      </main>
    </section>
  ); 


  const file = (
    message?.image?.video?  
      <Video video={message.image.url} openVideo={showImage}/>:
      <Image
      fill
      sizes="(max-width: 368px) 100vw"
      style={{ objectFit:showImage?"contain":"cover"}}
      placeholder={message.image?.base64?"blur":'empty'}
      blurDataURL={message?.image?.base64}
      src={message?.image?.url}
      alt={message?.text || 'message-image'}
    />
  );

  return (
    <>
      {!message.banner ? (
        <article className={styles.mainMessageDiv} ref={ref}>
          <main className={styles.contentWrapper} ref={visibleRef}>
            <div className={own ? styles.ownMessage : styles.otherMessage}>

              {currentChat.chatName ? (
                <header className={styles.topOfMessage}>

                  {!own?
                  <div aria-label={memeberName}>
                    <strong>{memeberName}</strong>
                  </div>:null}

                  <div
                    className={
                    message?.image?
                    own?styles.dropMenuSignImage:
                    styles.dropMenuSign:
                    styles.dropMenuSign}
                    onClick={handleMessageOperationMenu}
                  >
                    <AiOutlineDown />
                  </div>
          
                </header>
              ):(
                <header className={styles.topOfMessage}>
                 
                  <div
                    className={message?.image?
                    own?styles.dropMenuSignImage:
                    styles.dropMenuSignOtherImage:
                    styles.dropMenuSign
                    }
                    onClick={handleMessageOperationMenu}
                  >
                    <AiOutlineDown />
                  </div>
                 
                </header>
              )}

              {message.image ? (
                <div 
                className={styles.messageImageWrapper} 
                onClick={openImage}>
                  {file}
                </div>
              ) : null}

              {message.text ? (
                <div dir="auto" className={styles.messageTextDiv}>
                  {message.text}
                </div>
              ):null}

              <div className={styles.timeBatch}>
                {getMessageTime(message.createdAt)}
              </div>

              {message?.likes?.length ? (
                <div className={styles.likedMessageSign}>
                  <FcLike />
                  {message.likes.length > 1 ? (
                    <span className={styles.numsOfLikes}>
                      {message.likes.length}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {isVisible && (
                <MessageOperations
                  messageId={message._id}
                  own={own}
                  onCloseMenu={() => setIsVisible(false)}
                  ownLike={message.likes.includes(currentUser._id)}
                  onDetailModal={openDetailsModal}
                  onForwardModal={openForwardModal}
                />
              )}
            </div>
          </main>

          <Modal 
          show={showMessageDetailsModal} 
          onClose={closeMessageDetailsModal} 
          title={t('modal.messageDetails')}>
            {messageDetails}
          </Modal>

          <Modal
            show={showForward}
            onClose={closeForward}
            title={t('chat.messageMenu.forward')}
          >
            <Picker
              items={conversations}
              type="cons"
              onFinalPick={handleForward}
              isLoad={isLoading}
            />
          </Modal>

          <Modal
            show={showImage}
            onClose={onShowImageModalClose}
            isFileMessage={true}
          >
            <div className={styles.modalImageMessage}>
              {file}
            </div>
          </Modal>

        </article>
      ) : (
        <article className={styles.bannerUnSeen} ref={ref}>
          <div className={styles.bannerContentWrapper}>
            {message.banner}
          </div>
        </article>
      )}
    </>
  );
});

Message.displayName = 'Message'
export default memo(Message);
