import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from './MainLayout.module.css';

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
    return (
        <div
            className={[
                styles.shell,
                sidebarCollapsed ? styles.collapsed : '',
            ].join(' ')}
        >
            {/* Fixed sidebar */}
            <Sidebar
                navItems={navItems}
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
