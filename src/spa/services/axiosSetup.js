import axios from 'axios';
import Cookies from 'js-cookie';

// Default API base URL
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://experiencesharingbackend.runasp.net/api';

// Ensure a single base URL for all requests
axios.defaults.baseURL = apiBaseUrl;

// Attach Authorization header from cookie for every request
axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      // Only set Authorization if not already provided at call-site
      if (!config.headers) config.headers = {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: normalize 401 handling (do not throw for 401 so UI can decide)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Let callers handle UX; keep error for now
      // Optionally, we could route to login here
    }
    return Promise.reject(error);
  }
);
