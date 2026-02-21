import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
            title={isDark ? 'Light mode' : 'Dark mode'}
        >
            <span className={`${styles.track} ${isDark ? styles.trackDark : ''}`}>
                <span className={`${styles.thumb} ${isDark ? styles.thumbDark : ''}`}>
                    {isDark
                        ? <Moon size={12} strokeWidth={2.5} />
                        : <Sun size={12} strokeWidth={2.5} />
                    }
                </span>
            </span>
        </button>
    );
}
