import { apiRequest } from '../api/api';

const authService = {
    signup: async (formData) => {
        return apiRequest('/api/auth/signup', 'POST', formData, true);
    },
    login: async (credentials) => {
        return apiRequest('/api/auth/login', 'POST', credentials);
    },
    getMe: async () => {
        return apiRequest('/api/auth/me');
    }
};

export default authService;
