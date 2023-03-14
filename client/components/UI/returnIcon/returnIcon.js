import React from 'react'
import styles from './returnIcon.module.css'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton'; 



const ReturnIcon = ({onClick}) => {
  return (
    <div className={styles.returnIconWrapper}>
       <IconButton onClick={onClick}>
         <ArrowBackIcon 
         sx={{ color:'black' }}/>
       </IconButton>
    </div>
  )
}

export default ReturnIcon