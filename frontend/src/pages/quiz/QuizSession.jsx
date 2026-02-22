import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Timer, AlertCircle, CheckCircle2 } from 'lucide-react';
import quizService from '../../services/quizService';
import styles from './Quiz.module.css';

export default function QuizSession() {
    const { quizId } = useParams(); // This is the topic-slug
    const navigate = useNavigate();

    const [quizData, setQuizData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Load quiz data from localStorage set by QuizSetup
        const storedQuiz = localStorage.getItem('currentQuiz');
        if (storedQuiz) {
            const parsed = JSON.parse(storedQuiz);
            setQuizData(parsed);
            setTimeLeft((parsed.time_limit || parsed.questions.length) * 60);
            setLoading(false);
        } else {
            setError('Quiz session not found. Please start from the setup page.');
            setLoading(false);
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        if (submitting || !quizData) return;
        setSubmitting(true);
        setError('');

        try {
            // Calculate correct answers
            let correctCount = 0;
            quizData.questions.forEach((q, idx) => {
                const userAns = selectedAnswers[idx];
                const correctAns = q.correct_answer;

                if (Array.isArray(correctAns)) {
                    // mcq_multi handling
                    if (Array.isArray(userAns) &&
                        userAns.length === correctAns.length &&
                        userAns.every(val => correctAns.includes(val))) {
                        correctCount++;
                    }
                } else if (userAns === correctAns) {
                    correctCount++;
                }
            });

            const result = await quizService.submitQuiz({
                topic: quizData.topic,
                correct_answers: correctCount,
                total_questions: quizData.questions.length
            });

            // Store result for the result page
            localStorage.setItem('lastQuizResult', JSON.stringify({
                ...result,
                questions: quizData.questions,
                userAnswers: selectedAnswers
            }));

            navigate(`/quiz-result/${quizId}`);
        } catch (err) {
            setError('Failed to submit quiz results. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [quizId, quizData, selectedAnswers, navigate, submitting]);

    useEffect(() => {
        if (timeLeft <= 0 || loading || submitting || !quizData) return;
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
    }, [timeLeft, loading, submitting, quizData, handleSubmit]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (option) => {
        if (submitting) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [currentIndex]: option
        }));
    };

    if (loading) {
        return (
            <MainLayout pageTitle="Quiz Session">
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Preparing your adaptive assessment...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout pageTitle="Error">
                <div className={styles.container}>
                    <Card variant="glass" padded className={styles.errorCard}>
                        <AlertCircle size={48} color="var(--danger)" />
                        <h2>Oops!</h2>
                        <p>{error}</p>
                        <Button variant="primary" onClick={() => navigate('/quiz-setup')}>Back to Setup</Button>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    const currentQuestion = quizData.questions[currentIndex];
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === quizData.questions.length - 1;
    const progress = ((currentIndex + 1) / quizData.questions.length) * 100;

    return (
        <MainLayout pageTitle={`Quiz: ${quizData.topic}`}>
            <div className={styles.container}>
                <div className={styles.quizHeader}>
                    <div className={styles.quizInfo}>
                        <h2 className={styles.quizTitle}>{quizData.title}</h2>
                        <span className={styles.questionProgress}>
                            Question <span className={styles.highlight}>{currentIndex + 1}</span> of {quizData.questions.length}
                        </span>
                    </div>
                    <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerUrgent : ''}`}>
                        <Timer size={18} />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                </div>

                <Card className={styles.sessionCard} variant="glass" padded>
                    <div className={styles.questionBox}>
                        <div className={styles.questionTypeTag}>{currentQuestion.type.replace('_', ' ').toUpperCase()}</div>
                        <h3 className={styles.questionText}>{currentQuestion.question}</h3>

                        <div className={styles.optionsGrid}>
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    className={`${styles.optionButton} ${selectedAnswers[currentIndex] === option ? styles.selectedOption : ''}`}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={submitting}
                                >
                                    <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                                    <span className={styles.optionContent}>{option}</span>
                                    {selectedAnswers[currentIndex] === option && <CheckCircle2 size={18} className={styles.checkIcon} />}
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
                                Finish Assessment
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() => setCurrentIndex(prev => prev + 1)}
                                disabled={submitting}
                            >
                                Next Question
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
