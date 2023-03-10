import React, { useState, useContext, useMemo} from 'react'
import styles from './createGroup.module.css'
import { useMutation, useQuery } from 'react-query'
import { getAllusers , createGroup } from '../../utils/apiUtils'
import {chatContext} from '../../context/chatContext'
import GroupPerson from '../group-person/groupPerson'

const CreateGroup = ({onSwitch}) => {

const {currentUser,Socket} = useContext(chatContext)
const [allUsers,setAllUsers]=useState([])
const [query,setQuery]=useState("")
const [groupName,setGroupName]=useState(null)
const [pickedUsers,setPickedUsers]=useState([])

  const {error} = useQuery('users',getAllusers,{
    onSuccess:(data)=>{
       let filteredUsers = data.filter(u=> u._id !== currentUser._id)
       setAllUsers(filteredUsers) 
    }
  })   

  const {mutate:addGroup} = useMutation(createGroup,{
    onSuccess:(data)=>{
      
      setGroupName(null)
      setPickedUsers([]) 
      Socket.emit('new-conversation',currentUser._id,data.conversation)
      onSwitch()     
    }         
  })


const handleUserPick = (e) =>{
  if(pickedUsers.find(p=>p._id === e._id)) return
  setPickedUsers(prev=> [...prev,e])
}   

const handleGroupSubmit = (e) =>{
  e.preventDefault() 
  
  if(!pickedUsers.length) return
  let group = {} 
  group.chatName = groupName
  group.participants = pickedUsers.map(p=> p._id) 
  group.participants.push(currentUser._id)
  group.manager = currentUser._id 
  
  addGroup(group)

 }

const removePickedFriend = (pickedUser) =>{
    setPickedUsers(prev=>prev.filter(u=>u._id !== pickedUser._id))
} 


const filteredItems = useMemo(()=>{
 return allUsers?.filter(item=>(
    item.name?.toLowerCase().includes(query?.toLowerCase())
  ))
},[allUsers,query]) 



 const searchForUsers = filteredItems?.map(user=>(  
      <GroupPerson key={user._id} user={user} onPick={handleUserPick}/>
  )) 



  const pickedUsersForGroup = pickedUsers.map(user=>(
      <div key={user._id} className={styles.pickedUserShow}>
        <img src={user?.image?user.image:'/images/no-avatar.png'} />
        <span aria-label='user-image'>{user.name}</span> 
        <span 
         className={styles.xDelete}
         onClick={()=>removePickedFriend(user)}
         role='button'>x</span>
      </div>
  ))



  return (
    <section className={styles.createGroupMainSection}>
      <h2 aria-label='Create a group'>Create a group</h2> 
      <section>
        <form className={styles.newGroupForm} onSubmit={handleGroupSubmit}>

           <div className={styles.groupNameInputWrapper} >
            <input 
            placeholder='Group name'
            required
            onChange={(e)=>setGroupName(e.target.value)}/>
           </div><br/>

          {pickedUsersForGroup.length?<div className={pickedUsers.length?
               styles.addedFriendsListActive:
               styles.addedFriendsList}>
               {pickedUsersForGroup}
          </div>:null}

          <article className={styles.searchInputWrapper}>
            <input 
            className={styles.searchFriendToAddInput}
            placeholder='Search user to add'
            onChange={(e)=>setQuery(e.target.value)}/> 
          </article> 

          <article className={styles.allUsers}>
              {searchForUsers}
          </article><br/>
          
            <button 
            aria-label='Create group'
            type='submit'>
            Create group
            </button>
     
        </form>
        
      </section>
    </section>
  )
}

export default CreateGroup