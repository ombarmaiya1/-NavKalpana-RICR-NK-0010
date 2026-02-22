/**
 * quizService.js
 * Handles all backend API calls for the Adaptive Quiz feature.
 */

const BASE_URL = '/api/quiz';

/**
 * Helper to get authentication headers.
 */
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const quizService = {
    /**
     * Fetches quiz options based on resume topics and mastery.
     * @returns {Promise} - { resume_topics, recommended_topics, mixed_quiz_name, mode }
     */
    getOptions: async () => {
        const response = await fetch(`${BASE_URL}/options`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch quiz options');
        return response.json();
    },

    /**
     * Generates a new adaptive quiz session for a topic.
     * @param {Object} data - { topic }
     * @returns {Promise} - Quiz object with questions
     */
    startQuiz: async (data) => {
        const response = await fetch(`${BASE_URL}/generate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to start quiz');
        }
        return response.json();
    },

    /**
     * Submits quiz results and updates mastery.
     * @param {Object} data - { topic, correct_answers, total_questions }
     * @returns {Promise} - { score, topic_accuracy, new_mastery }
     */
    submitQuiz: async (data) => {
        const response = await fetch(`${BASE_URL}/submit`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to submit quiz');
        return response.json();
    }
};

export default quizService;
