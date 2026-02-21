import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Mail, Lock, LogIn } from 'lucide-react';
import styles from './Login.module.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const isEmpty = !email.trim() || !password.trim();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEmpty) return;
        setLoading(true);
        // Simulate network request — replace with real auth call
        await new Promise(r => setTimeout(r, 1500));
        setLoading(false);
        navigate('/dashboard');
    };

    return (
        <div className={styles.page}>
            <div className={styles.cardWrap}>
                <Card variant="glass" padded>

                    {/* Brand */}
                    <div className={styles.brand}>NavKalpana</div>

                    {/* Heading */}
                    <div className={styles.heading}>
                        <h1 className={styles.title}>Welcome Back</h1>
                        <p className={styles.subtitle}>Login to continue your interview journey</p>
                    </div>

                    {/* Form */}
                    <form className={styles.form} onSubmit={handleSubmit} noValidate>

                        {/* Email */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="login-email">Email</label>
                            <div className={styles.inputWrap}>
                                <Mail className={styles.inputIcon} size={18} />
                                <input
                                    id="login-email"
                                    type="email"
                                    className={styles.input}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className={styles.field}>
                            <div className={styles.labelRow}>
                                <label className={styles.label} htmlFor="login-password">Password</label>
                                <a href="#forgot" className={styles.forgotLink}>Forgot Password?</a>
                            </div>
                            <div className={styles.inputWrap}>
                                <Lock className={styles.inputIcon} size={18} />
                                <input
                                    id="login-password"
                                    type="password"
                                    className={styles.input}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            disabled={isEmpty}
                            leftIcon={<LogIn size={18} />}
                        >
                            {loading ? 'Signing In…' : 'Sign In'}
                        </Button>

                    </form>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <span className={styles.dividerLine} />
                        <span className={styles.dividerText}>or</span>
                        <span className={styles.dividerLine} />
                    </div>

                    {/* Footer */}
                    <p className={styles.footer}>
                        Don&apos;t have an account?{' '}
                        <Link to="/signup" className={styles.footerLink}>Create one free</Link>
                    </p>

                </Card>
            </div>
        </div>
    );
}
