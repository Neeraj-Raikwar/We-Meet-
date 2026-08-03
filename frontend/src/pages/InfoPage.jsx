import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ThemeContext } from '../contexts/ThemeContext';

// Shared shell for the Help / Terms / Privacy pages — reuses the exact same
// radiant background, simple nav, and footer as the landing and auth pages
// so navigating between them feels like one consistent site rather than
// three different-looking pages bolted on.
export default function InfoPage({ title, children }) {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useContext(ThemeContext);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'var(--bg-main)',
                color: 'var(--text-main)'
            }}
        >
            {/* Same radiant blob background used on landing + auth pages */}
            <style>{`
                @keyframes radiantDrift {
                    0%   { transform: translate(-10%, -10%) scale(1); }
                    50%  { transform: translate(10%, 5%) scale(1.15); }
                    100% { transform: translate(-10%, -10%) scale(1); }
                }
                .radiant-bg-layer {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    overflow: hidden;
                }
                .radiant-blob {
                    position: absolute;
                    width: 60vw;
                    height: 60vw;
                    max-width: 700px;
                    max-height: 700px;
                    border-radius: 50%;
                    filter: blur(90px);
                    animation: radiantDrift 18s ease-in-out infinite;
                    opacity: var(--radiant-opacity, 0.25);
                }
                .radiant-blob.one { top: -15%; left: -10%; background: var(--brand-primary); }
                .radiant-blob.two { bottom: -20%; right: -10%; background: var(--brand-primary); animation-delay: -9s; }
            `}</style>
            <div className="radiant-bg-layer">
                <div className="radiant-blob one" style={{ '--radiant-opacity': darkMode ? 0.32 : 0.18 }} />
                <div className="radiant-blob two" style={{ '--radiant-opacity': darkMode ? 0.28 : 0.14 }} />
            </div>

            {/* SIMPLE NAV — identical to the auth page */}
            <Box
                component="nav"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: { xs: '1rem 1.25rem', sm: '1.5rem 2rem' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', whiteSpace: 'nowrap' }}>
                        <span className="live-logo-icon">🔵</span> We<span style={{ color: '#2563eb' }}>Meet</span>
                    </Typography>
                </Box>
                <IconButton onClick={toggleTheme} color="inherit">
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Box>

            {/* CONTENT CARD */}
            <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2, py: { xs: 3, sm: 5 } }}>
                <Paper
                    elevation={darkMode ? 0 : 3}
                    sx={{
                        width: '100%',
                        maxWidth: '720px',
                        borderRadius: '20px',
                        border: darkMode ? '1px solid var(--nav-border)' : 'none',
                        p: { xs: 3, sm: 5 },
                        bgcolor: 'var(--bg-panel)'
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
                        {title}
                    </Typography>
                    <Box sx={{ color: 'var(--text-main)', '& p': { mb: 2, lineHeight: 1.7, color: 'var(--text-muted)' }, '& h3': { mt: 3, mb: 1, fontSize: '1.05rem', fontWeight: 700 }, '& ul': { pl: 3, mb: 2, color: 'var(--text-muted)' }, '& li': { mb: 0.5, lineHeight: 1.6 } }}>
                        {children}
                    </Box>
                </Paper>

                {/* FOOTER — same links as landing/auth pages */}
                <Box sx={{ width: '100%', textAlign: 'center', mt: 4, maxWidth: '650px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
                        <Typography component={Link} to="/help" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Help</Typography>
                        <Typography component={Link} to="/terms" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms</Typography>
                        <Typography component={Link} to="/privacy" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, display: 'block', mx: 'auto', px: 2 }}>
                        WeMeet is protected by reCAPTCHA and the Google{' '}
                        <Box component="a" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" sx={{ color: '#2563eb', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Box>{' '}
                        and{' '}
                        <Box component="a" href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" sx={{ color: '#2563eb', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms of Service</Box>{' '}
                        apply.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
