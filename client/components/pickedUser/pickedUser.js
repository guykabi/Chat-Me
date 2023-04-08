import React, { memo } from "react";
import styles from "./pickedUser.module.css";
import Image from "next/image";
import noAvatar from "../../public/images/no-avatar.png";

const PickedUser = ({ user, onRemove }) => {
  return (
    <>
      <article className={styles.pickedUserShow}>
        <Image 
         src={user?.image ? user.image.url : noAvatar}
         alt={user.name} 
         width={20}
         height={20}
         style={{borderRadius:'50%'}}/>

        <div aria-label="user-name">{user.name}</div>
        
        <span
          className={styles.xDelete}
          onClick={() => onRemove(user)}
          role="button"
        >
          x
        </span>
      </article>
    </>
  );
};

export default memo(PickedUser);
