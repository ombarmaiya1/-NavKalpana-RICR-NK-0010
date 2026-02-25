import { apiRequest } from '../api/api';

export const interviewSessionService = {
    async startInterview(payload) {
        const isMultipart = payload instanceof FormData;
        return apiRequest('/api/interview/start-interview', 'POST', payload, isMultipart);
    },
    async submitAnswer(payload) {
        return apiRequest('/api/interview/submit-answer', 'POST', payload);
    },
};

