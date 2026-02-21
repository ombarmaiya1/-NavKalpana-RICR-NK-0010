import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../styles/theme.css';

/**
 * Navbar — sticky top bar with brand name + theme toggle.
 * Add navigation links inside .navbar__actions as needed.
 */
export default function Navbar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="navbar">
            <a href="/" className="navbar__brand">
                NavKalpana
            </a>

            <div className="navbar__actions">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? (
                        <Sun size={18} strokeWidth={2} />
                    ) : (
                        <Moon size={18} strokeWidth={2} />
                    )}
                </button>
            </div>
        </nav>
    );
}
