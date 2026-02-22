import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Award, RefreshCcw, LayoutDashboard, ChevronRight, Check, X } from 'lucide-react';
import styles from './Quiz.module.css';

export default function QuizResult() {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedResult = localStorage.getItem('lastQuizResult');
        if (storedResult) {
            setResult(JSON.parse(storedResult));
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <MainLayout pageTitle="Quiz Result">
                <div className={styles.loading}>
                    <p>Fetching your results...</p>
                </div>
            </MainLayout>
        );
    }

    if (!result) {
        return (
            <MainLayout pageTitle="No Result">
                <div className={styles.container}>
                    <Card variant="glass" padded>
                        <h2>No quiz results found.</h2>
                        <Button variant="primary" onClick={() => navigate('/quiz-setup')}>Take a Quiz</Button>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    const masteryChange = result.new_mastery - (result.old_mastery || 0);

    return (
        <MainLayout pageTitle={`Results: ${result.topic}`}>
            <div className={styles.container}>
                <div className={styles.resultHeader}>
                    <div className={styles.awardIcon}>
                        <Award size={64} color="var(--primary)" />
                    </div>
                    <h1 className={styles.title}>Assessment Completed!</h1>
                    <p className={styles.subtitle}>You've taken another step towards mastery in <strong>{result.topic}</strong></p>
                </div>

                <div className={styles.resultGrid}>
                    <Card className={styles.scoreCard} variant="glass" padded>
                        <span className={styles.statLabel}>Accuracy</span>
                        <div className={styles.circularProgress}>
                            <span className={styles.statValue}>{Math.round(result.topic_accuracy)}%</span>
                        </div>
                        <p className={styles.statDetail}>{result.correct_answers} / {result.total_questions} Correct</p>
                    </Card>

                    <Card className={styles.masteryCard} variant="glass" padded>
                        <span className={styles.statLabel}>Topic Mastery</span>
                        <div className={styles.masteryValue}>
                            <span className={styles.statValue}>{Math.round(result.new_mastery)}</span>
                            <span className={styles.masteryMax}>/ 100</span>
                        </div>
                        <div className={`${styles.masteryChange} ${masteryChange >= 0 ? styles.positive : styles.negative}`}>
                            {masteryChange >= 0 ? '+' : ''}{Math.round(masteryChange)} pts from last session
                        </div>
                    </Card>
                </div>

                <div className={styles.reviewSection}>
                    <h2 className={styles.sectionTitle}>Review Questions</h2>
                    <div className={styles.questionList}>
                        {result.questions.map((q, idx) => {
                            const isCorrect = Array.isArray(q.correct_answer)
                                ? (Array.isArray(result.userAnswers[idx]) && result.userAnswers[idx].every(v => q.correct_answer.includes(v)))
                                : result.userAnswers[idx] === q.correct_answer;

                            return (
                                <Card key={idx} className={styles.reviewItem} variant="glass">
                                    <div className={styles.reviewHeader}>
                                        {isCorrect ? <Check size={20} color="var(--success)" /> : <X size={20} color="var(--danger)" />}
                                        <span className={styles.reviewIndex}>Question {idx + 1}</span>
                                    </div>
                                    <p className={styles.reviewQuestion}>{q.question}</p>
                                    <div className={styles.reviewAnswer}>
                                        <p><strong>Your Answer:</strong> <span className={isCorrect ? styles.correctText : styles.incorrectText}>{result.userAnswers[idx] || 'No Answer'}</span></p>
                                        {!isCorrect && <p><strong>Correct Answer:</strong> <span className={styles.correctText}>{Array.isArray(q.correct_answer) ? q.correct_answer.join(', ') : q.correct_answer}</span></p>}
                                    </div>
                                    <div className={styles.explanationBox}>
                                        <p><strong>Explanation:</strong> {q.explanation}</p>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.resultActions}>
                    <Button
                        variant="primary"
                        size="lg"
                        leftIcon={<RefreshCcw size={18} />}
                        onClick={() => navigate('/quiz-setup')}
                    >
                        New Assessment
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        leftIcon={<LayoutDashboard size={18} />}
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}
