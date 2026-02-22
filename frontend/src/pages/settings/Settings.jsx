import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { User, Shield, Mail, Lock } from 'lucide-react';
import styles from './Settings.module.css';

export default function Settings() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwdSaved, setPwdSaved] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setName(data.name || '');
                    setEmail(data.email || '');
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to update profile');
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword) {
            setError('Please enter both current and new passwords.');
            return;
        }
        setPwdSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to update password');
            }
            setPwdSaved(true);
            setCurrentPassword('');
            setNewPassword('');
            setTimeout(() => setPwdSaved(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setPwdSaving(false);
        }
    };

    return (
        <MainLayout pageTitle="Settings">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Account Settings</h1>
                    <p className={styles.subtitle}>Manage your profile and preferences.</p>
                </div>

                {error && (
                    <div className={styles.errorAlert} style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                {/* Profile Overview Card */}
                <Card>
                    <div className={styles.profileCard}>
                        <div className={styles.avatarLg}>
                            {name ? name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className={styles.profileDetails}>
                            {loading ? (
                                <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
                            ) : (
                                <>
                                    <div className={styles.name}>{name || 'User'}</div>
                                    <div className={styles.email}><Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />{email}</div>
                                    <div className={styles.role}>Student</div>
                                </>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Edit Profile */}
                <Card>
                    <h2 className={styles.sectionTitle}><User size={20} className="text-primary" /> Profile Information</h2>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            className={styles.input}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className={styles.actions}>
                        <Button variant="primary" onClick={handleSave} disabled={saving || loading}>
                            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                        </Button>
                    </div>
                </Card>

                {/* Security */}
                <Card>
                    <h2 className={styles.sectionTitle}><Shield size={20} className="text-warning" /> Security</h2>
                    <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>Update your password and secure your account.</p>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Current Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>New Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            leftIcon={<Lock size={16} />}
                            onClick={handlePasswordUpdate}
                            disabled={pwdSaving || loading}
                        >
                            {pwdSaving ? 'Updating...' : pwdSaved ? 'Updated!' : 'Update Password'}
                        </Button>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
