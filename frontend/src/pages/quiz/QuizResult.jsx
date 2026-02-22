import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import quizService from '../../services/quizService';
import styles from './Quiz.module.css';

export default function QuizResult() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await quizService.getResults(quizId);
                setResult(data);
            } catch (err) {
                setError('Failed to load quiz results.');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [quizId]);

    if (loading) {
        return (
            <MainLayout pageTitle="Quiz Result">
                <div className={styles.loading}>
                    <p>Calculating your score...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout pageTitle="Quiz Result">
                <div className={styles.container}>
                    <Card variant="glass" padded>
                        <p className={styles.errorText}>{error}</p>
                        <Button variant="primary" onClick={() => navigate('/quiz-setup')}>Back to Setup</Button>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout pageTitle="Quiz Result">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Quiz Completed!</h1>
                    <p className={styles.subtitle}>Here is how you performed in {result.topic}</p>
                </div>

                <Card className={styles.resultCard} variant="glass" padded>
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Score</span>
                            <span className={styles.statValue}>{result.score}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Percentage</span>
                            <span className={styles.statValue}>{result.percentage}%</span>
                        </div>
                    </div>

                    <div className={styles.feedbackBox}>
                        <h3 className={styles.feedbackTitle}>Feedback</h3>
                        <p className={styles.feedbackText}>{result.feedback}</p>
                    </div>

                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={() => navigate('/quiz-setup')}
                        >
                            Retake Quiz
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            fullWidth
                            className={styles.mt1}
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
