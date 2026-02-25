import { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Play, ChevronRight, Clock, Zap, BookOpen, Brain } from 'lucide-react';
import styles from './InterviewPage.module.css';
import { interviewService } from '../../services/interviewService';

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

    // Voice interview state
    const [isRecording, setIsRecording] = useState(false);
    const [isSubmittingVoice, setIsSubmittingVoice] = useState(false);
    const [voiceError, setVoiceError] = useState('');
    const [aiFeedback, setAiFeedback] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

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

    const handleStartRecording = async () => {
        setVoiceError('');
        setAiFeedback(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                chunksRef.current = [];

                const formData = new FormData();
                formData.append('audio', blob, 'answer.webm');
                formData.append('question', questions[currentQuestion]);

                setIsSubmittingVoice(true);
                try {
                    const result = await interviewService.sendVoiceAnswer(formData);
                    if (result?.success) {
                        setAiFeedback(result.data);
                    } else {
                        const rawError = result?.data?.error || '';
                        const isQuotaError =
                            typeof rawError === 'string' &&
                            rawError.toLowerCase().includes('insufficient_quota');

                        if (isQuotaError) {
                            setVoiceError(
                                'Our AI mic evaluator has hit its API quota. Your recording was received but could not be scored. Try again later or switch to written answers.'
                            );
                        } else {
                            setVoiceError(result?.message || 'Failed to get AI feedback.');
                        }
                    }
                } catch (err) {
                    setVoiceError(err.message || 'Failed to send audio to server.');
                } finally {
                    setIsSubmittingVoice(false);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            setVoiceError('Could not access microphone. Please check browser permissions.');
        }
    };

    const handleStopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
            recorder.stream.getTracks().forEach((t) => t.stop());
        }
        setIsRecording(false);
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

                {/* Banner: demo-only notice */}
                <div className={styles.demoBanner}>
                    <p>
                        This page uses <strong>static demo questions only</strong>. For a full AI-driven interview
                        based on your resume and target role, use the{' '}
                        <strong>AI Interview</strong> entry in the sidebar or go to <code>/start-interview</code>.
                    </p>
                </div>

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

                        {/* Voice controls */}
                        <div className={styles.voiceControls}>
                            <div className={styles.voiceButtons}>
                                {!isRecording ? (
                                    <Button variant="secondary" onClick={handleStartRecording}>
                                        Use microphone for this answer
                                    </Button>
                                ) : (
                                    <Button variant="secondary" onClick={handleStopRecording}>
                                        Stop &amp; send to AI
                                    </Button>
                                )}
                                {isSubmittingVoice && (
                                    <span className={styles.voiceStatus}>Processing your answer with AI…</span>
                                )}
                            </div>
                            {voiceError && (
                                <p className={styles.voiceError}>{voiceError}</p>
                            )}
                            {aiFeedback && (
                                <div className={styles.feedbackBox}>
                                    {aiFeedback.transcript && (
                                        <p className={styles.feedbackTranscript}>
                                            <strong>Your answer (transcribed):</strong> {aiFeedback.transcript}
                                        </p>
                                    )}
                                    {aiFeedback.feedback && (
                                        <p className={styles.feedbackText}>
                                            <strong>AI feedback:</strong> {aiFeedback.feedback}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

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
