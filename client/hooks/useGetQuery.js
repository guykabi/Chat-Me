import { useQuery } from "react-query";


export const useGetCacheQuery = (key) => {
  
  const { data } = useQuery(key,{
    staleTime:100000
  });
  return data;
};