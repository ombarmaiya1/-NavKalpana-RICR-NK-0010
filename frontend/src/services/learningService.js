import { apiRequest } from '../api/api';

const learningService = {
    getDashboard: async () => {
        return apiRequest('/api/learning/dashboard');
    },
    getTopics: async () => {
        return apiRequest('/api/learning/topics');
    },
    getTopicDetail: async (topicId) => {
        return apiRequest(`/api/learning/topic/${topicId}`);
    },
    getResources: async (topic, level) => {
        return apiRequest(`/api/learning/resources?topic=${encodeURIComponent(topic)}&level=${encodeURIComponent(level)}`);
    }
};

export default learningService;
