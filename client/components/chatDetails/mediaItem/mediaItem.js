import React, { useState } from "react";
import styles from "./mediaItem.module.css";
import Image from "next/image";
import Video from "../../UI/video/video";
import { handleSeenTime } from "../../../utils/utils";

const MediaItem = ({ item, onPick }) => {
  
  return (
    <>
      <div className={styles.mediaItem} onClick={() => onPick(item.image)}>
        <section className={styles.timeOfMedia}>
          {handleSeenTime(item.createdAt)}
        </section>
        <section className={styles.itemWrapper}>
          {item?.image?.video ? (
            <Video video={item.image.url} />
          ) : (
            <Image
              fill
              sizes="(max-width: 368px) 100vw"
              placeholder={item.image ? "blur" : "empty"}
              blurDataURL={item.image.base64}
              src={item.image.url}
              alt="media-image"
              style={{
                objectFit: "contain",
              }}
            />
          )}
        </section>
      </div>
    </>
  );
};

export default MediaItem;
