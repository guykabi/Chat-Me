import React from 'react'
import Head from 'next/head'
import { exctractCredentials,onError } from '../../../utils/utils'
import { useGetUser } from '../../../hooks/useUser'


const UserPage = ({user,hasError}) => { 

  const {data,error,isLoading} = useGetUser(user._id)

  if(hasError){
   return onError()
  } 

  if(error){
    if(error?.response?.status === 401){
      return needToReSign(user.name)
     }
    return onError('Details are not available')
  }
  
  return (
    <div className='center'> 
    <Head><title>{data?.name}'s page</title></Head>
         {isLoading?
         <div className='center'>Loading details...</div>:
         <h2>{data?.name} details</h2>}
         
    </div>
  )
} 

export async function getServerSideProps({req}){

  if(!req.headers.cookie){
    return{props:{hasError:true}}
  }
    const user = exctractCredentials(req)
    
    return{
      props:{user}
     }
}

export default UserPage