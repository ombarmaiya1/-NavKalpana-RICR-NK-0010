import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

/**
 * Sidebar — Fixed left navigation for ACIE
 *
 * @param {Array}  navItems   — [{ label, to, icon }]
 * @param {string} logo       — brand name or element
 * @param {boolean} collapsed — narrow icon-only mode
 */
export default function Sidebar({
    navItems = [],
    logo = 'ACIE',
    collapsed = false,
}) {
    return (
        <aside
            className={[styles.sidebar, collapsed ? styles.collapsed : ''].join(' ')}
            aria-label="Main navigation"
        >
            {/* Brand */}
            <div className={styles.brand}>
                <span className={styles.brandIcon}>⬡</span>
                {!collapsed && <span className={styles.brandName}>{logo}</span>}
            </div>

            {/* Nav Items */}
            <nav className={styles.nav}>
                <ul className={styles.navList} role="list">
                    {navItems.map(({ label, to, icon }) => (
                        <li key={to} className={styles.navItem}>
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    [styles.navLink, isActive ? styles.active : ''].join(' ')
                                }
                                title={collapsed ? label : undefined}
                            >
                                {icon && (
                                    <span className={styles.navIcon} aria-hidden="true">
                                        {icon}
                                    </span>
                                )}
                                {!collapsed && (
                                    <span className={styles.navLabel}>{label}</span>
                                )}
                                {/* Active indicator bar */}
                                <span className={styles.activeBar} />
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer slot */}
            <div className={styles.sidebarFooter}>
                <div className={styles.userChip}>
                    <div className={styles.avatar}>A</div>
                    {!collapsed && (
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>Admin</span>
                            <span className={styles.userRole}>Coordinator</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
