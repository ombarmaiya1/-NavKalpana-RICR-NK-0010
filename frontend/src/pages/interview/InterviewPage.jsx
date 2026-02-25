import { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Play, ChevronRight, Clock, Zap, BookOpen, Brain } from 'lucide-react';
import styles from './InterviewPage.module.css';

/* ─── Mock questions per interview type ─────────────────────────── */
const QUESTIONS = {
    Technical: [
        'Explain the difference between deep and shallow copying in JavaScript.',
        'What is the event loop and how does it handle asynchronous code?',
        'Describe the key differences between REST and GraphQL APIs.',
    ],
    HR: [
        'Tell me about a time you handled a difficult conflict with a team member.',
        'What are your greatest professional strengths and weaknesses?',
        'Where do you see your career heading in the next 5 years?',
    ],
    'System Design': [
        'How would you design a scalable URL shortener like bit.ly?',
        'Design a real-time global chat application from scratch.',
        'Walk me through building a distributed caching system.',
    ],
};

/* ─── Component ─────────────────────────────────────────────────── */
export default function InterviewPage() {
    // Config state
    const [credits, setCredits] = useState(5);
    const [selectedType, setSelectedType] = useState('Technical');
    const [difficulty, setDifficulty] = useState('Medium');
    const [duration, setDuration] = useState('30');

    // Session state
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    const questions = QUESTIONS[selectedType] ?? QUESTIONS.Technical;

    /* Timer */
    useEffect(() => {
        if (!interviewStarted) return;
        if (timeLeft <= 0) return;
        const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [interviewStarted, timeLeft]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    /* Handlers */
    const handleStart = () => {
        if (credits <= 0) {
            alert('You have no credits left. Please recharge to continue.');
            return;
        }
        setCredits(c => c - 1);
        setTimeLeft(parseInt(duration, 10) * 60);
        setCurrentQuestion(0);
        setAnswer('');
        setInterviewStarted(true);
    };

    const handleSubmit = () => {
        if (!answer.trim()) {
            alert('Please write your answer before saving.');
            return;
        }
        alert('Answer saved successfully!');
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(q => q + 1);
            setAnswer('');
        } else {
            alert('Interview complete! Great work.');
            setInterviewStarted(false);
        }
    };

    /* ─── Render ─────────────────────────────────────────────────── */
    return (
        <MainLayout pageTitle="AI Mock Interview">
            <div className={styles.page}>

                {/* ── Hero ──────────────────────────────────────────── */}
                {!interviewStarted && (
                    <div className={styles.hero}>
                        <div className={styles.heroBadge}>
                            <Zap size={14} />
                            AI-Powered Practice
                        </div>
                        <h1 className={styles.heroTitle}>AI Mock Interview</h1>
                        <p className={styles.heroSubtitle}>
                            Sharpen your skills with adaptive questions. Each session deducts&nbsp;
                            <strong>1 credit</strong>. You have <strong>{credits}</strong> remaining.
                        </p>
                        <Button
                            variant="primary"
                            size="lg"
                            leftIcon={<Play size={18} />}
                            onClick={handleStart}
                            className={styles.heroBtn}
                        >
                            Start Interview
                        </Button>
                    </div>
                )}

                {/* ── Config Card ───────────────────────────────────── */}
                {!interviewStarted && (
                    <Card
                        variant="glass"
                        hoverable
                        header={
                            <div className={styles.cardTitle}>
                                <BookOpen size={20} />
                                Configure Your Session
                            </div>
                        }
                    >
                        <div className={styles.formGrid}>
                            {/* Interview Type */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Interview Type</label>
                                <select
                                    className={styles.select}
                                    value={selectedType}
                                    onChange={e => setSelectedType(e.target.value)}
                                >
                                    <option value="Technical">Technical</option>
                                    <option value="HR">HR / Behavioral</option>
                                    <option value="System Design">System Design</option>
                                </select>
                            </div>

                            {/* Difficulty */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Difficulty</label>
                                <select
                                    className={styles.select}
                                    value={difficulty}
                                    onChange={e => setDifficulty(e.target.value)}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            {/* Duration */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Duration</label>
                                <select
                                    className={styles.select}
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                >
                                    <option value="15">15 mins</option>
                                    <option value="30">30 mins</option>
                                    <option value="45">45 mins</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.confirmRow}>
                            <span className={styles.creditNote}>
                                <Zap size={16} /> Costs <strong>1 credit</strong> &mdash; {credits} available
                            </span>
                            <Button
                                variant="primary"
                                leftIcon={<Play size={16} />}
                                onClick={handleStart}
                            >
                                Confirm &amp; Start
                            </Button>
                        </div>
                    </Card>
                )}

                {/* ── Interview Session ──────────────────────────────── */}
                {interviewStarted && (
                    <Card variant="glass" className={styles.sessionCard}>
                        {/* Header row */}
                        <div className={styles.sessionHeader}>
                            <div className={styles.sessionMeta}>
                                <span className={styles.pill}>{selectedType}</span>
                                <span className={styles.pill}>{difficulty}</span>
                                <span className={styles.questionCount}>
                                    Question {currentQuestion + 1} / {questions.length}
                                </span>
                            </div>
                            <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerWarning : ''}`}>
                                <Clock size={18} />
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* Question */}
                        <div className={styles.questionBox}>
                            <Brain size={22} className={styles.questionIcon} />
                            <p className={styles.questionText}>{questions[currentQuestion]}</p>
                        </div>

                        {/* Answer */}
                        <textarea
                            className={styles.textarea}
                            placeholder="Type your detailed answer here…"
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                        />

                        {/* Actions */}
                        <div className={styles.actions}>
                            <Button variant="secondary" onClick={handleSubmit}>
                                Save Draft
                            </Button>
                            <Button
                                variant="primary"
                                rightIcon={<ChevronRight size={18} />}
                                onClick={handleNext}
                            >
                                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next Question'}
                            </Button>
                        </div>
                    </Card>
                )}

            </div>
        </MainLayout>
    );
}
