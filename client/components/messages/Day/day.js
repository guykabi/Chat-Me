import React from 'react'
import styles from './day.module.css'

const Day = ({date}) => {
  return (
    <>
      <section className={styles.mainDay}>
         {date.date}
      </section>
    </>
  )
}

export default Day