import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Page load hote hi localStorage se saved theme check karna
    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') || 'light';
        setIsDarkMode(savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    // Theme toggle karne par poori website ka theme change hoga
    const toggleTheme = () => {
        const nextTheme = isDarkMode ? 'light' : 'dark';
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('app-theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: '2rem',
            height: '8vh',
            background: 'var(--bg-surface, #ffffff)',
            borderBottom: '1px solid var(--border-color, rgba(0,0,0,0.08))',
            color: 'var(--text-primary, #1a1a1a)',
            transition: 'all 0.3s ease'
        }}>
            {/* Logo Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: '8px', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
                <Box
                    sx={{
                        width: '14px',
                        height: '14px',
                        backgroundColor: '#2563eb',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'pulse 2s infinite ease-in-out',
                        '@keyframes pulse': {
                            '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.7)' },
                            '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(37, 99, 235, 0)' },
                            '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(37, 99, 235, 0)' },
                        }
                    }}
                />
                <Typography variant="h6" sx={{ fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    We<span style={{ color: '#2563eb' }}>Meet</span>
                </Typography>
            </Box>

            {/* Right Action Items: Navigation Links & Dark Mode Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button sx={{ color: 'var(--text-primary)', textTransform: 'none', fontWeight: 600 }} onClick={() => window.location.href = '/history'}>
                    History
                </Button>

                {/* Dark / Light Toggle Button */}
                <IconButton onClick={toggleTheme} sx={{ color: 'var(--text-primary)', ml: 1 }}>
                    {isDarkMode ? <LightModeIcon sx={{ color: '#fbbc04' }} /> : <DarkModeIcon />}
                </IconButton>
            </Box>
        </Box>
    );
}
