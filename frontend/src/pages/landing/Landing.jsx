import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
    Sun, Moon, Zap, CheckCircle, XCircle,
    ArrowRight, BrainCircuit, FileText, BarChart3,
    UserPlus, MessageSquareCode, Star,
    Twitter, Github, Linkedin,
} from 'lucide-react';
import styles from './Landing.module.css';

/* ─── Static data ──────────────────────────────────────────────── */
const PROBLEMS = [
    'Blank-mind anxiety before FAANG rounds',
    'No structured feedback after mock sessions',
    'Spending hours on resume with zero improvement',
    'Practicing alone with no sense of progress',
];

const SOLUTIONS = [
    'AI adapts questions to your weak spots in real-time',
    'Instant, detailed breakdown after every answer',
    'Resume scored and improved against real JD patterns',
    'Progress dashboard highlights growth every session',
];

const STEPS = [
    { n: '1', icon: <UserPlus size={24} />, title: 'Create an Account', desc: 'Sign up free in under 30 seconds. No card required.' },
    { n: '2', icon: <MessageSquareCode size={24} />, title: 'Practice Interviews', desc: 'Pick role, difficulty, and duration. AI fires real questions.' },
    { n: '3', icon: <Star size={24} />, title: 'Get AI Feedback', desc: 'Receive a scored report on depth, communication, and confidence.' },
];

const TESTIMONIALS = [
    { name: 'Aarav Mehta', role: 'SDE @ Google', stars: 5, quote: 'NavKalpana helped me crack my FAANG dream after three failed attempts. The feedback was shockingly accurate.' },
    { name: 'Priya Sharma', role: 'Backend Eng @ Razorpay', stars: 5, quote: 'The resume scanner flagged exactly what recruiters were struggling with. Got shortlisted within a week.' },
    { name: 'Omar Siddiqui', role: 'CS Final Year', stars: 4, quote: 'Honestly the best mock interview tool I\'ve found. The system design questions are top-notch.' },
    { name: 'Shriya Patel', role: 'Product @ Swiggy', stars: 5, quote: 'Dark mode interviews at 2 AM have become my study ritual. 10/10 experience.' },
    { name: 'Rahul Gupta', role: 'SWE @ Microsoft', stars: 5, quote: 'I was scared of system design rounds. 3 weeks with NavKalpana and I cleared my Microsoft loop.' },
    { name: 'Nisha Reddy', role: 'ML Eng @ Flipkart', stars: 4, quote: 'The performance tracking keeps me accountable. Love seeing that readiness score climb every day.' },
];

const FEATURES = [
    { icon: <BrainCircuit size={28} />, title: 'AI Mock Interviews', desc: 'Dynamic questions tailored to your role and seniority. Harder as you improve.' },
    { icon: <FileText size={28} />, title: 'Resume Analysis', desc: 'AI scores your resume against real JD patterns and tells you exactly what to fix.' },
    { icon: <BarChart3 size={28} />, title: 'Performance Reports', desc: 'Session-by-session breakdown of technical depth, communication, and confidence.' },
];

