 import jwt_decode from 'jwt-decode'
 
 export const decodeGoogleCredentials = (token) =>{
   return jwt_decode(token)
 }