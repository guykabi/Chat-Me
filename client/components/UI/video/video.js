import React, { memo,useEffect,useRef, useState } from 'react'
import styles from './video.module.css'
import {BsFillPlayCircleFill} from 'react-icons/bs'
import {Loader} from '../clipLoader/clipLoader'

const Video = ({video,openVideo,preview}) => {
  const [finishedLoad,setFinishedLoad]=useState(false)
  const placeHolder = '/images/blue-blur-backdrop.jpg'
  return (
   <>
    <section className={styles.videoWrapper}>

      {finishedLoad&&
      !preview&&!openVideo?
      <span className={styles.playSign}>
        <BsFillPlayCircleFill size={40}/>
      </span>:null}

      {!finishedLoad&&
      !preview&&
      !openVideo?
      <span className={styles.videoLoader}>
        <Loader size={45} fontWeight={800}/>
      </span>:null}

      <video 
      className={styles.video}
      preload='auto'
      poster={finishedLoad?null:placeHolder}
      autobuffer="true"
      controls={openVideo}
      autoPlay={openVideo||preview}
      onCanPlay={()=>setFinishedLoad(true)}
      loop
      >
      <source src={video}/>
      </video>
    </section>
    </>
  )
}

export default memo(Video)