import { useQuery } from "react-query"
import { getUserDetails } from "../utils/apiUtils"

export const useGetUser = (userId,enabled=true,onSuccess=null,onError)=>{
  return useQuery(['user'],()=>getUserDetails(userId),
  { 
    onSuccess,
    onError,
    enabled,
    staleTime:2000,
    refetchOnMount:false
  })
}  

