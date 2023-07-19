import React from 'react'
import styles from './noResults.module.css'

const NoResults = ({text,subText,icon}) => {
  return (
   <> 
   <div className={styles.main}>
    <h3>{text}</h3>
    <p>{subText}</p>
    <p>{icon}</p>
   </div>
   </>
  )
}

export default NoResults