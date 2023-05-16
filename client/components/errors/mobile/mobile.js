import React from 'react'
import styles from './mobile.module.css'
import {GrDesktop} from 'react-icons/gr'

const Mobile = () => {
  return (
    <>
    <section className={styles.mobileErrorWrapper}>
        <header className={styles.header}>
          <h1>Chat-Me</h1>
        </header>
        <main className={styles.mainWrapper}>
             <p>Sorry...</p>
             <p>Available only on desktop</p> 
             <p><GrDesktop size={50}/></p>
        </main>
    </section>
    </>
  )
}

export default Mobile