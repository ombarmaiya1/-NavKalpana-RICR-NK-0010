import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { interviewSessionService } from '../../services/interviewSessionService';
import { useInterview } from '../../context/InterviewContext';
import styles from './InterviewStartPage.module.css';

export default function InterviewStartPage() {
    const navigate = useNavigate();
    const { setSessionId, setTotalQuestions } = useInterview();

    const [resumeFile, setResumeFile] = useState(null);
    const [role, setRole] = useState('');
    const [skills, setSkills] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [aiOffline, setAiOffline] = useState(false);
    const [aiOfflineMessage, setAiOfflineMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setAiOffline(false);
        setAiOfflineMessage('');

        if (!resumeFile || !role.trim()) {
            setError('Please upload your resume and provide a target role.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('role', role);
            formData.append('skills', skills);
            formData.append('difficulty', difficulty);
            formData.append('resume_file', resumeFile);

            const result = await interviewSessionService.startInterview(formData);

            if (!result?.success) {
                const rawError = result?.data?.error || '';
                const isQuotaError =
                    typeof rawError === 'string' &&
                    rawError.toLowerCase().includes('insufficient_quota');

                setAiOffline(true);
                setAiOfflineMessage(
                    isQuotaError
                        ? 'Our AI interview engine has temporarily hit its API quota while preparing your questions. Your resume was received, but we could not generate a live interview right now.'
                        : (result?.message || 'The AI interview engine could not start a session right now. Please try again later.')
                );
                setIsSubmitting(false);
                return;
            }

            const { session_id, first_question, total_questions } = result.data;
            setSessionId(session_id);
            setTotalQuestions(total_questions);

            navigate('/interview-session', { state: { initialQuestion: first_question } });
        } catch (err) {
            setAiOffline(true);
            setAiOfflineMessage(
                err.message || 'Unexpected error while contacting the AI interview engine. Please try again later.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (aiOffline) {
        return (
            <MainLayout pageTitle="OpenAI API quota exhausted">
                <div className={styles.page}>
                    <Card variant="glass" className={styles.quotaCard}>
                        <h1 className={styles.quotaTitle}>OpenAI API quota exhausted.</h1>
                        <p className={styles.quotaText}>
                            {aiOfflineMessage}
                        </p>
                        <p className={styles.quotaHint}>
                            The underlying <code>OPENAI_API_KEY</code> has run out of quota. You can still review your
                            resume and learning dashboard, then retry once the API quota has been topped up.
                        </p>
                        <div className={styles.quotaActions}>
                            <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>
                                Go to Dashboard
                            </Button>
                            <Button variant="primary" onClick={() => window.location.reload()}>
                                Try Again
                            </Button>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout pageTitle="Start AI Interview">
            <div className={styles.page}>
                <Card variant="glass" className={styles.card}>
                    <h1 className={styles.title}>AI Career Interview</h1>
                    <p className={styles.subtitle}>
                        Upload your resume, choose your target role and skill stack, and we&apos;ll generate a
                        tailored AI-driven interview session.
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Resume upload</label>
                            <div className={styles.uploadBox}>
                                <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setResumeFile(file || null);
                                    }}
                                />
                                <p className={styles.uploadHint}>
                                    Upload a recent resume in <strong>PDF</strong> or <strong>plain text</strong> format.
                                </p>
                                {resumeFile && (
                                    <p className={styles.fileInfo}>
                                        Selected: <strong>{resumeFile.name}</strong>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className={styles.inlineFields}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Target Role</label>
                                <input
                                    className={styles.input}
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. Frontend Engineer"
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Difficulty</label>
                                <select
                                    className={styles.select}
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Skill Stack</label>
                            <input
                                className={styles.input}
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="Comma-separated skills, e.g. React, TypeScript, Node.js"
                            />
                            <p className={styles.helper}>Used to tailor the question categories and depth.</p>
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.actions}>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Preparing interview…' : 'Start Interview'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </MainLayout>
    );
}