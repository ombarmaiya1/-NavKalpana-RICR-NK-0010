import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Loader2, AlertCircle, Play, FileTerminal, BookOpen, Video, Map, Youtube } from 'lucide-react';
import styles from './LearningPage.module.css';
import learningService from '../../services/learningService';
import { saveToStorage, getFromStorage } from '../../utils/storage';

export default function LearningPage() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedTopic, setSelectedTopic] = useState(null);
    const [topicData, setTopicData] = useState(null);

    // Resources state
    const [resources, setResources] = useState(null);
    const [loadingResources, setLoadingResources] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            // Load cached data instantly
            const cached = getFromStorage('learning_topics');
            if (cached) {
                setDashboardData(cached);
                setLoading(false);
                autoSelectTopic(cached);
            }
            // Always refresh from server
            try {
                const response = await learningService.getDashboard();
                if (response && response.success) {
                    setDashboardData(response.data);
                    saveToStorage('learning_topics', response.data);
                    if (!cached) autoSelectTopic(response.data);
                } else if (!cached) {
                    setError(response?.message || 'Failed to fetch learning dashboard');
                }
            } catch (err) {
                if (!cached) setError('An error occurred while loading your learning path.');
            } finally {
                setLoading(false);
            }
        };

        const autoSelectTopic = (data) => {
            if (data.high_risk_topics?.length > 0) setSelectedTopic(data.high_risk_topics[0]);
            else if (data.improvement_topics?.length > 0) setSelectedTopic(data.improvement_topics[0]);
            else if (data.resume_topics?.length > 0) setSelectedTopic(data.resume_topics[0]);
        };

        fetchDashboard();
    }, []);

    // Effect whenever selectedTopic changes
    useEffect(() => {
        if (!selectedTopic || !dashboardData) return;

        // Find topic metadata from heatmap
        const meta = dashboardData.mastery_heatmap.find(item => item.topic === selectedTopic);
        setTopicData(meta || { topic: selectedTopic, mastery: null, risk: 'Not Attempted', level: 'Basic' });

        // Fetch internet resources based on level
        const fetchResources = async () => {
            setLoadingResources(true);
            try {
                const level = meta?.level || 'Basic';
                const response = await learningService.getResources(selectedTopic, level);
                if (response && response.success) {
                    setResources(response.data.resources);
                } else {
                    setResources(null); // Fallback to null on error
                }
            } catch (err) {
                console.error('Failed to fetch resources', err);
                setResources(null);
            } finally {
                setLoadingResources(false);
            }
        };

        fetchResources();
    }, [selectedTopic, dashboardData]);

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
    };

    if (loading) {
        return (
            <MainLayout pageTitle="Learning">
                <div className={styles.centerState}>
                    <Loader2 className={styles.spinner} size={48} />
                    <p className={styles.stateText}>Loading your adaptive learning path...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout pageTitle="Learning">
                <div className={styles.centerState}>
                    <AlertCircle className={styles.errorIcon} size={48} />
                    <p className={styles.errorText}>{error}</p>
                    <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </MainLayout>
        );
    }

    // Helper functions for class names
    const getBadgeLevelClass = (level) => {
        if (level === 'Intermediate') return styles.badgeLevelIntermediate;
        if (level === 'Advanced') return styles.badgeLevelAdvanced;
        return styles.badgeLevelBasic;
    };

    const getBadgeRiskClass = (risk) => {
        if (risk === 'High Risk') return styles.badgeRiskHigh;
        if (risk === 'Moderate') return styles.badgeRiskModerate;
        if (risk === 'Strong') return styles.badgeRiskStrong;
        return styles.badgeRiskNone;
    };

    return (
        <MainLayout pageTitle="Adaptive Learning System">
            <div className={styles.layoutContainer}>

                {/* LEFT SIDEBAR */}
                <div className={styles.sidebar}>
                    {dashboardData.high_risk_topics.length > 0 && (
                        <div className={styles.sidebarSection}>
                            <h3 className={styles.sidebarTitle}>High Priority</h3>
                            <div className={styles.topicList}>
                                {dashboardData.high_risk_topics.map(t => (
                                    <button
                                        key={t}
                                        className={`${styles.topicItem} ${selectedTopic === t ? styles.topicItemActive : ''}`}
                                        onClick={() => handleTopicClick(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {dashboardData.improvement_topics.length > 0 && (
                        <div className={styles.sidebarSection}>
                            <h3 className={styles.sidebarTitle}>Improve These</h3>
                            <div className={styles.topicList}>
                                {dashboardData.improvement_topics.map(t => (
                                    <button
                                        key={t}
                                        className={`${styles.topicItem} ${selectedTopic === t ? styles.topicItemActive : ''}`}
                                        onClick={() => handleTopicClick(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.sidebarSection}>
                        <h3 className={styles.sidebarTitle}>Resume Skills</h3>
                        <div className={styles.topicList}>
                            {dashboardData.resume_strength_topics.map(t => (
                                <button
                                    key={t}
                                    className={`${styles.topicItem} ${selectedTopic === t ? styles.topicItemActive : ''}`}
                                    onClick={() => handleTopicClick(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className={styles.mainContent}>
                    {!topicData ? (
                        <div className={styles.emptySelection}>
                            <h2>Select a Topic</h2>
                            <p>Choose a topic from the sidebar to view your mastery, risk profile, and recommended learning resources.</p>
                        </div>
                    ) : (
                        <>
                            <Card>
                                <div className={styles.topicHeader}>
                                    <div className={styles.topicTitleArea}>
                                        <h1 className={styles.topicTitle}>{topicData.topic}</h1>
                                        <div className={styles.badges}>
                                            <span className={`${styles.badge} ${getBadgeLevelClass(topicData.level)}`}>
                                                Level: {topicData.level}
                                            </span>
                                            <span className={`${styles.badge} ${getBadgeRiskClass(topicData.risk)}`}>
                                                Risk: {topicData.risk}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.masteryDisplay}>
                                        <div className={styles.masteryCircle}>
                                            {topicData.mastery !== null ? `${Math.round(topicData.mastery)}%` : '--'}
                                        </div>
                                        <span className={styles.masteryLabel}>Mastery</span>
                                    </div>
                                </div>
                                <div className={styles.actionButtons}>
                                    <Button
                                        variant="primary"
                                        icon={Play}
                                        onClick={() => navigate('/quiz')}
                                    >
                                        Start Quiz
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        icon={FileTerminal}
                                        onClick={() => navigate('/assignments')}
                                    >
                                        Get Assignment
                                    </Button>
                                    <Button
                                        variant="outline"
                                        icon={Map}
                                        onClick={() => alert('Study Plan is available on your Main Dashboard!')}
                                    >
                                        Study Plan
                                    </Button>
                                </div>
                            </Card>

                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '1rem', marginBottom: '0' }}>Recommended Resources</h2>

                            {loadingResources ? (
                                <div className={styles.centerState} style={{ minHeight: '200px' }}>
                                    <Loader2 className={styles.spinner} size={32} />
                                    <p className={styles.stateText}>Finding the best resources...</p>
                                </div>
                            ) : resources ? (
                                <div className={styles.resourcesGrid}>

                                    <div className={styles.resourceCategory}>
                                        <h3 className={styles.resourceCategoryTitle}><Youtube size={20} /> YouTube Videos</h3>
                                        <div className={styles.resourceList}>
                                            {resources.youtube?.map((item, i) => (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" key={i} className={styles.resourceLink}>
                                                    {item.title}
                                                </a>
                                            ))}
                                            {(!resources.youtube || resources.youtube.length === 0) && <p style={{ color: 'var(--text-muted)' }}>No videos found.</p>}
                                        </div>
                                    </div>

                                    <div className={styles.resourceCategory}>
                                        <h3 className={styles.resourceCategoryTitle}><BookOpen size={20} /> Official Documentation</h3>
                                        <div className={styles.resourceList}>
                                            {resources.documentation?.map((item, i) => (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" key={i} className={styles.resourceLink}>
                                                    {item.title}
                                                </a>
                                            ))}
                                            {(!resources.documentation || resources.documentation.length === 0) && <p style={{ color: 'var(--text-muted)' }}>No documentation found.</p>}
                                        </div>
                                    </div>

                                    <div className={styles.resourceCategory}>
                                        <h3 className={styles.resourceCategoryTitle}><FileTerminal size={20} /> Practice & Projects</h3>
                                        <div className={styles.resourceList}>
                                            {resources.practice?.map((item, i) => (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" key={i} className={styles.resourceLink}>
                                                    {item.title}
                                                </a>
                                            ))}
                                            {(!resources.practice || resources.practice.length === 0) && <p style={{ color: 'var(--text-muted)' }}>No practice links found.</p>}
                                        </div>
                                    </div>

                                    <div className={styles.resourceCategory}>
                                        <h3 className={styles.resourceCategoryTitle}><BookOpen size={20} /> Articles & Blogs</h3>
                                        <div className={styles.resourceList}>
                                            {resources.articles?.map((item, i) => (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" key={i} className={styles.resourceLink}>
                                                    {item.title}
                                                </a>
                                            ))}
                                            {(!resources.articles || resources.articles.length === 0) && <p style={{ color: 'var(--text-muted)' }}>No articles found.</p>}
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <Card>
                                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No resources available at this time.
                                    </div>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
