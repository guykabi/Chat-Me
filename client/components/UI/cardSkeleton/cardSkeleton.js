import React from 'react'
import styles from './cardSkeleton.module.css'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const CardSkeleton = ({amount}) => {

  return (
   Array(amount)
  .fill(0).map((_,i)=>{
    return <div className={styles.skeletonItemWrapper} key={i}>
        <div className={styles.leftCol}>
            <Skeleton circle width={40} height={40}/>
        </div>
        <div className={styles.rightCol}>
            <Skeleton height='2em' />
        </div>
     </div>
  }))
  
}

export default CardSkeleton