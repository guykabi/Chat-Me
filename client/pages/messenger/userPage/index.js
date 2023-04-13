import React from 'react'
import Head from 'next/head'
import { exctractCredentials,onError } from '../../../utils/utils'
import { useGetUser } from '../../../hooks/useUser'
import {useErrorBoundary} from 'react-error-boundary'


const UserPage = ({user,hasError}) => { 
  const {showBoundary} = useErrorBoundary()

  const {data,isLoading} = useGetUser(user._id,{
    onError:error=>showBoundary(error)
  })

  if(hasError){
   return onError()
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