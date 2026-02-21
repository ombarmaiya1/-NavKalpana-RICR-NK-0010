import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

/** Reads the stored preference or falls back to 'dark' */
function getInitialTheme() {
    try {
        const stored = localStorage.getItem('nk-theme');
        if (stored === 'light' || stored === 'dark') return stored;
    } catch (_) { /* localStorage not available */ }
    return 'dark';
}

/** Applies the data-theme attribute to <html> so CSS vars take effect globally */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    // Apply theme whenever it changes
    useEffect(() => {
        applyTheme(theme);
        try {
            localStorage.setItem('nk-theme', theme);
        } catch (_) { /* ignore write errors */ }
    }, [theme]);

    const toggleTheme = () =>
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/** Hook — useTheme() returns { theme, toggleTheme } */
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
}
