import { useQuery } from "react-query";


export const useGetCacheQuery = (key) => {
  const { data } = useQuery(key);
  return data;
};