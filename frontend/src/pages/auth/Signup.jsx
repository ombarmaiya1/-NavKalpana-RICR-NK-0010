import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { User, Mail, Lock, UserPlus, FileText, Briefcase } from 'lucide-react';
import styles from './Signup.module.css';
import authService from '../../services/authService';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [role, setRole] = useState('');
    const [file, setFile] = useState(null);

    const mismatch = confirm.length > 0 && password !== confirm;
    const isDisabled = !name || !email || !password || mismatch;

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isDisabled) return;
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            if (role) formData.append('role', role);
            if (file) formData.append('file', file);

            const result = await authService.signup(formData);

            if (result && result.success) {
                setSuccessMessage("Account created successfully! Redirecting to login...");
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result?.message || 'Signup failed. Please try again.');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('An error occurred during signup.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.cardWrap}>
                <Card variant="glass" padded>

                    {/* Brand */}
                    <div className={styles.brand}>NavKalpana</div>

                    {/* Heading */}
                    <div className={styles.heading}>
                        <h1 className={styles.title}>Create Account</h1>
                        <p className={styles.subtitle}>Start your AI interview preparation today</p>
                    </div>

                    {error && (
                        <div className={styles.errorAlert} style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className={styles.successAlert} style={{ color: 'var(--success)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
                            {successMessage}
                        </div>
                    )}

                    {/* Form */}
                    <form className={styles.form} onSubmit={handleSubmit} noValidate>

                        {/* Full Name */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="signup-name">Full Name</label>
                            <div className={styles.inputWrap}>
                                <User className={styles.inputIcon} size={18} />
                                <input
                                    id="signup-name"
                                    type="text"
                                    className={styles.input}
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="signup-email">Email</label>
                            <div className={styles.inputWrap}>
                                <Mail className={styles.inputIcon} size={18} />
                                <input
                                    id="signup-email"
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
                            <label className={styles.label} htmlFor="signup-password">Password</label>
                            <div className={styles.inputWrap}>
                                <Lock className={styles.inputIcon} size={18} />
                                <input
                                    id="signup-password"
                                    type="password"
                                    className={styles.input}
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {/* Target Role (Optional) */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="signup-role">Target Role (Optional)</label>
                            <div className={styles.inputWrap}>
                                <Briefcase className={styles.inputIcon} size={18} />
                                <input
                                    id="signup-role"
                                    type="text"
                                    className={styles.input}
                                    placeholder="e.g. Frontend Developer"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Resume Upload (Optional) */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="signup-resume">Resume (Optional PDF)</label>
                            <div className={styles.inputWrap}>
                                <FileText className={styles.inputIcon} size={18} />
                                <input
                                    id="signup-resume"
                                    type="file"
                                    accept=".pdf"
                                    className={styles.input}
                                    style={{ paddingTop: '10px' }}
                                    onChange={e => setFile(e.target.files[0])}
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
                            disabled={isDisabled}
                            leftIcon={<UserPlus size={18} />}
                        >
                            {loading ? 'Creating Account…' : 'Create Account'}
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
                        Already have an account?{' '}
                        <Link to="/login" className={styles.footerLink}>Sign in</Link>
                    </p>

                </Card>
            </div>
        </div>
    );
}
