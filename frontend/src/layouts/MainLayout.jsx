import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { LayoutDashboard, Mic, BookOpen, FileText, Activity } from 'lucide-react';
import styles from './MainLayout.module.css';

const DEFAULT_NAV = [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Learning', to: '/learning', icon: <BookOpen size={18} /> },
    { label: 'Assignments', to: '/assignments', icon: <FileText size={18} /> },
    { label: 'AI Interview', to: '/start-interview', icon: <Mic size={18} /> },
    { label: 'Adaptive Quiz', to: '/quiz-setup', icon: <Activity size={18} /> },
];

/**
 * MainLayout — Root shell for ACIE application
 *
 * Usage:
 *   <MainLayout navItems={navItems} pageTitle="Dashboard">
 *     <YourPageContent />
 *   </MainLayout>
 *
 * @param {Array}           navItems   — sidebar nav items [{ label, to, icon }]
 * @param {string}          pageTitle  — passed to Navbar
 * @param {React.ReactNode} actions    — Navbar right-side actions
 * @param {boolean}         sidebarCollapsed
 * @param {React.ReactNode} children   — main page content
 */
export default function MainLayout({
    children,
    navItems = [],
    pageTitle = '',
    actions,
    sidebarCollapsed = false,
}) {
    // If no navItems passed, use default ones
    const finalNavItems = navItems.length > 0 ? navItems : DEFAULT_NAV;

    return (
        <div
            className={[
                styles.shell,
                sidebarCollapsed ? styles.collapsed : '',
            ].join(' ')}
        >
            {/* Fixed sidebar */}
            <Sidebar
                navItems={finalNavItems}
                collapsed={sidebarCollapsed}
            />

            {/* Fixed navbar (offset from sidebar) */}
            <Navbar
                pageTitle={pageTitle}
                actions={actions}
                collapsed={sidebarCollapsed}
            />

            {/* Scrollable content area */}
            <main className={styles.main} id="main-content">
                <div className={styles.contentInner}>
                    {children}
                </div>
            </main>
        </div>
    );
}
