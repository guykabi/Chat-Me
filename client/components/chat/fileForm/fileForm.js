import React, { useContext, useEffect, useState } from "react";
import styles from "./fileForm.module.css";
import { chatContext } from "../../../context/chatContext";
import Image from "next/image";
import Button from "../../UI/Button/button";
import InputEmoji from "react-input-emoji";
import Video from "../../UI/video/video";

const FileForm = ({ file, onFile, loading }) => {
  const { currentChat, currentUser } = useContext(chatContext);
  const [fileMessage, setFileMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    let pre = URL.createObjectURL(file);
    setPreview(pre);
    setFileType(file.type.split("/")[0]);
  }, []);

  const handleFileForm = (e) => {
    e.preventDefault();
    let messageObj = {};
    messageObj.conversation = currentChat._id;
    messageObj.sender = currentUser._id;
    messageObj.text = fileMessage && fileMessage;

    if (file) {
      const data = new FormData();
      for (const [key, value] of Object.entries(messageObj)) {
        data.append([key], value);
      }
      data.append("messageFile", file);
      onFile({ message: "File", data });
    }
  };

  return (
    <>
      <section className={styles.fileFormWrapper}>
        <header>
          {fileType == "image" ? <h3>Your Image</h3> : <h3>Your Video</h3>}
        </header>
        <main className={styles.formWrapper}>
          <form onSubmit={handleFileForm} className={styles.form}>
            <div
              aria-label="file preview"
              className={styles.previewImageWrapper}
            >
              {preview &&
                (fileType == "image" ? (
                  <>
                    <Image
                      fill
                      style={{ objectFit: "cover" }}
                      src={preview}
                      alt="chosen"
                    />
                  </>
                ) : (
                  <>
                    <Video video={URL.createObjectURL(file)} preview={true} />
                  </>
                ))}
            </div>
            <div className={styles.imageTextInput}>
              <InputEmoji
                value={fileMessage}
                onChange={setFileMessage}
                width={60}
                height={5}
                placeholder="Type a message..."
                borderRadius={10}
              />
            </div>
            <div className={styles.submitBtnWrapper}>
              <Button
                className="secondaryBtn"
                text={loading ? "Loading..." : "Send"}
                type="submit"
                width={8}
                height={10}
              />
            </div>
          </form>
        </main>
      </section>
    </>
  );
};

export default FileForm;
