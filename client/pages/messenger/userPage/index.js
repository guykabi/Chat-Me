import React from 'react'
import {getUserDetails} from '../../../utils/apiUtils'
import { exctractCredentials,loginRedirectOnError } from '../../../utils/utils'


const UserPage = ({details,hasError}) => {

  if(hasError){
   return loginRedirectOnError()
  }
  
  return (
    <div className='center'>
         <h2>{details?.name}details</h2>
    </div>
  )
} 

export async function getServerSideProps({req}){

  if(!req.headers.cookie){
    return{props:{hasError:true}}
  }
    const {user,tokensObj} = exctractCredentials(req,'accessToken')
    let details;

    try{
     details = await getUserDetails(user._id,tokensObj)
    }catch(err){
      return {props:{hasError:true}}
    }

    return{
      props:{details}
     }
}

export default UserPage