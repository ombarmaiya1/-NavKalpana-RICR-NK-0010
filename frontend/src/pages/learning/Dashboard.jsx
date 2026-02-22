import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, AlertTriangle, TrendingUp, Play, FileText, Activity, Layers, FileSearch } from 'lucide-react';
import styles from './Dashboard.module.css';

const performanceData = [
    { day: 'Mon', score: 65 },
    { day: 'Tue', score: 68 },
    { day: 'Wed', score: 74 },
    { day: 'Thu', score: 72 },
    { day: 'Fri', score: 79 },
    { day: 'Sat', score: 85 },
    { day: 'Sun', score: 88 }
];

const masteryTopics = [
    { topic: 'Arrays', percent: 95 },
    { topic: 'Hashing', percent: 88 },
    { topic: 'Two Pointers', percent: 76 },
    { topic: 'Trees', percent: 65 },
    { topic: 'Graphs', percent: 45 },
    { topic: 'Greedy', percent: 30 },
    { topic: 'DP', percent: 20 },
    { topic: 'Backtracking', percent: 15 },
];

export default function Dashboard() {
    const navigate = useNavigate();

    const getHeatmapColor = (percent) => {
        // Return an rgba value based on percentage
        // Low percent = more red/orange, High percent = more green/blue
        if (percent < 30) return 'var(--danger)';
        if (percent < 60) return 'var(--warning)';
        if (percent < 80) return 'var(--primary)';
        return 'var(--success)';
    };

    const navItems = [
        { label: 'Dashboard', to: '/', icon: <Layers size={20} /> },
        { label: 'Resume Analysis', to: '/resume-analysis', icon: <FileSearch size={20} /> },
        { label: 'Learning Modules', to: '/learning', icon: <BookOpen size={20} /> },
    ];

    return (
        <MainLayout pageTitle="Learning Dashboard" navItems={navItems}>
            <div className={styles.dashboard}>

                {/* Welcome Section */}
                <div className={styles.header}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                        <div>
                            <h1 className={styles.welcomeTitle}>Welcome back, Student</h1>
                            <p className="text-muted">Here is an overview of your learning progress and upcoming tasks.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <Button
                                variant="secondary"
                                leftIcon={<BookOpen size={20} />}
                                onClick={() => navigate('/learning')}
                            >
                                Continue Learning
                            </Button>
                            <Button
                                variant="primary"
                                leftIcon={<FileSearch size={20} />}
                                onClick={() => navigate('/resume-analysis')}
                            >
                                Analyze Resume
                            </Button>
                        </div>
                    </div>
                </div>

                <div className={styles.topGrid}>
                    {/* SECTION 1: Welcome Panel (Readiness) */}
                    <Card hoverable>
                        <div className={styles.flexBetween}>
                            <h3 className="text-secondary">Readiness Score</h3>
                            <Activity className="text-brand" size={24} />
                        </div>
                        <div className={styles.scoreVal}>78<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span></div>
                        <div className={styles.flexBetween}>
                            <span className="text-muted">Current standing</span>
                            <span className={`${styles.badge} ${styles.badgeMedium}`}>
                                <AlertTriangle size={14} /> Medium Risk
                            </span>
                        </div>
                    </Card>

                    {/* SECTION 2: Resume Strength Card */}
                    <Card hoverable>
                        <div className={styles.flexBetween}>
                            <h3 className="text-secondary">Resume Strength</h3>
                            <FileText className="text-accent" size={24} />
                        </div>
                        <div className={styles.scoreVal} style={{ color: 'var(--accent)' }}>72<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span></div>
                        <p className={styles.textMuted}>Add 2 more backend projects to boost your score.</p>
                        <Button
                            variant="secondary"
                            leftIcon={<FileText size={18} />}
                            fullWidth
                            onClick={() => navigate('/resume-analysis')}
                        >
                            Analyze Resume
                        </Button>
                    </Card>

                    {/* SECTION 3: Upcoming Adaptive Quiz */}
                    <Card hoverable>
                        <div className={styles.flexBetween} style={{ marginBottom: 'var(--space-2)' }}>
                            <h3 className="text-secondary">Upcoming Quiz</h3>
                            <BookOpen className="text-primary" size={24} />
                        </div>
                        <div className={styles.statRow}>
                            <span>Topic:</span>
                            <span className={styles.statVal}>Data Structures</span>
                        </div>
                        <div className={styles.statRow}>
                            <span>Difficulty:</span>
                            <span className={styles.statVal} style={{ color: 'var(--warning)' }}>Medium</span>
                        </div>
                        <div className={styles.statRow} style={{ marginBottom: 'var(--space-4)' }}>
                            <span>Estimated Time:</span>
                            <span className={styles.statVal}>20 mins</span>
                        </div>
                        <Button
                            variant="primary"
                            leftIcon={<Play size={18} />}
                            fullWidth
                            onClick={() => navigate('/quiz-setup')}
                        >
                            Start Quiz
                        </Button>
                    </Card>
                </div>

                <div className={styles.bottomGrid}>
                    {/* SECTION 6: Performance Trend */}
                    <Card hoverable>
                        <div className={styles.flexBetween}>
                            <h3 className="text-secondary">Performance Trend</h3>
                            <TrendingUp className="text-success" size={24} />
                        </div>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                                    <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                                        itemStyle={{ color: 'var(--accent)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="var(--accent)"
                                        strokeWidth={3}
                                        dot={{ fill: 'var(--bg-secondary)', stroke: 'var(--accent)', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: 'var(--accent)' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* SECTION 4: High Risk Topics */}
                        <Card hoverable>
                            <h3 className="text-secondary">High Risk Topics</h3>
                            <div className={styles.topicList}>
                                <span className={`${styles.badge} ${styles.badgeHigh}`}>Recursion</span>
                                <span className={`${styles.badge} ${styles.badgeHigh}`}>Dynamic Programming</span>
                                <span className={`${styles.badge} ${styles.badgeHigh}`}>SQL Optimization</span>
                                <span className={`${styles.badge} ${styles.badgeHigh}`}>System Design</span>
                            </div>
                        </Card>

                        {/* SECTION 5: Topic Mastery Heatmap */}
                        <Card hoverable>
                            <h3 className="text-secondary">Topic Mastery Heatmap</h3>
                            <div className={styles.heatmapGrid}>
                                {masteryTopics.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={styles.heatmapItem}
                                        style={{ backgroundColor: getHeatmapColor(item.percent) }}
                                    >
                                        <span className={styles.heatmapTopic}>{item.topic}</span>
                                        <span className={styles.heatmapPercent}>{item.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </MainLayout>
    );
}
