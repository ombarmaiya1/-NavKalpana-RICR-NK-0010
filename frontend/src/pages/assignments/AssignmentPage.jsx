import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { AlertCircle, Loader2, CheckCircle, Clock, Plus, BookOpen } from 'lucide-react';
import styles from './AssignmentPage.module.css';
import assignmentService from '../../services/assignmentService';
import { saveToStorage, getFromStorage, removeFromStorage } from '../../utils/storage';

export default function AssignmentPage() {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [options, setOptions] = useState({ skill_projects: [] });
    const [generating, setGenerating] = useState(false);
    const [generateTopic, setGenerateTopic] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        // Load cached data immediately
        const cachedList = getFromStorage('assignment_list');
        const cachedOpts = getFromStorage('assignment_options');
        if (cachedList) { setAssignments(cachedList); setLoading(false); }
        if (cachedOpts) { setOptions(cachedOpts); }
        try {
            const [listRes, optionsRes] = await Promise.all([
                assignmentService.listAssignments(),
                assignmentService.getOptions()
            ]);
            if (listRes.success) {
                setAssignments(listRes.data || []);
                saveToStorage('assignment_list', listRes.data || []);
            }
            if (optionsRes.success) {
                setOptions(optionsRes.data);
                saveToStorage('assignment_options', optionsRes.data);
            }
        } catch (err) {
            if (!cachedList) setError('Failed to load assignments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleGenerate = async (topic) => {
        setGenerating(true);
        try {
            const result = await assignmentService.generateAssignment(topic);
            if (result.success) {
                await fetchAll();
            } else {
                alert(result.message || 'Failed to generate assignment');
            }
        } catch (err) {
            alert('Failed to generate assignment. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'graded') return styles.badgeSuccess;
        if (status === 'submitted') return styles.badgeInfo;
        return styles.badgeNeutral;
    };

    const getStatusIcon = (status) => {
        if (status === 'graded') return <CheckCircle size={14} />;
        if (status === 'submitted') return <Clock size={14} />;
        return <AlertCircle size={14} />;
    };

    return (
        <MainLayout pageTitle="Assignments">
            <div className={styles.container}>

                {/* Header */}
                <Card variant="default">
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Your Assignments</h1>
                            <p className={styles.subtitle}>Generate and complete practical assignments</p>
                        </div>
                    </div>
                </Card>

                {/* Generate New Assignment */}
                {options.skill_projects && options.skill_projects.length > 0 && (
                    <Card variant="default">
                        <h2 className={styles.sectionTitle}>Generate a New Assignment</h2>
                        <div className={styles.generateRow}>
                            <select
                                className={styles.topicSelect}
                                value={generateTopic}
                                onChange={e => setGenerateTopic(e.target.value)}
                            >
                                <option value="">-- Select a topic --</option>
                                {options.skill_projects.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <Button
                                variant="primary"
                                onClick={() => handleGenerate(generateTopic)}
                                disabled={!generateTopic || generating}
                                leftIcon={<Plus size={16} />}
                            >
                                {generating ? 'Generating...' : 'Generate Assignment'}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Assignment List */}
                {loading ? (
                    <div className={styles.centerState}>
                        <Loader2 className={styles.spinner} size={48} />
                        <p className={styles.stateText}>Loading your assignments...</p>
                    </div>
                ) : error ? (
                    <div className={styles.centerState}>
                        <AlertCircle className={styles.errorIcon} size={48} />
                        <p className={styles.errorText}>{error}</p>
                        <Button variant="secondary" onClick={fetchAll}>Retry</Button>
                    </div>
                ) : (
                    <div className={styles.assignmentGrid}>
                        {assignments.length === 0 ? (
                            <div className={styles.emptyState}>
                                <BookOpen size={48} className={styles.emptyIcon} />
                                <p className={styles.stateText}>No assignments yet. Generate one above!</p>
                            </div>
                        ) : assignments.map(assignment => (
                            <Card key={assignment.id} hoverable className={styles.assignmentCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.titleRow}>
                                        <h2 className={styles.assignmentTitle}>{assignment.title}</h2>
                                        <span className={`${styles.badge} ${getStatusStyle(assignment.status)}`}>
                                            {getStatusIcon(assignment.status)}
                                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                        </span>
                                    </div>
                                    <p className={styles.topicName}>{assignment.topic}</p>
                                    {assignment.difficulty && (
                                        <span className={styles.difficulty}>{assignment.difficulty}</span>
                                    )}
                                </div>
                                {assignment.status === 'graded' && assignment.score !== null && (
                                    <div className={styles.scoreRow}>
                                        <CheckCircle size={16} className={styles.successIcon} />
                                        <span className={styles.scoreText}>Score: {Math.round(assignment.score)}/100</span>
                                    </div>
                                )}
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                                >
                                    View Details
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
