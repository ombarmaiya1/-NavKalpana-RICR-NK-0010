import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import quizService from '../../services/quizService';
import styles from './Quiz.module.css';

export default function QuizSession() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quizData, setQuizData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const data = await quizService.getQuiz(quizId);
                setQuizData(data);
                // Assume 1 minute per question if timer not provided by backend
                setTimeLeft(data.questions.length * 60);
            } catch (err) {
                setError('Failed to load quiz. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleSubmit = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            // Prepare answers array as required by API
            const answers = quizData.questions.map((q, idx) => ({
                questionId: q.id,
                selectedOption: selectedAnswers[idx] || null
            }));
            await quizService.submitQuiz(quizId, answers);
            navigate(`/quiz-result/${quizId}`);
        } catch (err) {
            setError('Failed to submit quiz. Please check your connection.');
        } finally {
            setSubmitting(false);
        }
    }, [quizId, quizData, selectedAnswers, navigate, submitting]);

    useEffect(() => {
        if (timeLeft <= 0 || loading || submitting) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading, submitting, handleSubmit]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (option) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [currentIndex]: option
        }));
    };

    if (loading) {
        return (
            <MainLayout pageTitle="Quiz Session">
                <div className={styles.loading}>
                    <p>Loading questions...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout pageTitle="Quiz Session">
                <div className={styles.container}>
                    <Card variant="glass" padded>
                        <p className={styles.errorText}>{error}</p>
                        <Button variant="primary" onClick={() => navigate('/quiz-setup')}>Back to Setup</Button>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    const currentQuestion = quizData.questions[currentIndex];
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === quizData.questions.length - 1;

    return (
        <MainLayout pageTitle={`Quiz: ${quizData.topic || 'Session'}`}>
            <div className={styles.container}>
                <div className={styles.quizHeader}>
                    <span className={styles.questionProgress}>
                        Question {currentIndex + 1} of {quizData.questions.length}
                    </span>
                    <span className={styles.timer}>
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <Card className={styles.sessionCard} variant="glass" padded>
                    <div className={styles.questionBox}>
                        <h2 className={styles.questionText}>{currentQuestion.text}</h2>
                        <div className={styles.optionsGrid}>
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    className={`${styles.optionButton} ${selectedAnswers[currentIndex] === option ? styles.selectedOption : ''}`}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={submitting}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.navButtons}>
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                            disabled={isFirstQuestion || submitting}
                        >
                            Previous
                        </Button>

                        {isLastQuestion ? (
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                loading={submitting}
                                disabled={submitting}
                            >
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() => setCurrentIndex(prev => prev + 1)}
                                disabled={submitting}
                            >
                                Next
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
