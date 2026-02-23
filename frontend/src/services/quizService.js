import { apiRequest } from '../api/api';

const quizService = {
    getOptions: async () => {
        return apiRequest('/api/quiz/options');
    },
    generateQuiz: async (topic) => {
        return apiRequest('/api/quiz/generate', 'POST', { topic });
    },
    submitQuiz: async (topic, correctAnswers, totalQuestions) => {
        return apiRequest('/api/quiz/submit', 'POST', {
            topic,
            correct_answers: correctAnswers,
            total_questions: totalQuestions
        });
    }
};

export default quizService;
