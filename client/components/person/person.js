import React, { useContext, useEffect, useState, memo } from "react";
import styles from "./person.module.css";
import Image from "next/image";
import noAvatar from '../../public/images/no-avatar.png'
import { chatContext } from "../../context/chatContext";
import { setUserStatus, excludeFieldsUserData } from "../../utils/utils";
import {useErrorBoundary} from 'react-error-boundary'
import {
  friendRequest,
  approveFriend,
  unapproveFriend,
  removeFriend,
  createConversation,
} from "../../utils/apiUtils";
import { useMutation } from "react-query";
import { useGetUser } from "../../hooks/useUser";


const Person = ({ user, decreaseNotify }) => {
  const { currentUser, Socket, dispatch } = useContext(chatContext);
  const {showBoundary} = useErrorBoundary()
  const [personStatus, setPersonStatus] = useState();
  const [toDeclineRequest, setToDeclineRequest] = useState(false);

  //React-Query functions for request/cancel-request/add/remove friend or conversation!

  const { mutate: friendshipRequest } = useMutation(friendRequest, {
    onSuccess: (data) => {
      if (data === "Request has been made!") {
        setPersonStatus("Pending");

        //Sending to notify the user about the request he just got!
        let notifyObj = {
          reciever: user._id,
          sender: excludeFieldsUserData(currentUser),
          message: "Friend request",
        };

        Socket.emit("notification", notifyObj);
      }

      if (data === "Request has been removed!" && personStatus === "Pending") {
        setPersonStatus("Add");

        let notifyObj = {
          reciever: user._id,
          sender: excludeFieldsUserData(currentUser),
          message: data,
        };

        Socket.emit("notification", notifyObj);
      }
    },
    onError:error=>showBoundary(error)
  });

  const { mutate: approveRequest } = useMutation(approveFriend, {
    onSuccess: (data) => {
      if (data.message === "The Friend approval has been done") {
        //Checking the correct status of the fresh approved user
        setPersonStatus(setUserStatus(data.user, user));
        dispatch({ type: "CURRENT_USER", payload: data.user });

        //Send back to navbar to remove approved request from list!
        decreaseNotify();

        let notifyObj = {
          reciever: user._id,
          sender: excludeFieldsUserData(currentUser),
          message: data.message,
        };

        Socket.emit("notification", notifyObj);
      }
    },
    onError:error=>showBoundary(error)
  });

  const { mutate: unapprove } = useMutation(unapproveFriend, {
    onSuccess: (data) => {
      if ((data.message = "Request has been decline!")) {
        setPersonStatus(setUserStatus(data.user, user));
        setToDeclineRequest(false);
        dispatch({ type: "CURRENT_USER", payload: data.user });
        //Send back to navbar to remove rejected request from list!
        decreaseNotify();

        let notifyObj = {
          reciever: user._id,
          sender: excludeFieldsUserData(currentUser),
          message: data.message,
        };

        Socket.emit("notification", notifyObj);
      }
    },
    onError:error=>showBoundary(error)
  });

  const { mutate: remove } = useMutation(removeFriend, {
    onSuccess: (data) => {
      if ((data.message = "Friend has been removed!")) {
        setPersonStatus("Add");
        dispatch({ type: "CURRENT_USER", payload: data.user });
      }
    },
    onError:error=>showBoundary(error)
  });

  const { mutate: newConversation } = useMutation(createConversation, {
    onSuccess: (data) => {
      if (data === "Conversation already exist") return;

      //Adding temporary friend field just to present name and image of friend
      data.conversation.friend = user
      Socket.emit("new-conversation", data.conversation);
    },
    onError:error=>showBoundary(error)
  });

  //Triggered by the incoming socket to get user update data
  const onSuccess = () => {dispatch({ type: "CURRENT_USER", payload: data });};
  const onError = (error) =>{showBoundary(error)}
  const { data, refetch: getUserData } = useGetUser(
        currentUser._id,false,onSuccess,onError
  );


  useEffect(() => {
    let status = setUserStatus(currentUser, user);
    setPersonStatus(status);

    if (status !== "Approve") return;
    setToDeclineRequest(true);
  }, []);

  useEffect(() => {
    const eventHandler = (data) => {
      if (data.message === "Friend request") {
        setPersonStatus("Approve");
        setToDeclineRequest(true);
        getUserData();
      }
      if (data.message === "Request has been removed!") {
        //If the person declined the user request
        setPersonStatus("Add");
        getUserData();
      }
      if (data.message === "The Friend approval has been done") {
        //User just got approved!
        setPersonStatus("Friend");
        getUserData();
      }
      if (data.message === "Request has been decline!") {
        setPersonStatus("Add");
      }
    };

    Socket.on("incoming-notification", eventHandler);
    return () => Socket.off("incoming-notification", eventHandler);
  }, [Socket]);

  const handlePersonStatusChange = (e) => {
    e.stopPropagation();
    let obj = { currentUserId: currentUser._id, friendId: user._id };
    if (personStatus === "Add") {
      //Send friendship request
      friendshipRequest(obj);
      return;
    }
    if (personStatus === "Pending") {
      //Cancelling the friendship request
      friendshipRequest(obj);
      return;
    }
    if (personStatus === "Approve") {
      //Approve person's friendship request
      approveRequest(obj);
      setToDeclineRequest(false);
      return;
    }
    if (personStatus === "Friend") {
      //Unfriend
      remove(obj);
      return;
    }
  };

  const unapproveRequest = (e) => {
    e.stopPropagation();
    let obj = { currentUserId: currentUser._id, friendId: user._id };
    unapprove(obj);
  };

  const addConversation = () => {
    newConversation({ userId: currentUser._id,friendId:user._id });
  };

  return (
    <>
      <section
        className={styles.personWrapper}
        onMouseDown={(e) => e.preventDefault()}
        onClick={addConversation}
      >
        <div className={styles.personImageWrapper}>
          <Image
            src={user?.image ? user.image.url : noAvatar}
            alt={user.name}
            style={{borderRadius:'50%',alignItems:'center'}}
            width={30}
            height={30}
          />
        </div>

        <div className={styles.personNameWrapper}>
          <div>{user.name}</div>
        </div>

        <div className={styles.addSign}>
          {toDeclineRequest && (
            <div
              className={styles.declineRequestDiv}
              onClick={unapproveRequest}
              role="button"
              aria-label="Decline request"
              onMouseDown={(e) => e.preventDefault()}
            >
              Decline
            </div>
          )}
          <div
            className={styles.personActionSign}
            role="button"
            aria-label={`${personStatus}`}
            onClick={handlePersonStatusChange}
            onMouseDown={(e) => e.preventDefault()}
          >
            {personStatus}
          </div>
        </div>
      </section>
    </>
  );
};

export default memo(Person);
