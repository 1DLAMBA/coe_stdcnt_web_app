import axios from 'axios';
import API_ENDPOINTS from '../Endpoints/environment';

export const STAFF_TOKEN_KEY = 'staff_token';
export const STAFF_USER_KEY = 'staff_user';

const staffApi = axios.create({
    baseURL: API_ENDPOINTS.API_BASE_URL,
    headers: {
        Accept: 'application/json',
    },
});

staffApi.interceptors.request.use((config) => {
    const token = localStorage.getItem(STAFF_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

staffApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(STAFF_TOKEN_KEY);
            localStorage.removeItem(STAFF_USER_KEY);
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
                && window.location.pathname !== '/admin/login') {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default staffApi;
