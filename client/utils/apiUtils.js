import Axios from '../pages/api/api_instance'

export const checkUser = async (credentials)=>{
  const {data} = await Axios.post('auth',credentials)
  return data
} 


export const getConversations = async (userId)=>{
  const {data:res} = await Axios('conversation/'+userId)
  return res
} 


export const getUserDetails = async (userId)=>{
  const {data:res} = await Axios('users/'+userId)
  return res
}  


export const updateUserDetails =async ({userId,body}) => {
  const {data:res} = await Axios.post('users/image'+userId,body)
  return res
}


export const tokenValidation = async ()=>{
  const {data:res} = await Axios.post('auth/validation') 
  return res
}  

export const logOut =async () =>{
  const {data:res} =  await Axios('auth/logout')
  return res
}  


export const getMessages = async(conversationId,amount=0)=> {
    const {data:res} = await Axios('messages/'+conversationId,{
      headers:{
        'load-more':amount
      }
    })
    return res
}

export const sendNewMessage =async (message)=>{
  const {data:res} = await Axios.post('messages',message)
  return res
}

export const searchUser =async (username) =>{
  
  const {data:res} = await Axios.post('users/search-user',username)
  return res
}

export const friendRequest = async ({currentUserId,friendId}) =>{
   let obj = {friendId,message:'Friend request'}
   const {data:res} = await Axios.patch('users/friendship-request/'+currentUserId,obj)
   return res
}


 export const approveFriend =async ({currentUserId,friendId}) =>{
   let obj = {friendId,message:'Friend aprroval'}
   const {data:res} = await Axios.patch('users/add-friend/'+currentUserId,obj)
   return res
 }


export const unapproveFriend =async ({currentUserId,friendId}) =>{
  let obj = {friendId}
  const {data:res} = await Axios.patch('users/unapprove-request/'+currentUserId,obj)
  return res
}


export const removeFriend = async ({currentUserId,friendId})=>{
  let obj = {friendId}
  const {data:res} = await Axios.patch('users/remove-friend/'+currentUserId,obj)
  return res
}


export const createConversation = async ({userId,friendId}) =>{
  let obj = {participants:[userId,friendId]}
  const {data:res} = await Axios.post('conversation',obj)
  return res
}

export const updateConversation = async ({conId,obj}) =>{
  const {data:res} = await Axios.patch('conversation/'+conId,obj)
  return res
} 


export const addGroupMember = async ({conId,obj}) =>{
  const {data:res} = await Axios.patch('conversation/add-member/'+conId,obj)
  return res
} 


export const removeGroupMember = async ({conId,obj}) =>{
  const {data:res} = await Axios.patch('conversation/remove-member/'+conId,obj)
  return res
} 

export const addManager = async ({conId,obj}) =>{
  const {data:res} = await Axios.patch('conversation/add-manager/'+conId,obj)
  return res
} 

export const removeManager = async ({conId,obj}) =>{
  const {data:res} = await Axios.patch('conversation/remove-manager/'+conId,obj)
  return res
} 


export const deleteConversation = async (conversationId)=>{
  const {data:res} = await Axios.delete('conversation/'+conversationId)
  return res
}

export const seenMessage = async ({messageId,userId}) =>{
  const {data:res} = await Axios.patch('messages/seen/'+messageId,{userId})
  return res
}


 export const getAllusers = async() =>{
  const {data:res} = await Axios('users')
  return res
 }


export const createGroup =async (group) =>{
  const {data:res} = await Axios.post('conversation',group)
  return res
}


export const handleLikeMessage = async ({messageId,userId}) =>{
    const {data:res} = await Axios.patch('messages/like-message/'+messageId,{userId})
    return res
} 


export const handleDeleteMessage = async (messageId) =>{
  const {data:res} = await Axios.delete('messages/delete-message/'+messageId)
  return res
}