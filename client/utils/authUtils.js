import Axios from '../pages/api/api_instance'
 import jwt_decode from 'jwt-decode'

 export const checkUser = async (credentials)=>{
  const {data} = await Axios.post('auth',credentials)
  return data
} 
 
 export const decodeGoogleCredentials = (token) =>{
   return jwt_decode(token)
 } 


 export const emailToReset =async (details) =>{
  const {data:res} = await Axios.post('users/email',details)
  return res
}

export const checkResetLink =async (credentials) =>{
  const {data:res} = await Axios.post('auth/validate-reset',credentials)
  return res
} 


export const resetPassword = async({id,body}) =>{
  const {data:res} = await Axios.patch('users/reset-password/'+id,body)
  return res
}

export const tokenValidation = async ()=>{
  const {data:res} = await Axios.post('auth/validation') 
  return res
}  