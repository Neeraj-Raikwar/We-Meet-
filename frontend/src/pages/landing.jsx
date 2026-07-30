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

    // Dynamic guest room generator link helper
    const handleJoinAsGuest = () => {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        const generatePart = (length) => Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        const guestRoomCode = `wmt-${generatePart(3)}-${generatePart(3)}`;
        navigate(`/${guestRoomCode}`);
    };

    return (
        <div className='landingPageContainer' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh' }}>
            <div>
                {/* NAVIGATION BAR */}
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
                    <div className='navHeader'>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }} onClick={() => navigate("/")}>
                            <span className="live-logo-icon">🔵</span>
                            We<span style={{ color: "var(--brand-primary)" }}>Meet</span>
                        </h2>
                    </div>

                    <div className='navlist' style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <IconButton onClick={toggleTheme} color="inherit">
                            {darkMode ? <Brightness7Icon sx={{ color: '#f59e0b' }} /> : <Brightness4Icon />}
                        </IconButton>

                        <p onClick={handleJoinAsGuest} style={{ cursor: 'pointer', fontWeight: 600 }}>
                            Join as Guest
                        </p>

                        <p onClick={() => navigate("/auth", { state: { initialFormState: 1 } })} style={{ cursor: 'pointer', fontWeight: 600 }}>
                            Register
                        </p>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate("/auth", { state: { initialFormState: 0 } })}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 3 }}
                        >
                            Login
                        </Button>
                    </div>
                </nav>

                {/* HERO MAIN CONTAINER */}
                <div className="landingMainContainer">
                    <div>
                        <h1><span style={{ color: "var(--brand-primary)" }}>Connect</span> with your loved Ones</h1>
                        <p>Cover any distance effortlessly with secure, premium enterprise-grade connectivity built inside WeMeet.</p>

                        <div style={{ marginTop: '20px' }}>
                            <Button
                                component={Link}
                                to="/auth"
                                state={{ initialFormState: 1 }}
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{ py: 1.5, px: 4, borderRadius: '8px', fontWeight: 700, textTransform: 'none', fontSize: '1.1rem' }}
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>

                    <div>
                        <img src="/mobile.png" alt="WeMeet Collaboration App Showcase" style={{ maxWidth: '100%', height: 'auto' }} />
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <Box component="footer" sx={{ width: '100%', textAlign: 'center', py: 4, borderTop: '1px solid var(--nav-border)', mt: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: '30px', mb: 1.5 }}>
                    <span style={{ color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '500' }}>Help</span>
                    <span style={{ color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '500' }}>Terms</span>
                    <span style={{ color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '500' }}>Privacy</span>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '650px', mx: 'auto', px: 2, fontWeight: '400' }}>
                    WeMeet is protected by reCAPTCHA and the Google <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}>Privacy Policy</span> and <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}>Terms of Service</span> apply.
                </Typography>
            </Box>
        </div>
    );
}
