import { apiRequest } from '../api/api';

export const interviewService = {
    async sendVoiceAnswer(formData) {
        // formData should contain: audio (Blob/File) and question (string)
        return apiRequest('/api/interview/voice-answer', 'POST', formData, true);
    },
};

