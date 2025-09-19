import axios from "axios";

// Example axios config
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});


export default axiosInstance;
