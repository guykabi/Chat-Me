import React, { memo } from "react";
import styles from "./online.module.css";
import noAvatar from "../../public/images/no-avatar.png";
import Image from "next/image";

const Online = ({ user }) => {
  return (
    <>
    <div className={styles.mainOnlineDiv} aria-label="online user">
      <div className={styles.chatOnlineImgContainer}>
        <Image
          style={{borderRadius:'50%'}}
          src={user?.image?.url ? user.image.url : noAvatar}
          alt={user.name}
          width={35}
          height={35}
        />
        <div className={styles.chatOnlineBadge}></div>
      </div>
      <span className={styles.chatOnlineName}>{user.name}</span>
    </div>
    </>
  );
};

export default memo(Online);
