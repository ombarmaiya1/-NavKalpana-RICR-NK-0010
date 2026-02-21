import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
    Brain,
    FileText,
    BarChart3,
    Zap,
    CheckCircle,
    ArrowRight,
    UserPlus,
    MessageSquareCode,
    Star,
} from 'lucide-react';
import styles from './Landing.module.css';

/* ─── Static data ──────────────────────────────────────────────── */
const FEATURES = [
    {
        icon: <Brain size={28} />,
        title: 'AI-Powered Interviews',
        desc: 'Real-world questions tailored to your target role and skill level, powered by advanced AI.',
    },
    {
        icon: <FileText size={28} />,
        title: 'Resume Analysis',
        desc: 'Get instant feedback on your resume. Understand gaps and improve your score before applying.',
    },
    {
        icon: <BarChart3 size={28} />,
        title: 'Performance Reports',
        desc: 'Detailed reports after every session showing technical depth, communication, and confidence.',
    },
];

const STEPS = [
    {
        step: '01',
        icon: <UserPlus size={22} />,
        title: 'Sign Up',
        desc: 'Create a free account in seconds. No credit card required to get started.',
    },
    {
        step: '02',
        icon: <MessageSquareCode size={22} />,
        title: 'Practice Interviews',
        desc: 'Choose your interview type, difficulty, and duration. Answer questions in real-time.',
    },
    {
        step: '03',
        icon: <Star size={22} />,
        title: 'Get AI Feedback',
        desc: 'Receive a detailed performance breakdown and know exactly where to improve.',
    },
];

const HERO_BULLETS = [
    { icon: <Zap size={16} />, label: 'AI Mock Interviews' },
    { icon: <CheckCircle size={16} />, label: 'Instant Feedback' },
    { icon: <FileText size={16} />, label: 'Resume Analysis' },
    { icon: <BarChart3 size={16} />, label: 'Performance Tracking' },
];

/* ─── Component ─────────────────────────────────────────────────── */
export default function Landing() {
    return (
        <div className={styles.page}>

            {/* ── Minimal top bar ─────────────────────────────────── */}
            <header className={styles.topbar}>
                <span className={styles.topbarBrand}>NavKalpana</span>
                <nav className={styles.topbarNav}>
                    <Link to="/login" className={styles.topbarLink}>Login</Link>
                    <Link to="/signup">
                        <Button variant="primary" size="sm">Get Started</Button>
                    </Link>
                </nav>
            </header>

            <main className={styles.main}>

                {/* ── SECTION 1: Hero ───────────────────────────────── */}
                <section className={styles.heroSection}>
                    <div className={styles.heroGrid}>

                        {/* Left */}
                        <div className={styles.heroLeft}>
                            <span className={styles.badge}>
                                <Zap size={13} /> AI-Powered Platform
                            </span>
                            <h1 className={styles.heroTitle}>
                                Ace Your Interviews<br />with AI
                            </h1>
                            <p className={styles.heroSubtitle}>
                                Practice real-world interviews powered by artificial intelligence.
                                Get personalised feedback, track progress, and land the job.
                            </p>
                            <div className={styles.heroBtns}>
                                <Link to="/signup">
                                    <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="secondary" size="lg">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right — feature preview card */}
                        <div className={styles.heroRight}>
                            <Card variant="glass" hoverable>
                                <h3 className={styles.featureCardTitle}>What you get</h3>
                                <ul className={styles.bulletList}>
                                    {HERO_BULLETS.map(b => (
                                        <li key={b.label} className={styles.bulletItem}>
                                            <span className={styles.bulletIcon}>{b.icon}</span>
                                            {b.label}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>

                    </div>
                </section>

                {/* ── SECTION 2: Features ───────────────────────────── */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Why Choose Our Platform?</h2>
                        <p className={styles.sectionSubtitle}>
                            Everything you need to prepare thoroughly and interview confidently.
                        </p>
                    </div>
                    <div className={styles.grid3}>
                        {FEATURES.map(f => (
                            <Card key={f.title} variant="glass" hoverable>
                                <div className={styles.featureIcon}>{f.icon}</div>
                                <h3 className={styles.featureTitle}>{f.title}</h3>
                                <p className={styles.featureDesc}>{f.desc}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* ── SECTION 3: How it works ───────────────────────── */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>How It Works</h2>
                        <p className={styles.sectionSubtitle}>
                            Go from sign-up to interview-ready in three simple steps.
                        </p>
                    </div>
                    <div className={styles.grid3}>
                        {STEPS.map(s => (
                            <Card key={s.step} variant="bordered" hoverable>
                                <div className={styles.stepRow}>
                                    <span className={styles.stepNumber}>{s.step}</span>
                                    <span className={styles.stepIcon}>{s.icon}</span>
                                </div>
                                <h3 className={styles.featureTitle}>{s.title}</h3>
                                <p className={styles.featureDesc}>{s.desc}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* ── SECTION 4: CTA ────────────────────────────────── */}
                <section className={styles.ctaSection}>
                    <Card variant="glass">
                        <div className={styles.ctaInner}>
                            <h2 className={styles.ctaTitle}>Ready to Level Up?</h2>
                            <p className={styles.ctaSubtitle}>
                                Join thousands of students who improved their interview skills with NavKalpana.
                            </p>
                            <Link to="/signup">
                                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                                    Start Now — It&apos;s Free
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </section>

            </main>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className={styles.footer}>
                <span>© 2025 NavKalpana. All rights reserved.</span>
            </footer>

        </div>
    );
}
