import { apiRequest } from '../api/api';

const assignmentService = {
    getOptions: async () => {
        return apiRequest('/api/assignment/options');
    },
    listAssignments: async () => {
        return apiRequest('/api/assignment/list');
    },
    generateAssignment: async (topic) => {
        return apiRequest('/api/assignment/generate', 'POST', { topic });
    },
    getAssignment: async (assignmentId) => {
        return apiRequest(`/api/assignment/${assignmentId}`);
    },
    submitAssignment: async (assignmentId, formData) => {
        return apiRequest(`/api/assignment/submit`, 'POST', formData, true);
    }
};

export default assignmentService;
