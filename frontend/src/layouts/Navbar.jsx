import ThemeToggle from '../components/ui/ThemeToggle';
import styles from './Navbar.module.css';

/**
 * Navbar — Top bar for ACIE
 *
 * @param {string}          pageTitle   — current page title
 * @param {React.ReactNode} actions     — extra right-side action elements
 */
export default function Navbar({ pageTitle = '', actions, collapsed = false }) {
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

                {/* Profile avatar */}
                <button className={styles.profileBtn} aria-label="Open profile menu" type="button">
                    <div className={styles.avatar}>A</div>
                    <div className={styles.profileInfo}>
                        <span className={styles.profileName}>Admin</span>
                        <span className={styles.profileRole}>Coordinator</span>
                    </div>
                    <ChevronIcon />
                </button>
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
