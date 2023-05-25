import React, {useContext,useState,useEffect,useRef} from "react";
import styles from "./chatDetails.module.css";
import Image from "next/image";
import Video from "../UI/video/video";
import { useErrorBoundary } from "react-error-boundary";
import {useTranslation} from 'next-i18next'
import noAvatar from "../../public/images/no-avatar.png";
import noAvatarGroup from "../../public/images/no-avatarGroup.png";
import { chatContext } from "../../context/chatContext";
import ReturnIcon from "../UI/returnIcon/returnIcon";
import Input from "../UI/Input/Input";
import { useFormik } from "formik";
import * as yup from "yup";
import MediaItem from "./mediaItem/mediaItem";
import Button from "../UI/Button/button";
import { useMutation } from "react-query";
import Modal from "../Modal/modal";
import { BsFillCameraFill } from "react-icons/bs";
import {Loader} from '../UI/clipLoader/clipLoader'
import {updateConversation} from "../../utils/apiUtils";
import MainContent from "./mainContent/mainContent";

const ChatDetails = ({ onReturn }) => {
  const { currentChat, Socket, dispatch } = useContext(chatContext);
  const { showBoundary } = useErrorBoundary();
  const {t} = useTranslation('common')
  const [isGroup, setIsGroup] = useState(false);
  const [chatMedia, setchatMedia] = useState(false);
  const [preview, setPreview] = useState(null);
  const [mediaImage, setMediaImage] = useState(null);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);


  const { mutate: update, isLoading:loadSubmit } = useMutation(updateConversation, {
    onSuccess: (data) => {
      if (data.message !== "Update") return;
      Socket.emit("new-conversation", data.conversation);
      setFile(null)
      dispatch({ type: "CURRENT_CHAT", payload: data.conversation });
    },
    onError: (error) => showBoundary(error),
  });


  useEffect(() => {
    if (!currentChat.chatName || isGroup) return;
    setIsGroup(true);
  }, []);

 
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
  };

  
  const closeImagePreviewModal = () => {
    setFile(null);
    setPreview(null);
  };


  const handleInputFileClick = (e) => {
    fileRef.current.click();
  };

 
  return (
    <main className={styles.mainEditGroup}>
      <ReturnIcon onClick={onReturn} /> 
      {isGroup ? (
        <header className={styles.headerWrapper}>
          <form onSubmit={handleSubmit}>
            <section className={styles.saveChangesBtn}>
              <Button
                width="6"
                height="10"
                text={loadSubmit?<Loader size={12}/>:t("chatDetails.buttons.save")}
                className="secondaryBtn"
                type="submit"
                disabled={!file && !dirty}
              />
            </section>
            
            <section className={styles.inputField}>
            <h2>
                <Input
                  height="20"
                  width="50"
                  name="chatName"
                  defaultValue={currentChat.chatName}
                  placeholder={t("chatDetails.placeholder")}
                  textAlign="center"
                  fontSize="x-large"
                  fontWeight="bold"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.chatName && errors.chatName ? (
                  <span>{errors.chatName}</span>
                ) : null}
              </h2>
              </section>
            
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
                  alt={currentChat?.chatName}
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
          <strong>{t('chatDetails.main')}</strong>
        </div>
        <div
          onClick={() => setchatMedia(true)}
          className={styles.switcherBtn}
          role="button"
        >
          <strong>{t('chatDetails.media')}</strong>
        </div>
      </section>

      {!chatMedia ? (
        <main className={styles.chatMainContent}>
          <MainContent isGroup={isGroup}/>
        </main>
      ) : (
        <main className={styles.chatMedia}>
          {currentChat?.media?.length ? (
            <section className={styles.mainMediaWrapper}>
              {currentChat?.media?.map(item => (
                <MediaItem 
                key={item._id} 
                item={item} 
                onPick={(e)=>setMediaImage(e)} />
              ))}
            </section>
          ) : (
            <h3>No media yet</h3>
          )}
        </main>
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
        show={mediaImage}
        onClose={() => setMediaImage(null)}
        isFileMessage={true}
      >
        <section
          className={styles.presentChatMedia}
          aria-label="image from chat media"
        >
          {mediaImage?.video?
          <Video video={mediaImage?.url} openVideo={true}/>:
          <Image
            fill
            src={mediaImage?.url}
            alt="media-image"
            style={{
              objectFit: "contain",
            }}
          />}
        </section>
      </Modal>

    </main>
  );
};

export default ChatDetails;
