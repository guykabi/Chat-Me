import React from 'react'
import {getUserDetails} from '../../../utils/apiUtils'
import { exctractCredentials,loginRedirectOnError } from '../../../utils/utils'
import styles from './userPage.module.css'
import {push} from 'next/router'


const UserPage = ({details,hasError}) => {

  if(hasError){
   return loginRedirectOnError()
  }
  
  return (
    <div>
         <h2>{details?.name}details</h2>
    </div>
  )
} 

export async function getServerSideProps({req}){

  if(!req.headers.cookie){
    return{props:{hasError:true}}
  }
    const {user,token} = exctractCredentials(req,'accessToken')
    let details;

    try{
     details = await getUserDetails(user._id,token)
    }catch(err){
      return {props:{hasError:true}}
    }

    return{
      props:{details}
     }
}

export default UserPage