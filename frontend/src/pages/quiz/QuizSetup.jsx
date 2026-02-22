import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FileText, AlertCircle, ArrowRight } from 'lucide-react';
import quizService from '../../services/quizService';
import styles from './Quiz.module.css';

export default function QuizSetup() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [options, setOptions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const data = await quizService.getOptions();
                setOptions(data);
                if (data.resume_topics && data.resume_topics.length > 0) {
                    setTopic(data.mixed_quiz_name || data.resume_topics[0]);
                }
            } catch (err) {
                setError('Failed to load quiz options. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchOptions();
    }, []);

    const handleStartQuiz = async (e) => {
        e.preventDefault();
        if (!topic) return;
        setStarting(true);
        setError('');
        try {
            const quizData = await quizService.startQuiz({ topic });
            // Store quiz data in state or local storage for the session page
            localStorage.setItem('currentQuiz', JSON.stringify(quizData));
            navigate(`/quiz-session/${topic.replace(/\s+/g, '-').toLowerCase()}`);
        } catch (err) {
            setError(err.message || 'Failed to generate quiz');
        } finally {
            setStarting(false);
        }
    };

    if (loading) {
        return (
            <MainLayout pageTitle="Quiz Setup">
                <div className={styles.loadingContainer}>
                    <p>Loading your personalized quiz environment...</p>
                </div>
            </MainLayout>
        );
    }

    if (!options || (options.resume_topics && options.resume_topics.length === 0)) {
        return (
            <MainLayout pageTitle="Resume Required">
                <div className={styles.noResumeContainer}>
                    <Card variant="glass" padded className={styles.noResumeCard}>
                        <div className={styles.noResumeIcon}>
                            <FileText size={48} color="var(--primary)" />
                        </div>
                        <h2>Resume Analysis Required</h2>
                        <p>We generate quizzes based on your specific skills and experience. Please upload and analyze your resume first to unlock personalized assessments.</p>
                        <div className={styles.noResumeActions}>
                            <Link to="/resume-analysis">
                                <Button variant="primary" size="lg" leftIcon={<ArrowRight size={18} />}>
                                    Go to Resume Analysis
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout pageTitle="Adaptive Quiz Setup">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Quiz Setup</h1>
                    <p className={styles.subtitle}>
                        {options.mode === 'Diagnostic'
                            ? "Entering Diagnostic Mode: Let's assess your fundamentals."
                            : "Personalized Adaptive Learning: Targeting your specific mastery levels."}
                    </p>
                </div>

                <Card className={styles.setupCard} variant="glass" padded>
                    <form className={styles.form} onSubmit={handleStartQuiz}>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="topic">Assessment Topic</label>
                            <select
                                id="topic"
                                className={styles.select}
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            >
                                <option value={options.mixed_quiz_name}>{options.mixed_quiz_name} (Mixed Mode)</option>
                                <optgroup label="Extracted from your Resume">
                                    {options.resume_topics.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        {options.recommended_topics && options.recommended_topics.length > 0 && (
                            <div className={styles.recommendationBox}>
                                <div className={styles.recHeader}>
                                    <AlertCircle size={16} color="var(--warning)" />
                                    <span>Recommended focus areas:</span>
                                </div>
                                <div className={styles.recTags}>
                                    {options.recommended_topics.map(t => (
                                        <span key={t} className={styles.recTag} onClick={() => setTopic(t)}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.infoBox}>
                            <p><strong>Note:</strong> Difficulty scales automatically based on your previous performance and mistake patterns.</p>
                        </div>

                        {error && <p className={styles.errorText}>{error}</p>}

                        <div className={styles.actions}>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={starting}
                                disabled={starting || !topic}
                            >
                                Generate Adaptive Quiz
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </MainLayout>
    );
}
