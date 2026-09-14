import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/v1` 
  : '/api/v1';

const client = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default client;
