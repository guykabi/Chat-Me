import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications'
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton'; 
import React,{useState} from 'react'
import styles from './notificationIcon'


const NotificationIcon = ({count}) => {
  return (
      <div>
        <IconButton>
            <Badge
             badgeContent={count}
             anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
             max={10}
             sx={{
                "& .MuiBadge-badge": {
                  color: "white",
                  backgroundColor: "rgb(83, 29, 49)",
                  fontSize: 12, height: 22
                }
              }}
             invisible={!count}>
            <CircleNotificationsIcon
            fontSize='large'/>
            </Badge>
            </IconButton>
     </div>
  )
}

export default NotificationIcon