import React, {
  memo,
  useEffect,
  useState,
  useContext,
  forwardRef,
  useCallback,
} from "react";
import { chatContext } from "../../context/chatContext";
import styles from "./message.module.css";
import { getTime, searchPastMember, handleFilterCons } from "../../utils/utils";
import useClickOutSide from "../../hooks/useClickOutside";
import { useMutation } from "react-query";
import { seenMessage, handleForwardMessage } from "../../utils/apiUtils";
import MessageOperations from "./messageOperation/messageOperations";
import { FcLike } from "react-icons/fc";
import { AiOutlineDown } from "react-icons/ai";
import Image from "next/image";
import Modal from "../Modal/modal";
import GroupPerson from "../group-person/groupPerson";
import { useGetCacheQuery } from "../../hooks/useGetQuery";
import Picker from "../picker/picker";

const Message = forwardRef(({ message, own }, ref) => {
  const { currentChat, currentUser, Socket } = useContext(chatContext);
  const [memeberName, setMemberName] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [toggleDetailsMenu, setToggleDetailsMenu] = useState(true);
  const { visibleRef, isVisible, setIsVisible } = useClickOutSide(false);
  const allUsers = useGetCacheQuery("users");
  const conversations = useGetCacheQuery("conversations");

  const { mutate: switchToSeen } = useMutation(seenMessage);

  const { mutate: forward } = useMutation(handleForwardMessage, {
    onSuccess: (data) => {
      if (data.message !== "New message just added") return;
      setShowForward(false);
      Socket.emit("forward-message", data.data, data.receivers);
    },
  });

  useEffect(() => {
    //Checks if message is unseen
    if (message?.banner) return;
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

  const openModal = useCallback(() => {
    setShowModal(true);
  }, [showModal]);

  const closeModal = () => {
    setToggleDetailsMenu(true);
    setShowModal(false);
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
    let fixedMessage = {};
    fixedMessage.text = message.text;
    fixedMessage.sender = currentUser._id;
    if (message?.image) {
      fixedMessage.image = message.image;
    }

    forward({ receivers: e, fixedMessage });
  };

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
          <h3>Seen</h3>
        </div>
        <div
          className={
            toggleDetailsMenu ? styles.likesHeader : styles.likesHeaderActive
          }
          role="button"
          onClick={() => setToggleDetailsMenu(false)}
        >
          <h3>Likes</h3>
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

  const image = (
    <Image
      fill
      style={{ objectFit:showImage?"contain":"cover"}}
      placeholder="blur"
      blurDataURL={message?.image?.base64}
      src={message?.image?.url}
      alt={message?.text ? message?.text : "img"}
    />
  );

  return (
    <>
      {!message.banner ? (
        <article className={styles.mainMessageDiv} ref={ref}>
          <main className={styles.contentWrapper} ref={visibleRef}>
            <div className={own ? styles.ownMessage : styles.otherMessage}>
              {currentChat.chatName && (
                <header className={styles.topOfMessage}>
                  <div aria-label={memeberName}>
                    <strong>{memeberName}</strong>
                  </div>
                  {message?.image ? (
                    <div
                      className={styles.dropMenuSignImage}
                      onClick={handleMessageOperationMenu}
                    >
                      <AiOutlineDown />
                    </div>
                  ) : (
                    <div
                      className={styles.dropMenuSign}
                      onClick={handleMessageOperationMenu}
                    >
                      <AiOutlineDown />
                    </div>
                  )}
                </header>
              )}

              {!currentChat.chatName && (
                <header className={styles.topOfMessage}>
                  <div
                    className={styles.dropMenuSign}
                    onClick={handleMessageOperationMenu}
                  >
                    <AiOutlineDown />
                  </div>
                </header>
              )}
              {message.image ? (
                <div className={styles.messageImageWrapper} onClick={openImage}>
                  {image}
                </div>
              ) : null}
              {message.text && (
                <div dir="auto" className={styles.messageTextDiv}>
                  {message.text}
                </div>
              )}

              <div className={styles.timeBatch}>
                {getTime(message.createdAt)}
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
                  onDetailModal={openModal}
                  onForwardModal={openForwardModal}
                />
              )}
            </div>
          </main>
          <Modal show={showModal} onClose={closeModal} title="Message Details">
            {messageDetails}
          </Modal>

          <Modal
            show={showForward}
            onClose={closeForward}
            title="Forward to..."
          >
            <Picker
              items={conversations}
              type="cons"
              onFinalPick={handleForward}
            />
          </Modal>

          <Modal
            show={showImage}
            onClose={() => setShowImage(false)}
            isFileMessage={true}
          >
            <div className={styles.modalImageMessage}>{image}</div>
          </Modal>
        </article>
      ) : (
        <article className={styles.bannerUnSeen}>
          <div className={styles.bannerContentWrapper}>{message.banner}</div>
        </article>
      )}
    </>
  );
});

export default memo(Message);
