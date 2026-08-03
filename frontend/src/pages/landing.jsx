import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import "../App.css";
import { ThemeContext } from '../contexts/ThemeContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useContext(ThemeContext);

    const handleJoinAsGuest = () => {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        const generatePart = (length) => Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        const guestRoomCode = `wmt-${generatePart(3)}-${generatePart(3)}`;
        navigate(`/${guestRoomCode}`);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
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
                .radiant-blob.one {
                    top: -15%;
                    left: -10%;
                    background: var(--brand-primary);
                }
                .radiant-blob.two {
                    bottom: -20%;
                    right: -10%;
                    background: var(--brand-primary);
                    animation-delay: -9s;
                }
            `}</style>
            <div className="radiant-bg-layer">
                <div className="radiant-blob one" style={{ '--radiant-opacity': darkMode ? 0.32 : 0.18 }} />
                <div className="radiant-blob two" style={{ '--radiant-opacity': darkMode ? 0.28 : 0.14 }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* NAVIGATION BAR */}
                <Box component="nav" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', width: '100%', boxSizing: 'border-box', padding: { xs: '1rem 1.25rem', sm: '1.5rem 2rem' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', whiteSpace: 'nowrap' }} onClick={() => navigate("/")}>
                            <span className="live-logo-icon">🔵</span>
                            We<span style={{ color: "var(--brand-primary)" }}>Meet</span>
                        </h2>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: '20px' }, flexShrink: 0 }}>
                        <IconButton onClick={toggleTheme} color="inherit" size="small">
                            {darkMode ? <Brightness7Icon sx={{ color: '#f59e0b' }} /> : <Brightness4Icon />}
                        </IconButton>

                        <Typography onClick={handleJoinAsGuest} sx={{ display: { xs: 'none', sm: 'block' }, cursor: 'pointer', fontWeight: 600 }}>
                            Join as Guest
                        </Typography>

                        <Typography onClick={() => navigate("/auth", { state: { initialFormState: 1 } })} sx={{ display: { xs: 'none', sm: 'block' }, cursor: 'pointer', fontWeight: 600 }}>
                            Register
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate("/auth", { state: { initialFormState: 0 } })}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: { xs: 2, sm: 3 }, fontSize: { xs: '0.85rem', sm: '0.9375rem' } }}
                        >
                            Login
                        </Button>
                    </Box>
                </Box>

                {/* HERO MAIN CONTAINER */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        gap: { xs: 3, md: 6 },
                        px: { xs: 2.5, sm: 4, md: 6 },
                        py: { xs: 3, md: 4 },
                        textAlign: { xs: 'center', md: 'left' }
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{ fontSize: 'clamp(1.9rem, 6vw, 3rem)', lineHeight: 1.15, margin: 0 }}>
                            <span style={{ color: "var(--brand-primary)" }}>Connect</span> with your loved Ones
                        </h1>
                        <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>Cover any distance effortlessly with secure, premium enterprise-grade connectivity built inside WeMeet.</p>

                        <div style={{ marginTop: '20px' }}>
                            <Button
                                component={Link}
                                to="/auth"
                                state={{ initialFormState: 1 }}
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth={false}
                                sx={{ py: 1.5, px: 4, borderRadius: '8px', fontWeight: 700, textTransform: 'none', fontSize: '1.1rem', width: { xs: '100%', sm: 'auto' } }}
                            >
                                Get Started
                            </Button>
                        </div>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Box
                            component="img"
                            src="/mobile.png"
                            alt="WeMeet Collaboration App Showcase"
                            sx={{
                                width: { xs: '80%', sm: '70%', md: '100%' },
                                maxWidth: { xs: '360px', md: '480px' },
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </Box>
                </Box>
            </div>

            {/* FOOTER */}
            <Box component="footer" sx={{ position: 'relative', zIndex: 1, width: '100%', textAlign: 'center', py: 4, borderTop: '1px solid var(--nav-border)', mt: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: '30px', mb: 1.5 }}>
                    <Typography component={Link} to="/help" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Help
                    </Typography>
                    <Typography component={Link} to="/terms" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Terms
                    </Typography>
                    <Typography component={Link} to="/privacy" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Privacy
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '650px', mx: 'auto', px: 2, fontWeight: '400' }}>
                    WeMeet is protected by reCAPTCHA and the Google{' '}
                    <Box component="a" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" sx={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Privacy Policy
                    </Box>{' '}
                    and{' '}
                    <Box component="a" href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" sx={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Terms of Service
                    </Box>{' '}
                    apply.
                </Typography>
            </Box>
        </div>
    );
}
