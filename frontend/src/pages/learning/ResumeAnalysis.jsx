import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Trash2, ShieldCheck, Target, Zap, Activity } from 'lucide-react';
import styles from './ResumeAnalysis.module.css';

export default function ResumeAnalysis() {
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setAnalysisResult(null); // Reset previous results on new upload
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setAnalysisResult(null);
    };

    const handleAnalyze = () => {
        if (!file) return;
        setIsAnalyzing(true);

        // Mock analysis delay
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisResult({
                candidateName: "John Doe",
                role: "Software Engineer",
                experience: "Mid-Level",
                score: 82,
                scoreMessage: "Strong foundation, needs more backend projects.",
                skills: ["React", "Node.js", "Python", "SQL", "Docker", "AWS"],
                strengths: [
                    "Clear and concise summary section",
                    "Strong metrics used in experience bullet points",
                    "Relevant modern tech stack highlighted"
                ],
                improvements: [
                    "Add consistent action verbs to begin every bullet point",
                    "Include a link to your GitHub profile or portfolio",
                    "Reduce overall length to a single page"
                ]
            });
        }, 1500);
    };

    return (
        <MainLayout pageTitle="Resume Analysis">
            <div className={styles.container}>

                {/* SECTION 1: Page Header */}
                <Card className={styles.header}>
                    <h1 className={styles.title}>Resume Analysis</h1>
                    <p className={styles.subtitle}>Upload your resume and get AI-powered feedback instantly</p>
                </Card>

                <div className={styles.grid}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* SECTION 2: Upload Resume */}
                        <Card>
                            <h2 className={styles.sectionTitle}><UploadCloud size={20} className="text-brand" /> Upload Resume</h2>

                            <div className={styles.uploadArea}>
                                <label className={styles.fileLabel}>
                                    <div className={styles.uploadIcon}>
                                        <FileText size={32} />
                                    </div>
                                    <span className={styles.uploadText}>Click or drag to upload</span>
                                    <span className={styles.uploadSubtext}>Supported formats: PDF, DOCX (Max 5MB)</span>
                                    <input
                                        type="file"
                                        className={styles.fileInput}
                                        accept=".pdf,.doc,.docx"
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

                            <div style={{ marginTop: 'var(--space-6)' }}>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    disabled={!file || isAnalyzing}
                                    onClick={handleAnalyze}
                                    leftIcon={isAnalyzing ? <Activity className="spin" size={18} /> : <Zap size={18} />}
                                >
                                    {isAnalyzing ? "Analyzing Resume..." : "Analyze Resume"}
                                </Button>
                            </div>
                        </Card>

                        {/* SECTION 4 & 5 container - visible after analysis */}
                        {analysisResult && (
                            <>
                                {/* SECTION 4: Strengths */}
                                <Card>
                                    <h2 className={styles.sectionTitle}><ShieldCheck size={20} className="text-success" /> Key Strengths</h2>
                                    <ul className={styles.list}>
                                        {analysisResult.strengths.map((str, idx) => (
                                            <li key={idx} className={styles.listItem}>
                                                <CheckCircle size={18} className={styles.listIconSuccess} />
                                                <span>{str}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>

                                {/* SECTION 5: Improvements */}
                                <Card>
                                    <h2 className={styles.sectionTitle}><Target size={20} className="text-warning" /> Areas for Improvement</h2>
                                    <ul className={styles.list}>
                                        {analysisResult.improvements.map((imp, idx) => (
                                            <li key={idx} className={styles.listItem}>
                                                <AlertCircle size={18} className={styles.listIconWarning} />
                                                <span>{imp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {analysisResult ? (
                            <>
                                {/* SECTION 6: Resume Score */}
                                <Card>
                                    <div className={styles.scoreCard}>
                                        <div className={styles.scoreCircle}>
                                            <span className={styles.scoreValue}>{analysisResult.score}</span>
                                        </div>
                                        <div className={styles.scoreLabel}>Overall Score / 100</div>
                                        <p className={styles.scoreMessage} style={{ marginTop: 'var(--space-4)' }}>
                                            "{analysisResult.scoreMessage}"
                                        </p>
                                    </div>
                                </Card>

                                {/* SECTION 3: Resume Summary */}
                                <Card>
                                    <h2 className={styles.sectionTitle}><FileText size={20} className="text-accent" /> Extraction Summary</h2>

                                    <div className={styles.summaryRow}>
                                        <span className={styles.summaryLabel}>Detected Role</span>
                                        <span className={styles.summaryValue}>{analysisResult.role}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span className={styles.summaryLabel}>Experience</span>
                                        <span className={styles.summaryValue}>{analysisResult.experience}</span>
                                    </div>

                                    <div style={{ marginTop: 'var(--space-4)' }}>
                                        <span className={styles.summaryLabel}>Extracted Skills</span>
                                        <div className={styles.tags}>
                                            {analysisResult.skills.map((skill, idx) => (
                                                <span key={idx} className={styles.tag}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </>
                        ) : (
                            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <FileText size={48} style={{ opacity: 0.5, marginBottom: 'var(--space-4)' }} />
                                    <p>Upload a resume to see<br />analysis results here.</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            {/* Quick spinner animation logic added inline for simplicity since it's only one icon */}
            <style>
                {`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    .spin { animation: spin 2s linear infinite; }
                `}
            </style>
        </MainLayout>
    );
}
