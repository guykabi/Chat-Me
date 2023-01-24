import axios from "axios"; 

const Axios = axios.create({
    withCredentials: true,
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL
});

export default Axios;