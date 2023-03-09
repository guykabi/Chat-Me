import React, { useState, useContext} from 'react'
import styles from './createGroup.module.css'
import { useMutation, useQuery } from 'react-query'
import { getAllusers , createGroup } from '../../utils/apiUtils'
import {chatContext} from '../../context/chatContext'
import GroupPerson from '../group-person/groupPerson'

const CreateGroup = ({onSwitch}) => {

const {currentUser,Socket} = useContext(chatContext)
const [allUsers,setAllUsers]=useState([])
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

const handleGroupCreation = (e) =>{

  e.preventDefault() 
  let group = {} 
  group.chatName = groupName
  group.participants = pickedUsers.map(p=> p._id) 
  group.participants.push(currentUser._id)
  group.manager = currentUser._id 
  
  addGroup(group)
 }



  const searchForUsers = allUsers?.map(user=>(
      <GroupPerson key={user._id} user={user} onPick={handleUserPick}/>
  ))

  return (
    <section className={styles.createGroupMainSection}>
      <h2>Create a group</h2> 
      <section>
        <form className={styles.newGroupForm} onSubmit={handleGroupCreation}>

           <div className={styles.groupNameInputWrapper} >
            <input 
            placeholder='Group name'
            required
            onChange={(e)=>setGroupName(e.target.value)}/>
           </div><br/>

          <div className={styles.addedFriendsList}></div>

          <article className={styles.searchInputWrapper}>
            <input 
            className={styles.searchFriendToAddInput}
            placeholder='Search user to add'/> 
          </article> 

          <article className={styles.allUsers}>
              {searchForUsers}
          </article><br/>
          
            <button 
            type='submit'>
            Create
            </button>

        </form>

      </section>
    </section>
  )
}

export default CreateGroup