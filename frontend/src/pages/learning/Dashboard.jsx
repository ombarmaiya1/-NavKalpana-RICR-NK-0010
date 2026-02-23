import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, AlertTriangle, TrendingUp, Play, FileText, Activity, Layers, FileSearch, Loader2, Target } from 'lucide-react';
import styles from './Dashboard.module.css';
import learningService from '../../services/learningService';
import { saveToStorage, getFromStorage } from '../../utils/storage';

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Show cached data instantly
            const cached = getFromStorage('dashboard_data');
            if (cached) {
                setData(cached);
                setLoading(false);
            }
            // Always refresh from server in background
            try {
                const response = await learningService.getDashboard();
                if (response && response.success) {
                    setData(response.data);
                    saveToStorage('dashboard_data', response.data);
                } else if (!cached) {
                    setError(response?.message || 'Failed to load dashboard data');
                }
            } catch (err) {
                if (!cached) setError('An error occurred while connecting to the server.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getHeatmapColor = (percent) => {
        if (!percent && percent !== 0) return 'var(--bg-tertiary)'; // Gray for Not Attempted
        if (percent < 30) return 'var(--danger)';
        if (percent < 60) return 'var(--warning)';
        if (percent < 80) return 'var(--primary)';
        return 'var(--success)';
    };

    if (loading) {
        return (
            <MainLayout pageTitle="Learning Dashboard">
                <div className={styles.centerState}>
                    <Loader2 className="spin" size={48} />
                    <p>Fetching your personalized intelligence...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout pageTitle="Learning Dashboard">
                <div className={styles.centerState}>
                    <AlertTriangle size={48} className="text-danger" />
                    <p className="text-danger">{error}</p>
                    <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </MainLayout>
        );
    }

    const {
        is_new_user,
        mastery_heatmap = [],
        high_risk_topics = [],
        recommended_quiz_topic = "N/A",
        recommended_assignment_topic = "N/A",
        daily_study_plan = {},
        performance_trend = [],
        consistency_score = 0
    } = data || {};

    return (
        <MainLayout pageTitle="Learning Dashboard">
            <div className={styles.dashboard}>

                {/* Welcome Section */}
                <div className={styles.header}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                        <div>
                            <h1 className={styles.welcomeTitle}>{is_new_user ? "Start Your Learning Journey" : "Welcome back, Learner"}</h1>
                            <p className="text-muted">
                                {is_new_user
                                    ? "Finish your profile analysis to unlock personalized quizzes and plans."
                                    : "Here is an overview of your real-time learning progress and career readiness."}
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            leftIcon={<FileSearch size={20} />}
                            onClick={() => navigate('/resume-analysis')}
                        >
                            {is_new_user ? "Analyze Resume" : "Re-analyze Resume"}
                        </Button>
                    </div>
                </div>

                <div className={styles.topGrid}>
                    {/* SECTION 1: Consistency/Mastery Average */}
                    <Card hoverable>
                        <div className={styles.flexBetween}>
                            <h3 className="text-secondary">Consistency Score</h3>
                            <Activity className="text-brand" size={24} />
                        </div>
                        <div className={styles.scoreVal}>{consistency_score}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span></div>
                        <div className={styles.flexBetween}>
                            <span className="text-muted">7-day activity level</span>
                            <span className={`${styles.badge} ${consistency_score > 70 ? styles.badgeLow : consistency_score > 40 ? styles.badgeMedium : styles.badgeHigh}`}>
                                {consistency_score > 70 ? 'High Consistency' : consistency_score > 40 ? 'Moderate' : 'Needs Improvement'}
                            </span>
                        </div>
                    </Card>

                    {/* SECTION 2: Study Plan Goal */}
                    <Card hoverable>
                        <div className={styles.flexBetween}>
                            <h3 className="text-secondary">Current Goal</h3>
                            <Target className="text-accent" size={24} />
                        </div>
                        <p className={styles.textMuted} style={{ marginTop: 'var(--space-2)', minHeight: '60px' }}>
                            {daily_study_plan?.weekly_goal || "Resume your learning journey to see goals."}
                        </p>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => navigate('/learning')}
                        >
                            View Study Plan
                        </Button>
                    </Card>

                    {/* SECTION 3: Assignments */}
                    <Card hoverable>
                        <div className={styles.flexBetween}>
                            <h3 className="text-secondary">Next Assignment</h3>
                            <FileText className="text-primary" size={24} />
                        </div>
                        <div className={styles.statRow} style={{ marginTop: 'var(--space-2)' }}>
                            <span className={styles.statVal}>{recommended_assignment_topic}</span>
                        </div>
                        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => navigate('/assignments')}
                            >
                                Start Assignment
                            </Button>
                        </div>
                    </Card>

                    {/* SECTION 4: Upcoming Adaptive Quiz */}
                    <Card hoverable>
                        <div className={styles.flexBetween} style={{ marginBottom: 'var(--space-2)' }}>
                            <h3 className="text-secondary">Recommended Quiz</h3>
                            <BookOpen className="text-primary" size={24} />
                        </div>
                        <div className={styles.statRow}>
                            <span>Topic:</span>
                            <span className={styles.statVal}>{recommended_quiz_topic}</span>
                        </div>
                        <div className={styles.statRow} style={{ marginBottom: 'var(--space-4)' }}>
                            <span>Mode:</span>
                            <span className={styles.statVal} style={{ color: 'var(--warning)' }}>Adaptive</span>
                        </div>
                        <Button
                            variant="primary"
                            leftIcon={<Play size={18} />}
                            fullWidth
                            onClick={() => navigate('/quiz-setup')}
                        >
                            Take Quiz
                        </Button>
                    </Card>
                </div>

                <div className={styles.bottomGrid}>
                    {/* SECTION 5: Performance Trend */}
                    <Card hoverable>
                        <div className={styles.flexBetween}>
                            <h3 className="text-secondary">Performance Trend</h3>
                            <TrendingUp className="text-success" size={24} />
                        </div>
                        <div className={styles.chartContainer}>
                            {performance_trend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={performance_trend} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                        <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
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
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    Take your first quiz to see your performance trend.
                                </div>
                            )}
                        </div>
                    </Card>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* SECTION 6: High Risk Topics */}
                        <Card hoverable>
                            <h3 className="text-secondary">High Risk Areas</h3>
                            <div className={styles.topicList}>
                                {high_risk_topics.length > 0 ? (
                                    high_risk_topics.map((topic, idx) => (
                                        <span key={idx} className={`${styles.badge} ${styles.badgeHigh}`}>{topic}</span>
                                    ))
                                ) : (
                                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>No high risk areas identified yet.</p>
                                )}
                            </div>
                        </Card>

                        {/* SECTION 7: Topic Mastery Heatmap */}
                        <Card hoverable>
                            <h3 className="text-secondary">Mastery Heatmap</h3>
                            <div className={styles.heatmapGrid}>
                                {mastery_heatmap.length > 0 ? (
                                    mastery_heatmap.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={styles.heatmapItem}
                                            style={{ backgroundColor: getHeatmapColor(item.mastery) }}
                                        >
                                            <span className={styles.heatmapTopic}>{item.topic}</span>
                                            <span className={styles.heatmapPercent}>{item.mastery !== null ? `${Math.round(item.mastery)}%` : 'New'}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Upload resume to see skill heatmap.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
            <style jsx>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </MainLayout>
    );
}
