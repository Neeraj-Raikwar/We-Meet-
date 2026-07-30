import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.style.setProperty('--bg-main', '#0d1117');
            root.style.setProperty('--bg-panel', '#161b22');
            root.style.setProperty('--text-main', '#ffffff');
            root.style.setProperty('--text-muted', '#8b949e');
            root.style.setProperty('--nav-border', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--accent-blue', '#1f2937');
            root.style.setProperty('--card-bg', '#21262d');
        } else {
            root.style.setProperty('--bg-main', '#f4f6f9');
            root.style.setProperty('--bg-panel', '#ffffff');
            root.style.setProperty('--text-main', '#1a1a1a');
            root.style.setProperty('--text-muted', '#666666');
            root.style.setProperty('--nav-border', 'rgba(0, 0, 0, 0.08)');
            root.style.setProperty('--accent-blue', '#eff6ff');
            root.style.setProperty('--card-bg', '#ffffff');
        }
    }, [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
