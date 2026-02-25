import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { interviewSessionService } from '../../services/interviewSessionService';
import { useInterview } from '../../context/InterviewContext';
import styles from './InterviewSessionPage.module.css';

export default function InterviewSessionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { sessionId, totalQuestions } = useInterview();

    const [currentQuestion, setCurrentQuestion] = useState(location.state?.initialQuestion || null);
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [scoreBreakdown, setScoreBreakdown] = useState(null);
    const [missingConcepts, setMissingConcepts] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [finalIrs, setFinalIrs] = useState(null);
    const [finalClassification, setFinalClassification] = useState('');
    const [aiOffline, setAiOffline] = useState(false);
    const [aiOfflineMessage, setAiOfflineMessage] = useState('');

    useEffect(() => {
        if (!sessionId || !currentQuestion) {
            navigate('/start-interview', { replace: true });
        }
    }, [sessionId, currentQuestion, navigate]);

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            setError('Please type your answer before submitting.');
            return;
        }
        setError('');
        setIsSubmitting(true);

        try {
            const payload = {
                session_id: sessionId,
                answer_text: answer,
            };
            const result = await interviewSessionService.submitAnswer(payload);

            if (!result?.success) {
                const rawError = result?.data?.error || '';
                const isQuotaError =
                    typeof rawError === 'string' &&
                    rawError.toLowerCase().includes('insufficient_quota');

                if (isQuotaError) {
                    setAiOffline(true);
                    setAiOfflineMessage(
                        'Our AI interview engine has temporarily hit its API quota. Your answer was not evaluated. Please try again later or continue practising offline.'
                    );
                } else {
                    setError(result?.message || 'Failed to evaluate answer.');
                }
                setIsSubmitting(false);
                return;
            }

            const data = result.data;
            setScoreBreakdown(data.component_breakdown);
            setMissingConcepts(data.missing_concepts || []);
            setFeedback(data.feedback || '');
            setAnswer('');

            if (data.is_last_question) {
                setFinalIrs(data.interview_readiness_score);
                setFinalClassification(data.readiness_classification || '');
            } else if (data.next_question) {
                setCurrentQuestion(data.next_question);
                setQuestionIndex((idx) => idx + 1);
            }
        } catch (err) {
            setError(err.message || 'Unexpected error while submitting answer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinish = () => {
        navigate('/dashboard');
    };

    const currentNumber = questionIndex + 1;

    return (
        <MainLayout pageTitle="Interview Session">
            <div className={styles.page}>
                {aiOffline && (
                    <div className={styles.quotaBanner}>
                        <div className={styles.quotaTitle}>AI has left the building (for now).</div>
                        <p className={styles.quotaText}>
                            {aiOfflineMessage}
                        </p>
                    </div>
                )}
                <div className={styles.layout}>
                    <div className={styles.leftPanel}>
                        {currentQuestion && (
                            <Card variant="glass" className={styles.questionCard}>
                                <div className={styles.badges}>
                                    <span className={styles.badge}>{currentQuestion.category}</span>
                                    <span className={styles.badge}>{currentQuestion.difficulty}</span>
                                    <span className={styles.badge}>
                                        Question {currentNumber}/{totalQuestions || '?'}
                                    </span>
                                </div>
                                <h2 className={styles.questionText}>{currentQuestion.question_text}</h2>
                            </Card>
                        )}
                    </div>

                    <div className={styles.centerPanel}>
                        <Card variant="glass" className={styles.answerCard}>
                            <h3 className={styles.sectionTitle}>Your Answer</h3>
                            <textarea
                                className={styles.textarea}
                                rows={8}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                            />
                            {error && <p className={styles.error}>{error}</p>}
                            <div className={styles.actions}>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmitAnswer}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Evaluating…' : 'Submit Answer'}
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <div className={styles.rightPanel}>
                        <Card variant="glass" className={styles.feedbackCard}>
                            <h3 className={styles.sectionTitle}>Live Evaluation</h3>
                            {scoreBreakdown ? (
                                <>
                                    <div className={styles.scoresGrid}>
                                        <div>
                                            <span className={styles.scoreLabel}>Total Score</span>
                                            <span className={styles.scoreValue}>
                                                {scoreBreakdown.total.toFixed(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={styles.scoreLabel}>Keyword</span>
                                            <span className={styles.scoreValue}>
                                                {scoreBreakdown.keyword.toFixed(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={styles.scoreLabel}>Technical</span>
                                            <span className={styles.scoreValue}>
                                                {scoreBreakdown.technical.toFixed(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={styles.scoreLabel}>Logical</span>
                                            <span className={styles.scoreValue}>
                                                {scoreBreakdown.logical.toFixed(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={styles.scoreLabel}>Terminology</span>
                                            <span className={styles.scoreValue}>
                                                {scoreBreakdown.terminology.toFixed(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={styles.scoreLabel}>Completeness</span>
                                            <span className={styles.scoreValue}>
                                                {scoreBreakdown.completeness.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {missingConcepts.length > 0 && (
                                        <div className={styles.missingSection}>
                                            <h4 className={styles.subTitle}>Missing Concepts</h4>
                                            <ul className={styles.list}>
                                                {missingConcepts.map((item) => (
                                                    <li key={item}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {feedback && (
                                        <div className={styles.feedbackSection}>
                                            <h4 className={styles.subTitle}>Actionable Feedback</h4>
                                            <p className={styles.feedbackText}>{feedback}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className={styles.placeholder}>
                                    Submit your first answer to see detailed AI evaluation here.
                                </p>
                            )}
                        </Card>

                        {finalIrs != null && (
                            <Card variant="glass" className={styles.summaryCard}>
                                <h3 className={styles.sectionTitle}>Interview Readiness</h3>
                                <p className={styles.irsValue}>{finalIrs.toFixed(1)}</p>
                                <p className={styles.irsLabel}>{finalClassification}</p>
                                <Button variant="secondary" onClick={handleFinish}>
                                    Return to Dashboard
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

