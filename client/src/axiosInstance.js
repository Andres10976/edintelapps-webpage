// axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `http://192.168.0.155:3000`,
});

// Intercept requests to include token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to set the authorization token
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export default axiosInstance;
export { setAuthToken };
