import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Target, Clock, BrainCircuit, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './MockInterviewStart.module.css';

const MockInterviewStart = () => {
    return (
        <MainLayout>
            <div className={styles.container}>

                {/* SECTION 1: Header */}
                <section className={styles.header}>
                    <h1 className={styles.title}>AI Mock Interview</h1>
                    <p className={styles.subtitle}>
                        Simulate real interview scenarios powered by AI.
                    </p>
                </section>

                {/* SECTION 2: Interview Setup Card */}
                <section>
                    <Card variant="glass" className={styles.setupCard}>
                        <h2 className={styles.sectionTitle}>Interview Setup</h2>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Target Role</label>
                                <select className={styles.select}>
                                    <option>Frontend Developer</option>
                                    <option>Backend Developer</option>
                                    <option>Full Stack Developer</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Difficulty</label>
                                <select className={styles.select}>
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Interview Type</label>
                            <div className={styles.radioGrid}>
                                {['Technical', 'Behavioral', 'HR', 'Mixed'].map((type) => (
                                    <label key={type} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="interviewType"
                                            value={type}
                                            className={styles.radioInput}
                                            defaultChecked={type === 'Technical'}
                                        />
                                        <span className={styles.radioText}>{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.actionRow}>
                            <div className={styles.durationBadge}>
                                <Clock className={styles.startIcon} size={20} />
                                <span>Estimated Duration: <strong>45 minutes</strong></span>
                            </div>
                            <Button variant="primary" size="lg" className={styles.startBtn} leftIcon={<Target size={20} />}>
                                Start Interview
                            </Button>
                        </div>
                    </Card>
                </section>

                {/* SECTION 3: Previous Interview Summary */}
                <section className={styles.summarySection}>
                    <h2 className={styles.sectionTitle}>Previous Interview Summary</h2>
                    <div className={styles.metricsGrid}>
                        <Card variant="glass" className={styles.metricCard}>
                            <span className={styles.metricLabel}>Last Score</span>
                            <span className={styles.metricValueLarge}>85/100</span>
                        </Card>
                        <Card variant="glass" className={styles.metricCard}>
                            <BrainCircuit className={styles.iconTech} size={24} />
                            <div className={styles.formGroup} style={{ gap: '4px' }}>
                                <span className={styles.metricLabel}>Tech Depth</span>
                                <span className={styles.metricValue}>Good</span>
                            </div>
                        </Card>
                        <Card variant="glass" className={styles.metricCard}>
                            <MessageSquare className={styles.iconComm} size={24} />
                            <div className={styles.formGroup} style={{ gap: '4px' }}>
                                <span className={styles.metricLabel}>Communication</span>
                                <span className={styles.metricValue}>Excellent</span>
                            </div>
                        </Card>
                        <Card variant="glass" className={styles.metricCard}>
                            <AlertCircle className={styles.iconConf} size={24} />
                            <div className={styles.formGroup} style={{ gap: '4px' }}>
                                <span className={styles.metricLabel}>Confidence</span>
                                <span className={styles.metricValueWarning}>Needs Work</span>
                            </div>
                        </Card>
                        <Card variant="glass" className={`${styles.metricCard} ${styles.metricCardReadiness}`}>
                            <span className={styles.metricLabelReadiness}>Readiness</span>
                            <span className={styles.metricValueReadiness}>78%</span>
                        </Card>
                    </div>
                </section>

                {/* SECTION 4: Preparation Tips */}
                <section>
                    <Card variant="glass">
                        <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>
                            <CheckCircle className={styles.iconTips} size={24} />
                            Preparation Tips
                        </h2>
                        <div className={styles.tipsGrid}>
                            <div className={styles.tipItem}>
                                <div className={styles.tipNumber}>1</div>
                                <p className={styles.tipText}>Ensure your microphone and camera are working properly before starting the interview.</p>
                            </div>
                            <div className={styles.tipItem}>
                                <div className={styles.tipNumber}>2</div>
                                <p className={styles.tipText}>Find a quiet place to minimize background noise and environmental distractions.</p>
                            </div>
                            <div className={styles.tipItem}>
                                <div className={styles.tipNumber}>3</div>
                                <p className={styles.tipText}>Treat this as a real interview. Structure your answers using the STAR method.</p>
                            </div>
                        </div>
                    </Card>
                </section>

            </div>
        </MainLayout>
    );
};

export default MockInterviewStart;
