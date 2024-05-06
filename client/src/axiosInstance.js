// axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `http://192.168.0.155:3000`,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// Function to set the authorization token
const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token); // Store the token in localStorage
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem('token'); // Remove the token from localStorage
  }
};

export default axiosInstance;
export { setAuthToken };