import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Layers, FileSearch, BookOpen, AlertCircle, Loader2, CheckCircle, Circle, Play } from 'lucide-react';
import styles from './TopicDetail.module.css';

export default function TopicDetail() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopicDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`/api/learning/topic/${topicId}`, {
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
                    throw new Error('Failed to fetch topic details');
                }

                const data = await response.json();
                setTopic(data);
            } catch (err) {
                console.error('Error fetching topic detail:', err);
                setError(err.message || 'An error occurred while loading topic details.');
            } finally {
                setLoading(false);
            }
        };

        if (topicId) {
            fetchTopicDetail();
        }
    }, [topicId, navigate]);

    return (
        <MainLayout pageTitle={topic ? topic.title : 'Topic Details'}>
            <div className={styles.container}>

                {loading ? (
                    <div className={styles.centerState}>
                        <Loader2 className={styles.spinner} size={48} />
                        <p className={styles.stateText}>Loading topic details...</p>
                    </div>
                ) : error ? (
                    <div className={styles.centerState}>
                        <AlertCircle className={styles.errorIcon} size={48} />
                        <p className={styles.errorText}>{error}</p>
                        <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                ) : topic ? (
                    <>
                        {/* Section 1: Topic Header */}
                        <Card variant="default">
                            <div className={styles.header}>
                                <h1 className={styles.title}>{topic.title}</h1>
                                {/* If there was a summary in the mock API, we display it here. Using a generic one if absent to fulfill UI requirement */}
                                <p className={styles.subtitle}>
                                    {topic.summary || 'Complete all modules below to master this topic.'}
                                </p>
                            </div>
                        </Card>

                        {/* Section 2: Module List */}
                        <Card variant="default">
                            <div className={styles.moduleSectionHeader}>
                                <h2 className={styles.moduleSectionTitle}>Modules</h2>
                            </div>

                            <div className={styles.moduleList}>
                                {topic.modules && topic.modules.length > 0 ? (
                                    topic.modules.map((module, index) => (
                                        <div key={module.id} className={styles.moduleRow}>
                                            <div className={styles.moduleInfo}>
                                                <div className={styles.moduleIconWrapper}>
                                                    {module.completed ? (
                                                        <CheckCircle className={styles.completedIcon} size={24} />
                                                    ) : (
                                                        <Circle className={styles.pendingIcon} size={24} />
                                                    )}
                                                </div>
                                                <div className={styles.moduleDetails}>
                                                    <span className={styles.moduleNumber}>Module {index + 1}</span>
                                                    <h3 className={styles.moduleTitle}>{module.title}</h3>
                                                </div>
                                            </div>

                                            <Button
                                                variant={module.completed ? "secondary" : "primary"}
                                                leftIcon={!module.completed && <Play size={16} />}
                                                onClick={() => navigate(`/learning/${topicId}/module/${module.id}`)}
                                            >
                                                {module.completed ? "Review" : "Start"}
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.emptyState}>No modules found for this topic.</p>
                                )}
                            </div>
                        </Card>
                    </>
                ) : null}

            </div>
        </MainLayout>
    );
}
