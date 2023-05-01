import React, {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import styles from "./chatDetails.module.css";
import Image from "next/image";
import { handleSeenTime } from "../../utils/utils";
import { useErrorBoundary } from "react-error-boundary";
import noAvatar from "../../public/images/no-avatar.png";
import noAvatarGroup from "../../public/images/no-avatarGroup.png";
import { chatContext } from "../../context/chatContext";
import ReturnIcon from "../UI/returnIcon/returnIcon";
import Input from "../UI/Input/Input";
import { useFormik } from "formik";
import * as yup from "yup";
import GroupPerson from "../group-person/groupPerson";
import Group from "../group/group";
import Button from "../UI/Button/button";
import { useMutation } from "react-query";
import Modal from "../Modal/modal";
import { BsFillCameraFill } from "react-icons/bs";
import { useGetCacheQuery } from "../../hooks/useGetQuery";
import Picker from "../picker/picker";
import {
  updateConversation,
  addGroupMember,
  removeGroupMember,
  addManager,
  removeManager,
} from "../../utils/apiUtils";

const ChatDetails = ({ onReturn }) => {
  const { currentChat, currentUser, Socket, dispatch } =
    useContext(chatContext);
  const { showBoundary } = useErrorBoundary();
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [chatMedia, setchatMedia] = useState(false);
  const [preview, setPreview] = useState(null);
  const [mediaImage, setMediaImage] = useState(null);
  const [file, setFile] = useState(null);
  const [addMemberErrorText, setAddMemberErrorText] = useState(null);
  const fileRef = useRef(null);
  const conversations = useGetCacheQuery("conversations");
  const users = useGetCacheQuery("users");

  ////////////API calls - reactQuery/////////////

  const { mutate: update } = useMutation(updateConversation, {
    onSuccess: (data) => {
      if (data.message !== "Update") return;
      Socket.emit("new-conversation", data.conversation);
      dispatch({ type: "CURRENT_CHAT", payload: data.conversation });
    },
    onError: (error) => showBoundary(error),
  });

  const { mutate: addMember } = useMutation(addGroupMember, {
    onSuccess: ({ message, conversation }) => {
      if (message !== "Member added") return;
      Socket.emit("new-conversation", conversation);
      dispatch({ type: "CURRENT_CHAT", payload: conversation });
    },
    onError: (error) => {
      setAddMemberErrorText("Unabled to add");
      let timer = setTimeout(() => {
        setAddMemberErrorText(null);
        showBoundary(error);
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
    onError: (error) => showBoundary(error),
  });

  const { mutate: setManager } = useMutation(addManager, {
    onSuccess: ({ message, conversation }) => {
      if (message !== "Manager added") return;
      Socket.emit("new-conversation", conversation);
      dispatch({ type: "CURRENT_CHAT", payload: conversation });
    },
    onError: (error) => showBoundary(error),
  });

  const { mutate: managerRemoval } = useMutation(removeManager, {
    onSuccess: ({ message, conversation }) => {
      if (message !== "Manager removed") return;
      Socket.emit("new-conversation", conversation);
      dispatch({ type: "CURRENT_CHAT", payload: conversation });
    },
    onError: (error) => showBoundary(error),
  });

  //------------------------------------------------------//

  useEffect(() => {
    if (!currentChat.chatName || isGroup) return;
    setIsGroup(true);
  }, []);

  const handleOpenAddMembers = () => {
    if (allUsers.length) return setShowModal(true);

    let chatMembersIds = currentChat.participants.map((p) => p._id);
    let filteredData = users.filter((u) => !chatMembersIds.includes(u._id));
    setAllUsers(filteredData);
    setShowModal(true);
  };

  const { handleSubmit, handleBlur, handleChange, touched, errors, dirty } =
    useFormik({
      enableReinitialize: true,
      initialValues: {
        chatName: currentChat?.chatName,
      },
      onSubmit: (values) => {
        if (file) {
          const formData = new FormData();

          if (values.chatName != currentChat.chatName)
            formData.append("chatName", values.chatName);

          if (currentChat?.image?.url)
            formData.append("removeImage", currentChat.image.cloudinary_id);
          formData.append("groupImage", file);

          return update({ conId: currentChat._id, body: formData });
        }
        update({ conId: currentChat._id, body: values });
      },
      validationSchema: yup.object({
        chatName: yup.string().trim().required("Chat name is required"),
      }),
    });

  const handleFilePick = (e) => {
    if (!e.target.files.length) return;
    setFile(e.target.files[0]);
    const objectUrl = URL.createObjectURL(e.target.files[0]);
    setPreview(objectUrl);
    //setIsChanged(true);
  };

  const handleAddMembersModalClose = () => {
    setShowModal(false);
  };

  const closeImagePreviewModal = () => {
    setFile(null);
    setPreview(null);
  };

  const handleMemberAdding = useCallback(
    (e) => {
      let obj = { participants: e };
      addMember({ conId: currentChat._id, obj });
    },
    [currentChat]
  );

  const handleMemberRemoval = useCallback(
    (e) => {
      let obj;

      if (typeof e !== "string" && currentChat.participants.length > 1) {
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
    },
    [currentChat]
  );

  const handleManagerAdding = useCallback(
    (e) => {
      let obj = { manager: e };
      setManager({ conId: currentChat._id, obj });
    },
    [currentChat]
  );

  const handleManagerRemoval = useCallback(
    (e) => {
      let obj = { manager: e };
      managerRemoval({ conId: currentChat._id, obj });
    },
    [currentChat]
  );

  const handleInputFileClick = (e) => {
    fileRef.current.click();
  };

  const memoItems = useMemo(() => {
    if (currentChat?.chatName) {
      return currentChat.participants;
    }
    if (!currentChat?.chatName) {
      return conversations;
    }
  }, [currentChat, conversations]);

  let groupMembers;
  if (currentChat?.chatName) {
    groupMembers = memoItems.map((user) => (
      <GroupPerson
        key={user._id}
        user={user}
        onRemove={handleMemberRemoval}
        onAddManager={handleManagerAdding}
        onRemoveManager={handleManagerRemoval}
        manager={currentChat?.manager.some((m) => m._id === user._id)}
      />
    ));
  }

  let jointGroups;
  if (!currentChat?.chatName) {
    jointGroups = memoItems
      .filter(
        (c) =>
          c.chatName &&
          c.participants.some((p) => p._id === currentChat?.friend?._id)
      )
      .map((con) => <Group key={con._id} group={con} />);
  }

  return (
    <main className={styles.mainEditGroup}>
      <ReturnIcon onClick={onReturn} />
      {isGroup ? (
        <header className={styles.headerWrapper}>
          <form onSubmit={handleSubmit}>
            <section className={styles.saveChangesBtn}>
              <Button
                width="4"
                height="10"
                text="Save"
                className="secondaryBtn"
                type="submit"
                disabled={!file && !dirty}
              />
            </section>
            <h2>
              <section className={styles.inputField}>
                <Input
                  height="20"
                  width="50"
                  name="chatName"
                  defaultValue={currentChat.chatName}
                  placeholder="Group name"
                  textAlign="center"
                  fontSize="x-large"
                  fontWeight="bold"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.chatName && errors.chatName ? (
                  <span>{errors.chatName}</span>
                ) : null}
              </section>
            </h2>
            <article className={styles.chatImageWrapper}>
              <section>
                <Image
                  src={
                    currentChat?.image?.url
                      ? currentChat.image.url
                      : noAvatarGroup
                  }
                  placeholder={currentChat?.image ? "blur" : "empty"}
                  blurDataURL={currentChat?.image?.base64}
                  width={150}
                  height={140}
                  style={{
                    objectFit: "cover",
                    borderRadius: "50%",
                    marginTop: "10%",
                  }}
                  alt={currentChat.chatName}
                />
              </section>
              <section className={styles.chooseImageWrapper}>
                <BsFillCameraFill onClick={handleInputFileClick} />
                <Input
                  type="file"
                  name="groupImage"
                  onChange={handleFilePick}
                  className="invisibleFileInput"
                  width={0}
                  height={0}
                  ref={fileRef}
                />
              </section>
            </article>
          </form>
        </header>
      ) : (
        <header className={styles.headerWrapper}>
          <h2>
            <div>{currentChat?.friend?.name}</div>
          </h2>
          <article className={styles.chatImageWrapper}>
            <Image
              width={150}
              height={150}
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
          </article>
        </header>
      )}

      <section className={styles.mediaSwitcherBtn}>
        <div
          onClick={() => setchatMedia(false)}
          className={styles.switcherBtn}
          role="button"
        >
          <strong>Main</strong>
        </div>
        <div
          onClick={() => setchatMedia(true)}
          className={styles.switcherBtn}
          role="button"
        >
          <strong>Media</strong>
        </div>
      </section>

      {!chatMedia ? (
        <section className={styles.chatMainContent}>
          {isGroup ? (
            <>
              <section className={styles.groupMembers}>{groupMembers}</section>
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
                  onClick={handleOpenAddMembers}
                />
              </section>
            </>
          ) : (
            <>
              <h3>
                {`Joint groups with ${currentChat?.friend?.name} - (${jointGroups?.length})`}
              </h3>
              <section className={styles.jointGroupsWrapper}>
                {jointGroups?.length ? (
                  jointGroups
                ) : (
                  <h3>No common groups yet...</h3>
                )}
              </section>
            </>
          )}
        </section>
      ) : (
        <section className={styles.chatMedia}>
          {currentChat.media.length ? (
            <main className={styles.mainMediaWrapper}>
              {currentChat?.media?.map((item, index) => (
                <div
                  key={index}
                  className={styles.mediaItem}
                  onClick={() => setMediaImage(item.image.url)}
                >
                  <section className={styles.timeOfMedia}>
                    {handleSeenTime(item.createdAt)}
                  </section>
                  <Image
                    fill
                    placeholder={item.image ? "blur" : "empty"}
                    blurDataURL={item.image.base64}
                    src={item.image.url}
                    alt="media-image"
                    style={{
                      objectFit: "contain",
                    }}
                  />
                </div>
              ))}
            </main>
          ) : (
            <h3>No media yet</h3>
          )}
        </section>
      )}

      <Modal show={preview} onClose={closeImagePreviewModal}>
        <section className={styles.imagePreview} aria-label="preview-image">
          <Image
            src={preview}
            width={600}
            height={260}
            style={{ objectFit: "contain", borderRadius: "5%" }}
            alt="preview"
          />
          <Button
            className="secondaryBtn"
            text="This is the one"
            width={8}
            height={15}
            onClick={() => setPreview(null)}
          />
        </section>
      </Modal>

      <Modal
        show={showModal}
        onClose={handleAddMembersModalClose}
        isError={addMemberErrorText}
      >
        <Picker
          items={allUsers}
          type="users"
          onFinalPick={handleMemberAdding}
        />
      </Modal>

      <Modal
        show={mediaImage}
        onClose={() => setMediaImage(null)}
        isFileMessage={true}
      >
        <section
          className={styles.presentChatMedia}
          aria-label="image from chat media"
        >
          <Image
            fill
            src={mediaImage}
            alt="media-image"
            style={{
              objectFit: "contain",
            }}
          />
        </section>
      </Modal>
    </main>
  );
};

export default ChatDetails;
