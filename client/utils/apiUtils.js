import Axios from '../pages/api/api_instance'

export const checkUser = async (credentials)=>{
  const {data} = await Axios.post('auth',credentials)
  return data
} 

export const getConversations = async (userId,token)=>{
  const {data:res} = await Axios('conversation/'+userId,{
    headers: {
      'x-access-token': token
      }
  })
  return res
} 

export const getUserDetails = async (userId,token)=>{
  const {data:res} = await Axios('users/'+userId,{
    headers: {
      'x-access-token': token
      }
  })
  return res
}  

export const sendRefreshToken = async (refreshToken)=>{
  const {data:res} = await Axios.post('auth/refresh',{task:'RefreshToken'},{
    headers: {
      'refresh-token': refreshToken
      }
  }) 
  return res
}  

export const logOut =async () =>{
  const {data:res} =  await Axios('auth/logout')
  return res
}  


export const getMessages = async(conversationId)=> {
    const {data:res} = await Axios('messages/'+conversationId)
    console.log(res);
    return res
}

export const sendNewMessage =async (message)=>{
  const {data:res} = await Axios.post('messages',message)
  return res
}


