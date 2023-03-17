import React, { memo, useEffect, useRef, useState } from "react";
import styles from "./message.module.css";
import { getTime } from "../../utils/utils";
import { useMutation } from "react-query";
import { seenMessage } from "../../utils/apiUtils";
import MessageOperations from "./messageOperation/messageOperations";

const Message = ({ message, own }) => {
  const [openMessageMenu, setOpenMessageMenu] = useState(false);
  const menuRef = useRef(null);
  const { mutate: switchToSeen } = useMutation(seenMessage);

  useEffect(() => {
    //Checks if message is unseen
    if (own && message.seen) return;
    switchToSeen(message._id);
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
      <div className={styles.mainMessageDiv} ref={own ? menuRef : null}>
        <div className={styles.contentWrapper} onClick={handleMessageOperation}>
          <div className={own ? styles.ownMessage : styles.otherMessage}>
            <div dir="auto" className={styles.messageTextDiv}>
              {message.text}
            </div>
            <span>{getTime(message.createdAt)}</span>
          </div>
          {openMessageMenu && <MessageOperations />}
        </div>
      </div>
    </>
  );
};

export default memo(Message);
