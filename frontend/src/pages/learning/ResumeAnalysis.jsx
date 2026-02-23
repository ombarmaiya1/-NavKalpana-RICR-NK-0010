import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Trash2, ShieldCheck, Target, Zap, Activity, Layers, FileSearch, ArrowRight, BookOpen } from 'lucide-react';
import styles from './ResumeAnalysis.module.css';

export default function ResumeAnalysis() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [role, setRole] = useState('Full Stack Developer');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setAnalysisResult(null);
            setError('');
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setAnalysisResult(null);
        setError('');
    };

    const handleAnalyze = async () => {
        if (!file || !role) return;
        setIsAnalyzing(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('role', role);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/resume/analyze', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type, browser will set it with boundary
                },
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                setAnalysisResult(result.data);
            } else {
                setError(result.message || 'Analysis failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <MainLayout pageTitle="Resume Analysis">
            <div className={styles.container}>

                {/* SECTION 1: Page Header */}
                <Card className={styles.header}>
                    <h1 className={styles.title}>Resume Intelligence</h1>
                    <p className={styles.subtitle}>Upload your resume to extract topics and generate adaptive technical quizzes.</p>
                </Card>

                <div className={styles.grid}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* SECTION 2: Upload Resume */}
                        <Card>
                            <h2 className={styles.sectionTitle}><UploadCloud size={20} className="text-brand" /> Analysis Setup</h2>

                            <div className={styles.field} style={{ marginBottom: '1.5rem' }}>
                                <label className={styles.label}>Target Role</label>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. Backend Developer"
                                />
                            </div>

                            <div className={styles.uploadArea}>
                                <label className={styles.fileLabel}>
                                    <div className={styles.uploadIcon}>
                                        <FileText size={32} />
                                    </div>
                                    <span className={styles.uploadText}>{file ? file.name : 'Click or drag to upload resume'}</span>
                                    <span className={styles.uploadSubtext}>Supported formats: PDF (Max 5MB)</span>
                                    <input
                                        type="file"
                                        className={styles.fileInput}
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            {file && (
                                <div className={styles.selectedFile}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <FileText size={18} className="text-secondary" />
                                        <span className={styles.fileName}>{file.name}</span>
                                    </div>
                                    <button
                                        onClick={handleRemoveFile}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
                                        title="Remove file"
                                    >
                                        <Trash2 size={18} className="text-danger" />
                                    </button>
                                </div>
                            )}

                            {error && <p className={styles.errorText} style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</p>}

                            <div style={{ marginTop: 'var(--space-6)' }}>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    disabled={!file || !role || isAnalyzing}
                                    onClick={handleAnalyze}
                                    leftIcon={isAnalyzing ? <Activity className="spin" size={18} /> : <Zap size={18} />}
                                >
                                    {isAnalyzing ? "AI is Analyzing..." : "Extract Topics & Analyze"}
                                </Button>
                            </div>
                        </Card>

                        {/* Analysis Insights - visible after analysis */}
                        {analysisResult && (
                            <>
                                <Card>
                                    <h2 className={styles.sectionTitle}><Target size={20} className="text-warning" /> Improvement Tips</h2>
                                    <ul className={styles.list}>
                                        {analysisResult.recommendations.map((imp, idx) => (
                                            <li key={idx} className={styles.listItem}>
                                                <AlertCircle size={18} className={styles.listIconWarning} />
                                                <span>{imp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>

                                <Card>
                                    <h2 className={styles.sectionTitle}><Layers size={20} className="text-accent" /> Missing Critical Skills</h2>
                                    <div className={styles.tags}>
                                        {analysisResult.missing_skills.map((skill, idx) => (
                                            <span key={idx} className={styles.tag} style={{ background: 'rgba(var(--danger-rgb), 0.1)', color: 'var(--danger)' }}>{skill}</span>
                                        ))}
                                    </div>
                                </Card>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {analysisResult ? (
                            <>
                                {/* SECTION 6: Resume Strength */}
                                <Card>
                                    <div className={styles.scoreCard}>
                                        <div className={styles.scoreCircle}>
                                            <span className={styles.scoreValue}>{analysisResult.resume_strength}</span>
                                        </div>
                                        <div className={styles.scoreLabel}>ATS Strength Score</div>
                                        <p className={styles.scoreMessage} style={{ marginTop: 'var(--space-4)' }}>
                                            Your resume has a strength score of {analysisResult.resume_strength}%. Focus on the missing skills to improve your match.
                                        </p>
                                    </div>
                                </Card>

                                {/* SECTION 3: Extracted Topics for Quiz */}
                                <Card>
                                    <div className={styles.quizUnlockCard}>
                                        <h2 className={styles.sectionTitle}><BookOpen size={20} className="text-primary" /> Quiz Topics Unlocked</h2>
                                        <p className={styles.quizDescription}>We've extracted the following topics from your experience. You can now take adaptive quizzes on these.</p>

                                        <div className={styles.tags} style={{ margin: '1.5rem 0' }}>
                                            {analysisResult.extracted_topics.map((topic, idx) => (
                                                <span key={idx} className={styles.tag}>{topic}</span>
                                            ))}
                                        </div>

                                        <Button
                                            variant="primary"
                                            fullWidth
                                            onClick={() => navigate('/quiz-setup')}
                                            rightIcon={<ArrowRight size={18} />}
                                        >
                                            Take a Quiz Now
                                        </Button>
                                    </div>
                                </Card>
                            </>
                        ) : (
                            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <FileSearch size={64} style={{ opacity: 0.3, marginBottom: 'var(--space-4)' }} />
                                    <h3>Ready for Analysis</h3>
                                    <p>Upload your resume to reveal insights<br />and unlock personalized quizzes.</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <style>
                {`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    .spin { animation: spin 2s linear infinite; }
                `}
            </style>
        </MainLayout>
    );
}
