import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';

/**
 * Navbar — Top bar for ACIE
 *
 * @param {string}          pageTitle   — current page title
 * @param {React.ReactNode} actions     — extra right-side action elements
 */
export default function Navbar({ pageTitle = '', actions, collapsed = false }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
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
                    setUser(data);
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };
        fetchUser();
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header
            className={[styles.navbar, collapsed ? styles.collapsed : ''].join(' ')}
            role="banner"
        >
            {/* Left: page title / breadcrumb */}
            <div className={styles.navLeft}>
                {pageTitle && (
                    <h1 className={styles.pageTitle}>{pageTitle}</h1>
                )}
            </div>

            {/* Right: actions, notifications, profile */}
            <div className={styles.navRight}>
                {/* Extra actions slot */}
                {actions && (
                    <div className={styles.actions}>{actions}</div>
                )}

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notification Bell */}
                <button
                    className={styles.iconBtn}
                    aria-label="Notifications"
                    type="button"
                >
                    <BellIcon />
                    <span className={styles.badge} aria-label="3 unread notifications">3</span>
                </button>

                {/* Profile wrapper */}
                <div className={styles.profileWrapper} ref={dropdownRef}>
                    <button
                        className={styles.profileBtn}
                        aria-label="Open profile menu"
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className={styles.avatar}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                        <div className={styles.profileInfo}>
                            <span className={styles.profileName}>{user?.name || 'User'}</span>
                            <span className={styles.profileRole}>Student</span>
                        </div>
                        <ChevronIcon />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className={styles.dropdownMenu}>
                            <div className={styles.dropdownHeader}>
                                <div className={styles.dropdownName}>{user?.name || 'User'}</div>
                                <div className={styles.dropdownEmail}>{user?.email || 'user@example.com'}</div>
                            </div>
                            <div className={styles.dropdownDivider}></div>
                            <button
                                className={styles.dropdownItem}
                                onClick={() => {
                                    setDropdownOpen(false);
                                    navigate('/settings');
                                }}
                            >
                                <SettingsIcon size={16} />
                                Settings
                            </button>
                            <div className={styles.dropdownDivider}></div>
                            <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={handleLogout}>
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

/* ---------- Inline SVG icons ---------- */
function BellIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function ChevronIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}
