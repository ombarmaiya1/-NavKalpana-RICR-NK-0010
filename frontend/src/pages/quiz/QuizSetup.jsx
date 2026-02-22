import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import quizService from '../../services/quizService';
import styles from './Quiz.module.css';

export default function QuizSetup() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('dsa');
    const [difficulty, setDifficulty] = useState('medium');
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStartQuiz = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await quizService.startQuiz({ topic, difficulty, totalQuestions });
            // The backend returns quizId and questions. We'll navigate to session with quizId.
            navigate(`/quiz-session/${data.quizId}`);
        } catch (err) {
            setError(err.message || 'Failed to start quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout pageTitle="Quiz Setup">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Quiz Setup</h1>
                    <p className={styles.subtitle}>Customize your test environment</p>
                </div>

                <Card className={styles.setupCard} variant="glass" padded>
                    <form className={styles.form} onSubmit={handleStartQuiz}>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="topic">Topic</label>
                            <select
                                id="topic"
                                className={styles.select}
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            >
                                <option value="dsa">Data Structures & Algorithms</option>
                                <option value="web-dev">Web Development</option>
                                <option value="system-design">System Design</option>
                                <option value="database">Database Management</option>
                                <option value="react">React.js</option>
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="difficulty">Difficulty</label>
                            <select
                                id="difficulty"
                                className={styles.select}
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="questions">Number of Questions</label>
                            <input
                                id="questions"
                                type="number"
                                className={styles.input}
                                min="5"
                                max="20"
                                value={totalQuestions}
                                onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                            />
                        </div>

                        {error && <p className={styles.errorText}>{error}</p>}

                        <div className={styles.actions}>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={loading}
                                disabled={loading}
                            >
                                Start Quiz
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </MainLayout>
    );
}
