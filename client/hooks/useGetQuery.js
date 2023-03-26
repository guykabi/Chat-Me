import { useQuery } from "react-query";


export const useGetFetchQuery = (key) => {
    const {data} = useQuery(key);
    return data
};