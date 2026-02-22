/**
 * quizService.js
 * Handles all backend API calls for the Quiz feature.
 */

const BASE_URL = '/api/quiz';

const quizService = {
    /**
     * Starts a new quiz session.
     * @param {Object} data - { topic, difficulty, totalQuestions }
     * @returns {Promise} - { quizId, questions }
     */
    startQuiz: async (data) => {
        const response = await fetch(`${BASE_URL}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to start quiz');
        return response.json();
    },

    /**
     * Fetches details of a specific quiz.
     * @param {string} quizId 
     * @returns {Promise} - Quiz data
     */
    getQuiz: async (quizId) => {
        const response = await fetch(`${BASE_URL}/${quizId}`);
        if (!response.ok) throw new Error('Failed to fetch quiz details');
        return response.json();
    },

    /**
     * Submits quiz answers.
     * @param {string} quizId 
     * @param {Array} answers 
     * @returns {Promise} - { score, percentage, feedback }
     */
    submitQuiz: async (quizId, answers) => {
        const response = await fetch(`${BASE_URL}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizId, answers }),
        });
        if (!response.ok) throw new Error('Failed to submit quiz');
        return response.json();
    },

    /**
     * Fetches results of a completed quiz.
     * @param {string} quizId 
     * @returns {Promise} - Result data
     */
    getResults: async (quizId) => {
        const response = await fetch(`${BASE_URL}/result/${quizId}`);
        if (!response.ok) throw new Error('Failed to fetch quiz results');
        return response.json();
    }
};

export default quizService;
