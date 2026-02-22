import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Layers, FileSearch, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import styles from './LearningPage.module.css';

export default function LearningPage() {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('/api/learning/topics', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch learning topics');
                }

                const data = await response.json();
                setTopics(data);
            } catch (err) {
                console.error('Error fetching topics:', err);
                setError(err.message || 'An error occurred while loading topics.');
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, [navigate]);

    return (
        <MainLayout pageTitle="Learning">
            <div className={styles.container}>

                {/* Header Section */}
                <Card variant="default">
                    <div className={styles.header}>
                        <h1 className={styles.title}>Learning Modules</h1>
                        <p className={styles.subtitle}>Track and improve your technical skills</p>
                    </div>
                </Card>

                {/* Content Section */}
                {loading ? (
                    <div className={styles.centerState}>
                        <Loader2 className={styles.spinner} size={48} />
                        <p className={styles.stateText}>Loading your learning path...</p>
                    </div>
                ) : error ? (
                    <div className={styles.centerState}>
                        <AlertCircle className={styles.errorIcon} size={48} />
                        <p className={styles.errorText}>{error}</p>
                        <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                ) : (
                    <div className={styles.topicGrid}>
                        {topics.map(topic => (
                            <Card key={topic.id} hoverable className={styles.topicCard}>
                                <div className={styles.topicHeader}>
                                    <h2 className={styles.topicTitle}>{topic.title}</h2>
                                    <p className={styles.topicDesc}>{topic.description}</p>
                                </div>

                                <div className={styles.progressSection}>
                                    <div className={styles.progressInfo}>
                                        <span className={styles.progressText}>
                                            {topic.completedModules} of {topic.totalModules} modules completed
                                        </span>
                                        <span className={styles.progressPercent}>{topic.progress}%</span>
                                    </div>
                                    <div className={styles.progressBarBg}>
                                        <div
                                            className={styles.progressBarFill}
                                            style={{ width: `${topic.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={() => navigate(`/learning/${topic.id}`)}
                                >
                                    Continue
                                </Button>
                            </Card>
                        ))}
                        {topics.length === 0 && (
                            <div className={styles.emptyState}>
                                <p className={styles.stateText}>No learning topics available right now.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