function Stars({ count }) {
    return (
        <div className={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < count ? styles.starFilled : styles.starEmpty} />
            ))}
        </div>
    );
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function Landing() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={styles.page}>

            {/* ══════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════ */}
            <header className={styles.navbar}>
                <div className={styles.navInner}>
                    <span className={styles.brand}>NavKalpana</span>

                    <nav className={styles.navLinks}>
                        <a href="#features" className={styles.navLink}>Features</a>
                        <a href="#how" className={styles.navLink}>How It Works</a>
                        <a href="#testimonials" className={styles.navLink}>Reviews</a>
                    </nav>

                    <div className={styles.navRight}>
                        <button
                            className={styles.themeToggle}
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link to="/login" className={styles.navLinkPlain}>Login</Link>
                        <Link to="/signup" className={styles.ctaBtn}>Get Started <ArrowRight size={15} /></Link>
                    </div>
                </div>
            </header>

            <main>

                {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
                <section className={styles.hero}>
                    <div className={styles.heroInner}>
                        {/* Left */}
                        <div className={styles.heroLeft}>
                            <span className={styles.badge}><Zap size={13} /> AI-Powered Career Platform</span>
                            <h1 className={styles.heroTitle}>
                                Build Career Confidence<br />
                                <span className={styles.heroAccent}>with AI.</span>
                            </h1>
                            <p className={styles.heroSubtitle}>
                                Practice real-world interviews, get instant detailed feedback, and land the role you deserve — powered by artificial intelligence.
                            </p>
                            <div className={styles.heroBtns}>
                                <Link to="/signup" className={styles.heroPrimary}>
                                    Get Started Free <ArrowRight size={17} />
                                </Link>
                                <Link to="/login" className={styles.heroSecondary}>
                                    Sign In
                                </Link>
                            </div>
                            <p className={styles.heroNote}>No credit card required · Free plan available</p>
                        </div>

                        {/* Right — Dashboard mockup card */}
                        <div className={styles.heroRight}>
                            <div className={styles.dashCard}>
                                <div className={styles.dashHeader}>
                                    <span className={styles.dashDot} style={{ background: '#ef4444' }} />
                                    <span className={styles.dashDot} style={{ background: '#f59e0b' }} />
                                    <span className={styles.dashDot} style={{ background: '#22c55e' }} />
                                    <span className={styles.dashTitle}>Live Mock Session</span>
                                </div>
                                <div className={styles.dashBody}>
                                    <p className={styles.dashQuestion}>
                                        "Design a distributed rate limiter that handles 10M requests/min across 50 regions."
                                    </p>
                                    <div className={styles.dashMeta}>
                                        <span className={styles.dashPill}>System Design</span>
                                        <span className={styles.dashPill}>Hard</span>
                                        <span className={`${styles.dashPill} ${styles.dashPillGreen}`}>⏱ 22:14</span>
                                    </div>
                                    <div className={styles.dashScores}>
                                        {[['Technical Depth', 82], ['Communication', 91], ['Confidence', 74]].map(([label, val]) => (
                                            <div key={label} className={styles.dashScore}>
                                                <div className={styles.dashScoreRow}>
                                                    <span className={styles.dashScoreLabel}>{label}</span>
                                                    <span className={styles.dashScoreVal}>{val}%</span>
                                                </div>
                                                <div className={styles.dashBar}>
                                                    <div className={styles.dashBarFill} style={{ width: `${val}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════════════ */}
                <section id="features" className={styles.section}>
                    <div className={styles.sectionWrap}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Why NavKalpana?</h2>
                            <p className={styles.sectionSub}>Everything you need to prepare thoroughly and interview with confidence.</p>
                        </div>
                        <div className={styles.grid3}>
                            {FEATURES.map(f => (
                                <div key={f.title} className={styles.featureCard}>
                                    <div className={styles.featureIcon}>{f.icon}</div>
                                    <h3 className={styles.featureTitle}>{f.title}</h3>
                                    <p className={styles.featureDesc}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
            PAIN / SOLUTION COMPARISON
        ══════════════════════════════════════════════════ */}
                <section className={styles.section}>
                    <div className={styles.sectionWrap}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Old Way vs. NavKalpana</h2>
                            <p className={styles.sectionSub}>Stop grinding in circles. Start improving with purpose.</p>
                        </div>
                        <div className={styles.compGrid}>
                            {/* Problems */}
                            <div className={styles.compCard}>
                                <div className={`${styles.compHeader} ${styles.compHeaderBad}`}>
                                    <XCircle size={20} /> Without NavKalpana
                                </div>
                                <ul className={styles.compList}>
                                    {PROBLEMS.map(p => (
                                        <li key={p} className={`${styles.compItem} ${styles.compItemBad}`}>
                                            <XCircle size={16} className={styles.compItemIcon} /> {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Solutions */}
                            <div className={styles.compCard}>
                                <div className={`${styles.compHeader} ${styles.compHeaderGood}`}>
                                    <CheckCircle size={20} /> With NavKalpana
                                </div>
                                <ul className={styles.compList}>
                                    {SOLUTIONS.map(s => (
                                        <li key={s} className={`${styles.compItem} ${styles.compItemGood}`}>
                                            <CheckCircle size={16} className={styles.compItemIcon} /> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════ */}
                <section id="how" className={styles.section}>
                    <div className={styles.sectionWrap}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>How It Works</h2>
                            <p className={styles.sectionSub}>From sign-up to interview-ready in three steps.</p>
                        </div>
                        <div className={styles.stepsRow}>
                            {STEPS.map((s, i) => [
                                <div key={s.n} className={styles.stepCard}>
                                    <div className={styles.stepNum}>{s.n}</div>
                                    <div className={styles.stepIcon}>{s.icon}</div>
                                    <h3 className={styles.stepTitle}>{s.title}</h3>
                                    <p className={styles.stepDesc}>{s.desc}</p>
                                </div>,
                                i < STEPS.length - 1 && (
                                    <div key={`line-${i}`} className={styles.stepLine} />
                                ),
                            ])}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════════════ */}
                <section id="testimonials" className={styles.section}>
                    <div className={styles.sectionWrap}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Loved by Students &amp; Engineers</h2>
                            <p className={styles.sectionSub}>Join thousands already practising with AI feedback.</p>
                        </div>
                        <div className={styles.testimonialGrid}>
                            {TESTIMONIALS.map(t => (
                                <div key={t.name} className={styles.testimonialCard}>
                                    <Stars count={t.stars} />
                                    <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                                    <div className={styles.testimonialAuthor}>
                                        <div className={styles.testimonialAvatar}>
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className={styles.testimonialName}>{t.name}</div>
                                            <div className={styles.testimonialRole}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
            CTA BANNER
        ══════════════════════════════════════════════════ */}
                <section className={styles.ctaSection}>
                    <div className={styles.sectionWrap}>
                        <div className={styles.ctaBanner}>
                            <h2 className={styles.ctaTitle}>Ready to Level Up?</h2>
                            <p className={styles.ctaSub}>Start practising today. Your next offer is one interview away.</p>
                            <Link to="/signup" className={styles.ctaBannerBtn}>
                                Start For Free <ArrowRight size={17} />
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerTop}>
                        <div>
                            <div className={styles.footerBrand}>NavKalpana</div>
                            <p className={styles.footerTagline}>AI-powered career preparation platform.</p>
                        </div>
                        <div className={styles.footerCols}>
                            <div className={styles.footerCol}>
                                <div className={styles.footerColTitle}>Product</div>
                                <Link to="/login" className={styles.footerLink}>Login</Link>
                                <Link to="/signup" className={styles.footerLink}>Sign Up</Link>
                                <Link to="/dashboard" className={styles.footerLink}>Dashboard</Link>
                                <Link to="/start-interview" className={styles.footerLink}>AI Interview</Link>
                            </div>
                            <div className={styles.footerCol}>
                                <div className={styles.footerColTitle}>Resources</div>
                                <a href="#features" className={styles.footerLink}>Features</a>
                                <a href="#how" className={styles.footerLink}>How It Works</a>
                                <a href="#testimonials" className={styles.footerLink}>Reviews</a>
                            </div>
                        </div>
                    </div>
                    <div className={styles.footerBottom}>
                        <span>© 2025 NavKalpana. All rights reserved.</span>
                        <div className={styles.socialIcons}>
                            <a href="#twitter" className={styles.socialIcon} aria-label="Twitter"><Twitter size={18} /></a>
                            <a href="#github" className={styles.socialIcon} aria-label="GitHub"><Github size={18} /></a>
                            <a href="#linkedin" className={styles.socialIcon} aria-label="LinkedIn"><Linkedin size={18} /></a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}
