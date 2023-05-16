import React, { memo, useContext } from "react";
import { chatContext } from "../../../context/chatContext";
import styles from "./messageOperations.module.css";
import { useTranslation } from "next-i18next";
import { AiOutlineLike } from "react-icons/ai";
import { AiOutlineDislike } from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { TiArrowForwardOutline } from "react-icons/ti";
import {
  handleLikeMessage,
  handleDeleteMessage,
} from "../../../utils/apiUtils";
import { useMutation } from "react-query";

const MessageOperations = ({
  own,
  messageId,
  onDetailModal,
  ownLike,
  onCloseMenu,
  onForwardModal,
}) => {
  const { currentUser, currentChat, Socket } = useContext(chatContext);
  const {t} = useTranslation('common')

  const { mutate: like } = useMutation(handleLikeMessage, {
    onSuccess: (data) => {
      if (!data.message) return;
      Socket.emit("sendMessage", data.editMsg, currentChat._id, "Not trigger");
      onCloseMenu();
    },
  });

  const { mutate: deleteMessage } = useMutation(handleDeleteMessage, {
    onSuccess: ({ message, deleted }) => {
      if (message !== "Deleted") return;
      Socket.emit(
        "sendMessage",
        { deleted, message },
        currentChat._id,
        "Not trigger"
      );
      onCloseMenu();
    },
  });

  const likingMessage = () => {
    like({ messageId, userId: currentUser._id });
  };

  const handleDelete = () => {
    deleteMessage(messageId);
  };

  return (
    <>
      <div className={own ? styles.messageMenuDiv : styles.otherMenuDiv}>
        {own ? null : (
          <div
            aria-label={ownLike ? "UnLike message" : "Like message"}
            role="button"
            onClick={likingMessage}
          >
            {ownLike ? (
              <>
                <AiOutlineDislike />
                UnLike message
              </>
            ) : (
              <>
                <AiOutlineLike />
                Like message
              </>
            )}
          </div>
        )}
        {own ? (
          <div
            aria-label="Details"
            role="button"
            onClick={() => onDetailModal()}
          >
            <IoMdInformationCircleOutline />
            {t('chat.messageMenu.details')}
          </div>
        ) : null}
        <div
          aria-label="Forward to"
          role="button"
          onClick={() => onForwardModal()}
        >
          <TiArrowForwardOutline />
          {t('chat.messageMenu.forward')}
        </div>
        {own ? (
          <div aria-label="Delete message" role="button" onClick={handleDelete}>
            <BsTrash3 />
            {t('chat.messageMenu.delete')}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default memo(MessageOperations);
