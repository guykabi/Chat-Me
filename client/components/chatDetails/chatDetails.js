import React, { useContext, useState, useMemo, useEffect, useRef } from "react";
import styles from "./chatDetails.module.css";
import Image from "next/image";
import noAvatar from "../../public/images/no-avatar.png";
import noAvatarGroup from "../../public/images/no-avatarGroup.png";
import { chatContext } from "../../context/chatContext";
import ReturnIcon from "../UI/returnIcon/returnIcon";
import Input from "../UI/Input/Input";
import GroupPerson from "../group-person/groupPerson";
import Group from "../group/group";
import Button from "../UI/Button/button";
import { useMutation, useQuery, QueryClient } from "react-query";
import Modal from "../Modal/modal";
import PickedUser from "../pickedUser/pickedUser";
import { BiSend } from "react-icons/bi";
import { BsFillCameraFill } from "react-icons/bs";
import { useGetFetchQuery } from "../../hooks/useGetQuery";
import {
  updateConversation,
  getAllusers,
  addGroupMember,
  removeGroupMember,
  addManager,
  removeManager,
} from "../../utils/apiUtils";


const ChatDetails = ({ onReturn }) => {
  const { currentChat, currentUser, Socket, dispatch } =
    useContext(chatContext);
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [query, setQuery] = useState("");
  const [pickedUsersToAdd, setPickedUsersToAdd] = useState([]);
  const [groupChangedDetails, setGroupChangedDetails] = useState({});
  const [isMenu, setIsMenu] = useState(null);
  const [errorText, setErrorText] = useState(null);
  const [addMemberErrorText, setAddMemberErrorText] = useState(null);
  const conversations = useGetFetchQuery("conversations");
  const fileRef = useRef(null);

  ////////////API calls - reactQuery/////////////

  const { refetch } = useQuery("users", getAllusers, {
    onSuccess: (data) => {
      //Filter only unmembers of the group
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
    onError: () => {
      setErrorText("Unabled to edit");
      let timer = setTimeout(() => {
        setErrorText(null);
      }, 3000);
      return () => clearTimeout(timer);
    },
  });

  const { mutate: addMember } = useMutation(addGroupMember, {
    onSuccess: ({ message, conversation }) => {
      if (message !== "Member added") return;
      Socket.emit("new-conversation", conversation);
      dispatch({ type: "CURRENT_CHAT", payload: conversation });
    },
    onError: () => {
      setAddMemberErrorText("Unabled to add");
      let timer = setTimeout(() => {
        setAddMemberErrorText(null);
      }, 3000);
      return () => clearTimeout(timer);
    },
  });

  const { mutate: removeMember } = useMutation(removeGroupMember, {
    onSuccess: ({ message, conversation }) => {
      if (message !== "Member removed") return;
      Socket.emit("new-conversation", conversation);
      dispatch({ type: "CURRENT_CHAT", payload: conversation });
    },
    onError: () => {
      setErrorText("Unabled to remove");
      let timer = setTimeout(() => {
        setErrorText(null);
      }, 3000);
      return () => clearTimeout(timer);
    },
  });

  const { mutate: setManager } = useMutation(addManager, {
    onSuccess: ({ message, conversation }) => {
      if (message !== "Manager added") return;
      Socket.emit("new-conversation", conversation);
      dispatch({ type: "CURRENT_CHAT", payload: conversation });
    },
    onError: () => {
      setErrorText("Unabled to set manager");
      let timer = setTimeout(() => {
        setErrorText(null);
      }, 3000);
      return () => clearTimeout(timer);
    },
  });

  const { mutate: managerRemoval } = useMutation(removeManager, {
    onSuccess: ({ message, conversation }) => {
      if (message !== "Manager removed") return;
      Socket.emit("new-conversation", conversation);
      dispatch({ type: "CURRENT_CHAT", payload: conversation });
    },
    onError: () => {
      setErrorText("Unabled to remove");
      let timer = setTimeout(() => {
        setErrorText(null);
      }, 3000);
      return () => clearTimeout(timer);
    },
  });

  ////////////---------/////////////

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

    if (e.target?.files?.[0]) {
      const fileUploaded = e.target.files[0];
      setGroupChangedDetails({ ...groupChangedDetails, [name]: fileUploaded });
      return;
    }

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

  const removePickedUser = (pickedUser) => {
    setPickedUsersToAdd((prev) => prev.filter((u) => u._id !== pickedUser._id));
  };

  const handleModalClose = () => {
    setShowModal(false);
    setPickedUsersToAdd([]);
  };

  const handleMemberAdding = () => {
    if (!pickedUsersToAdd.length) return;
    let obj = { participants: pickedUsersToAdd.map((p) => p._id) };
    addMember({ conId: currentChat._id, obj });
  };

  const handleMemberRemoval = (e) => {
    let obj;

    if (typeof e !== "string") {
      //When the only manager wants to leave the group -
      //Sets a random member of the group as manager
      if (
        currentChat.manager.length === 1 &&
        currentChat.manager[0]._id === currentUser._id
      ) {
        let setAsManager = currentChat.participants.find(
          (p) => p._id !== currentUser._id
        );
        let obj = { manager: setAsManager._id };
        setManager({ conId: currentChat._id, obj });
      }

      let obj = { participants: currentUser._id };
      removeMember({ conId: currentChat._id, obj });
      return;
    }

    obj = { participants: e };
    removeMember({ conId: currentChat._id, obj });
  };

  const handleManagerAdding = (e) => {
    let obj = { manager: e };
    setManager({ conId: currentChat._id, obj });
  };

  const handleManagerRemoval = (e) => {
    let obj = { manager: e };
    managerRemoval({ conId: currentChat._id, obj });
  };

  const submitChatDetailChange = (e) => {
    e.preventDefault();
    if (!Object.keys(groupChangedDetails).length) return;
    const data = new FormData();
    for (const [key, value] of Object.entries(groupChangedDetails)) {
      data.append([key], value);
    }

    if (currentChat?.image?.url) {
      data.append("removeImage", currentChat.image.cloudinary_id);
    }

    update({ conId: currentChat._id, obj: data });
  };

  const handleInputFileClick = (e) => {
    fileRef.current.click();
  };

  const memoGroupMembers = useMemo(
    () =>
      currentChat.participants.map((user) => (
        <GroupPerson
          key={user._id}
          user={user}
          onRemove={handleMemberRemoval}
          onAddManager={handleManagerAdding}
          onRemoveManager={handleManagerRemoval}
          onMenu={(e) => setIsMenu(e)}
          menu={isMenu}
          manager={currentChat?.manager.some((m) => m._id === user._id)}
        />
      )),
    [isMenu]
  );

  const jointGroups = useMemo(
    () =>
      conversations
        .filter(
          (j) =>
            j.chatName &&
            j.participants.some((p) => p._id === currentChat?.friend?._id)
        )
        .map((con) => <Group key={con._id} group={con} />),

    [conversations]
  );

  const allUsersToPick = useMemo(
    () =>
      allUsers
        ?.filter((u) =>
          u.name.toLowerCase().includes(query.trim().toLowerCase())
        )
        .map((user) => (
          <GroupPerson key={user._id} user={user} onPick={handleUserPick} />
        )),
    [allUsers, query, pickedUsersToAdd]
  );

  const pickedNewUsers = pickedUsersToAdd.map((user) => (
    <PickedUser key={user._id} user={user} onRemove={removePickedUser} />
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
          {errorText && <p>{errorText}</p>}
          <article className={styles.chatImageWrapper}>
            {isGroup ? (
              <>
                <div>
                  <Image
                    src={
                      currentChat?.image?.url
                        ? currentChat.image.url
                        : noAvatarGroup
                    }
                    width={150}
                    height={140}
                    style={{
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginTop: "10%",
                    }}
                    alt={currentChat.chatName}
                  />
                </div>
                <div className={styles.chooseImageWrapper}>
                  <BsFillCameraFill onClick={handleInputFileClick} />
                  <Input
                    type="file"
                    name="userImage"
                    onChange={handleChatDetailChange}
                    className="invisibleFileInput"
                    width={0}
                    height={0}
                    ref={fileRef}
                  />
                </div>
              </>
            ) : (
              <Image
                width={150}
                height={120}
                src={
                  currentChat?.friend?.image?.url
                    ? currentChat.friend.image.url
                    : noAvatar
                }
                style={{
                  objectFit: "cover",
                  borderRadius: "50%",
                  marginTop: "10%",
                }}
                alt={currentChat?.friend?.name}
              />
            )}
          </article>
        </form>
      </header>

      {!isGroup && (
        <h2>
          {`Joint Groups with ${currentChat?.friend?.name} - (${jointGroups.length})`}
        </h2>
      )}

      {isGroup ? (
        <section className={styles.groupMembers}>{memoGroupMembers}</section>
      ) : (
        <section className={styles.jointGroupsWrapper}>{jointGroups}</section>
      )}

      {isGroup && (
        <section className={styles.buttonsWrapper}>
          <Button
            width="8"
            height="25"
            text="Leave group"
            className="secondaryBtn"
            onClick={handleMemberRemoval}
          />
          <Button
            width="8"
            height="25"
            text="Add member"
            //Only manager can add
            disabled={
              !currentChat?.manager.some((m) => m._id === currentUser._id)
            }
            className="secondaryBtn"
            onClick={handleOpenModal}
          />
        </section>
      )}

      <Modal show={showModal} onClose={handleModalClose}>
        <header>
          {addMemberErrorText ? addMemberErrorText : "Choose user"}
        </header>
        {pickedUsersToAdd.length ? (
          <section className={styles.pickedUsersWrapper}>
            {pickedNewUsers}
            <span
              className={styles.sendNewMembersBtn}
              role="button"
              aria-label="Add picked users"
              onClick={handleMemberAdding}
            >
              <BiSend />
            </span>
          </section>
        ) : null}

        {allUsers.length ? (
          <section className={styles.searchInputWrapper}>
            <Input
              width="50"
              height="30"
              placeholder="Search user to add"
              onChange={(e) => setQuery(e.target.value)}
            />
          </section>
        ) : null}

        <section>
          {allUsers.length ? allUsersToPick : <h3>No Users</h3>}
        </section>
      </Modal>
    </main>
  );
};

export default ChatDetails;
