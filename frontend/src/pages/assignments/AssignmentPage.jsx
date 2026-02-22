import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Layers, FileSearch, BookOpen, AlertCircle, Loader2, FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import styles from './AssignmentPage.module.css';

export default function AssignmentPage() {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('/api/assignments', {
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
                    throw new Error('Failed to fetch assignments');
                }

                const data = await response.json();
                setAssignments(data);
            } catch (err) {
                console.error('Error fetching assignments:', err);
                setError(err.message || 'An error occurred while loading assignments.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [navigate]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'graded':
                return styles.badgeSuccess;
            case 'submitted':
                return styles.badgeInfo;
            case 'pending':
            default:
                return styles.badgeNeutral;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'graded':
                return <CheckCircle size={14} />;
            case 'submitted':
                return <Clock size={14} />;
            case 'pending':
            default:
                return <AlertCircle size={14} />;
        }
    };

    return (
        <MainLayout pageTitle="Assignments">
            <div className={styles.container}>

                {/* Header Section */}
                <Card variant="default">
                    <div className={styles.header}>
                        <h1 className={styles.title}>Your Assignments</h1>
                        <p className={styles.subtitle}>Complete and track your submissions</p>
                    </div>
                </Card>

                {/* Content Section */}
                {loading ? (
                    <div className={styles.centerState}>
                        <Loader2 className={styles.spinner} size={48} />
                        <p className={styles.stateText}>Loading your assignments...</p>
                    </div>
                ) : error ? (
                    <div className={styles.centerState}>
                        <AlertCircle className={styles.errorIcon} size={48} />
                        <p className={styles.errorText}>{error}</p>
                        <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                ) : (
                    <div className={styles.assignmentGrid}>
                        {assignments.map(assignment => (
                            <Card key={assignment.id} hoverable className={styles.assignmentCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.titleRow}>
                                        <h2 className={styles.assignmentTitle}>{assignment.title}</h2>
                                        <span className={`${styles.badge} ${getStatusStyles(assignment.status)}`}>
                                            {getStatusIcon(assignment.status)}
                                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                        </span>
                                    </div>
                                    <p className={styles.topicName}>{assignment.topic}</p>
                                </div>

                                <div className={styles.cardInfo}>
                                    <div className={styles.infoRow}>
                                        <Calendar size={16} className={styles.infoIcon} />
                                        <span className={styles.infoText}>Due: {assignment.dueDate}</span>
                                    </div>
                                    {assignment.status === 'graded' && assignment.marks !== null && (
                                        <div className={styles.infoRow}>
                                            <CheckCircle size={16} className={styles.successIcon} />
                                            <span className={styles.scoreText}>Score: {assignment.marks}/100</span>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                                >
                                    View Details
                                </Button>
                            </Card>
                        ))}
                        {assignments.length === 0 && (
                            <div className={styles.emptyState}>
                                <p className={styles.stateText}>No assignments pending at the moment.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
