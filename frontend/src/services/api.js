import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        Accept: 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('recruitment_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function errorMessage(error) {
    return error?.response?.data?.message
        || Object.values(error?.response?.data?.errors || {})?.flat()?.[0]
        || 'Something went wrong. Please try again.';
}

export default api;