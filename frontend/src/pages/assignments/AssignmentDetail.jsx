import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { AlertCircle, Loader2, CheckCircle, Clock, Link as LinkIcon, Upload } from 'lucide-react';
import styles from './AssignmentDetail.module.css';
import assignmentService from '../../services/assignmentService';

export default function AssignmentDetail() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [submissionLink, setSubmissionLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const fetchAssignmentData = async () => {
            try {
                const result = await assignmentService.getAssignment(assignmentId);
                if (result.success) {
                    setAssignment(result.data);
                } else {
                    setError(result.message || 'Failed to fetch assignment details');
                }
            } catch (err) {
                console.error('Error fetching assignment detail:', err);
                setError('An error occurred while loading assignment details.');
            } finally {
                setLoading(false);
            }
        };

        if (assignmentId) {
            fetchAssignmentData();
        }
    }, [assignmentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic URL validation
        let url;
        try {
            url = new URL(submissionLink);
        } catch (_) {
            setSubmitError('Please enter a valid URL.');
            return;
        }

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            setSubmitError('URL must start with http:// or https://');
            return;
        }

        setSubmitError('');
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('assignment_id', assignmentId);
            formData.append('github_link', submissionLink);

            const result = await assignmentService.submitAssignment(assignmentId, formData);

            if (result.success) {
                setToastMessage('Assignment submitted and evaluated!');
                setTimeout(() => setToastMessage(''), 3000);
                setAssignment(prev => ({
                    ...prev,
                    status: 'graded',
                    score: result.data?.score,
                    submission: submissionLink
                }));
            } else {
                setSubmitError(result.message || 'Submission failed');
            }
        } catch (err) {
            setSubmitError(err.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

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

    return (
        <MainLayout pageTitle={assignment ? assignment.title : 'Assignment Details'}>
            <div className={styles.container}>

                {/* Toast Notification */}
                {toastMessage && (
                    <div className={styles.toast}>
                        <CheckCircle size={18} />
                        {toastMessage}
                    </div>
                )}

                {loading ? (
                    <div className={styles.centerState}>
                        <Loader2 className={styles.spinner} size={48} />
                        <p className={styles.stateText}>Loading assignment details...</p>
                    </div>
                ) : error ? (
                    <div className={styles.centerState}>
                        <AlertCircle className={styles.errorIcon} size={48} />
                        <p className={styles.errorText}>{error}</p>
                        <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                ) : assignment ? (
                    <>
                        {/* Section 1: Assignment Info */}
                        <Card variant="default">
                            <div className={styles.header}>
                                <div className={styles.titleRow}>
                                    <h1 className={styles.title}>{assignment.title}</h1>
                                    <span className={`${styles.badge} ${getStatusStyles(assignment.status)}`}>
                                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                    </span>
                                </div>
                                <p className={styles.subtitle}>{assignment.topic}</p>
                            </div>

                            <div className={styles.metaInfo}>
                                <div className={styles.metaItem}>
                                    <span className={styles.difficultyBadge}>{assignment.difficulty}</span>
                                </div>
                                {assignment.status === 'graded' && (
                                    <div className={styles.metaItemScore}>
                                        <CheckCircle size={18} className={styles.metaIconSuccess} />
                                        <span>Score: {Math.round(assignment.score)}/100</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.contentSection}>
                                <h3 className={styles.sectionTitle}>Description</h3>
                                <p className={styles.contentText}>{assignment.description}</p>

                                <h3 className={styles.sectionTitle}>Instructions</h3>
                                <div className={styles.instructionsBox}>
                                    <p className={styles.contentText}>{assignment.instructions}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Section 2: Submission Section */}
                        <Card variant="default">
                            <div className={styles.submissionHeader}>
                                <h2 className={styles.submissionTitle}>Your Submission</h2>
                            </div>

                            {assignment.status === 'pending' ? (
                                <form className={styles.submissionForm} onSubmit={handleSubmit}>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="submissionLink">GitHub Repository Link</label>
                                        <div className={styles.inputWrap}>
                                            <LinkIcon className={styles.inputIcon} size={18} />
                                            <input
                                                id="submissionLink"
                                                type="url"
                                                className={styles.input}
                                                placeholder="https://github.com/username/repo"
                                                value={submissionLink}
                                                onChange={e => setSubmissionLink(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {submitError && <p className={styles.errorMsg}>{submitError}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={submitting}
                                        disabled={!submissionLink.trim()}
                                        leftIcon={<Upload size={18} />}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Assignment'}
                                    </Button>
                                </form>
                            ) : (
                                <div className={styles.submittedState}>
                                    <div className={styles.submittedLinkBox}>
                                        <LinkIcon size={18} className={styles.linkIcon} />
                                        <a
                                            href={assignment.submission}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.submittedLink}
                                        >
                                            {assignment.submission || 'Link successfully submitted'}
                                        </a>
                                    </div>

                                    {assignment.status === 'submitted' && (
                                        <div className={styles.statusMessageInfo}>
                                            <Clock size={18} />
                                            <p>Your assignment has been submitted and is awaiting grading.</p>
                                        </div>
                                    )}

                                    {assignment.status === 'graded' && (
                                        <div className={styles.statusMessageSuccess}>
                                            <CheckCircle size={18} />
                                            <p>This assignment has been graded. Score: {assignment.marks}/100.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </>
                ) : null}

            </div>
        </MainLayout>
    );
}
