import React, { useContext, useState, useMemo, useEffect } from "react";
import styles from "./chatDetails.module.css";
import { chatContext } from "../../context/chatContext";
import ReturnIcon from "../UI/returnIcon/returnIcon";
import Input from "../UI/Input/Input";
import GroupPerson from "../group-person/groupPerson";
import Button from "../UI/Button/button";
import { useMutation, useQuery } from "react-query";
import { updateConversation, getAllusers } from "../../utils/apiUtils";
import Modal from "../Modal/modal";

const EditGroup = ({ onReturn }) => {
  const { currentChat, Socket, dispatch } = useContext(chatContext);
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [pickedUsersToAdd, setPickedUsersToAdd] = useState([]);
  const [groupChangedDetails, setGroupChangedDetails] = useState({});
  const [isMenu, setIsMenu] = useState(null);

  const { refetch } = useQuery("users", getAllusers, {
    onSuccess: (data) => {
      let chatMembersIds = currentChat.participants.map((p) => p._id);
      let filteredData = data.filter((u) => !chatMembersIds.includes(u._id));
      setAllUsers(filteredData);
    },
    enabled: false,
  });

  const { mutate: update } = useMutation(updateConversation, {
    onSuccess: (data) => {
      if (data.message !== "Update") return;
      Socket.emit("new-conversation", data.conversation);
      dispatch({ type: "CURRENT_CHAT", payload: data.conversation });
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  useEffect(() => {
    if (!currentChat.chatName) return;
    setIsGroup(true);
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
    refetch();
  };

  const handleChatDetailChange = (e) => {
    const { value, name } = e.target;

    if (value === currentChat.chatName && name === "chatName") {
      delete groupChangedDetails[name];
      return;
    }
    setGroupChangedDetails({ ...groupChangedDetails, [name]: value });
  };

  const handleUserPick = (e) => {
    if (pickedUsersToAdd.find((p) => p._id === e._id)) return;
    setPickedUsersToAdd((prev) => [...prev, e]);
  };

  const removePickedFriend = (pickedUser) => {
    setPickedUsersToAdd((prev) => prev.filter((u) => u._id !== pickedUser._id));
  };

  const submitChatDetailChange = (e) => {
    e.preventDefault();
    if (!Object.keys(groupChangedDetails).length) return;
    update({ conId: currentChat._id, obj: groupChangedDetails });
  };

  const memoMembers = useMemo(
    () =>
      currentChat.participants.map((user) => (
        <GroupPerson
          key={user._id}
          user={user}
          onPick={() => console.log("Hey")}
          onMenu={(e) => setIsMenu(e)}
          menu={isMenu}
          manager={currentChat?.manager?._id === user._id}
        />
      )),
    [isMenu]
  );

  const memoAllUsers = useMemo(
    () =>
      allUsers?.map((user) => {
        return (
          <GroupPerson
            key={user._id}
            user={user}
            onPick={handleUserPick}
            menu={isMenu}
          />
        );
      }),
    [allUsers]
  );

  const pickedNewUsers = pickedUsersToAdd.map((user) => (
    <div key={user._id} className={styles.pickedUserShow}>
      <img src={user?.image ? user.image : "/images/no-avatar.png"} />
      <span aria-label="user-image">{user.name}</span>
      <span
        className={styles.xDelete}
        onClick={() => removePickedFriend(user)}
        role="button"
      >
        x
      </span>
    </div>
  ));

  return (
    <main className={styles.mainEditGroup}>
      <ReturnIcon onClick={onReturn} />
      <header className={styles.headerWrapper}>
        <form onSubmit={submitChatDetailChange}>
          {isGroup && (
            <div className={styles.saveChangesBtn}>
              <Button
                width="50%"
                height="10"
                text="Save"
                className="secondaryBtn"
                type="submit"
              />
            </div>
          )}

          {isGroup ? (
            <h2>
              <Input
                height="20"
                width="50"
                name="chatName"
                defaultValue={currentChat.chatName}
                placeholder="Group name"
                textAlign="center"
                fontSize="x-large"
                fontWeight="bold"
                onChange={handleChatDetailChange}
              />
            </h2>
          ) : (
            <h2>
              <div>{currentChat?.friend?.name}</div>
            </h2>
          )}

          <article className={styles.chatImageWrapper}>
            {isGroup ? (
              <img
                src={
                  currentChat?.image
                    ? currentChat.image
                    : "/images/no-avatarGroup.png"
                }
                alt={currentChat.chatName}
              />
            ) : (
              <img
                src={
                  currentChat?.friend?.image
                    ? currentChat.friend.image
                    : "/images/no-avatar.png"
                }
                alt={currentChat?.friend?.name}
              />
            )}
          </article>
        </form>
      </header>

      <section className={styles.membersOfChat}>
        {isGroup && memoMembers}
      </section>

      {isGroup && (
        <section className={styles.buttonsWrapper}>
          <Button
            width="6"
            height="15"
            text="Leave group"
            className="secondaryBtn"
          />
          <Button
            width="8"
            height="15"
            text="Add member"
            className="secondaryBtn"
            onClick={handleOpenModal}
          />
          <Button
            width="6"
            height="15"
            text="Mute group"
            className="secondaryBtn"
          />
        </section>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <header>Choose user</header>

        {pickedUsersToAdd.length ? (
          <section className={styles.pickedUsersWrapper}>
            {pickedNewUsers}
          </section>
        ) : null}

        {allUsers.length ? (
          <section className={styles.searchInputWrapper}>
            <Input width="50" height="30" placeholder="Search user to add" />
          </section>
        ) : null}

        <section>{allUsers.length ? memoAllUsers : <h3>No Users</h3>}</section>
      </Modal>
    </main>
  );
};

export default EditGroup;
