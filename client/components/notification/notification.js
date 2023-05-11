import React, { useContext, useEffect, useState } from "react";
import styles from "./notification.module.css";
import Image from "next/image";
import noAvatar from "../../public/images/no-avatar.png";
import { chatContext } from "../../context/chatContext";
import { useMutation } from "react-query";
import { excludeFieldsUserData } from "../../utils/utils";
import { approveFriend, unapproveFriend } from "../../utils/apiUtils";
import { useErrorBoundary } from "react-error-boundary";

const Notification = ({ notification, decreaseNotify }) => {
  const { currentUser, dispatch, Socket } = useContext(chatContext);
  const { showBoundary } = useErrorBoundary();
  const [isRequest, setIsRequest] = useState(true);

  const { mutate: approveRequest } = useMutation(approveFriend, {
    onSuccess: ({ message, user }) => {
      if (message !== "The Friend approval has been done") return;

      dispatch({ type: "CURRENT_USER", payload: user });

      //Send back to navbar to remove approved request from list!
      decreaseNotify();

      let notifyObj = {
        reciever: notification.sender._id,
        sender: excludeFieldsUserData(currentUser),
        message,
      };

      Socket.emit("notification", notifyObj);
    },
    onError: (error) => showBoundary(error),
  });

  const { mutate: unapprove } = useMutation(unapproveFriend, {
    onSuccess: ({ message, user }) => {
      if (message !== "Request has been decline!") return;
      dispatch({ type: "CURRENT_USER", payload: user });

      //Send back to navbar to remove declined request from list!
      decreaseNotify();

      let notifyObj = {
        reciever: notification.sender._id,
        sender: excludeFieldsUserData(currentUser),
        message,
      };

      Socket.emit("notification", notifyObj);
    },
    onError: (error) => showBoundary(error),
  });

  useEffect(() => {
    if (notification.message === "Friend request") return;
    setIsRequest(false);
  }, []);

  const handleApprove = () => {
    let obj = {
      currentUserId: currentUser._id,
      friendId: notification.sender._id,
    };
    approveRequest(obj);
  };

  const handleDecline = () => {
    let obj = {
      currentUserId: currentUser._id,
      friendId: notification.sender._id,
    };
    unapprove(obj);
  };

  return (
    <>
      <section className={styles.notificationMainDiv} aria-label="Notification">
        <article className={styles.notifyPersonImgWrapper}>
          <Image
            style={{ borderRadius: "50%" }}
            src={
              notification.sender.image
                ? notification.sender.image.url
                : noAvatar
            }
            placeholder={notification?.image?.url ? "blur" : "empty"}
            blurDataURL={notification?.image?.base64}
            alt={notification.sender.name}
            width={35}
            height={35}
          />
        </article>

        <article className={styles.mainNotificationWrapper}>
          <div className={styles.notificationDetails}>
            <strong>{notification.sender.name}</strong> - {notification.message}
          </div>
          {isRequest && (
            <div className={styles.notificationButtonsDiv}>
              <button onClick={handleDecline}>Decline</button>

              <button onClick={handleApprove}>Approve</button>
            </div>
          )}
        </article>
      </section>
    </>
  );
};

export default Notification;
