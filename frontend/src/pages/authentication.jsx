import {
    Box,
    CssBaseline,
    Paper,
    Snackbar,
    ThemeProvider,
    Typography,
    createTheme
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import IconButton from '@mui/material/IconButton';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

import ResetPasswordForm from './ResetPasswordForm';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export default function Authentication() {
    const location = useLocation();
    const navigate = useNavigate();

    // Auth & Form State Management
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [formState, setFormState] = useState(0); // 0: Sign In, 1: Sign Up, 2: Reset Password
    const [open, setOpen] = useState(false);

    // Reset Password State Management
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetStep, setResetStep] = useState(0);

    const {
        handleRegister,
        handleLogin,
        handleForgotPasswordRequest,
        handleVerifyOTPAndResetPassword
    } = useContext(AuthContext);

    const { darkMode, toggleTheme } = useContext(ThemeContext);

    // Sync initial form state from navigation location
    useEffect(() => {
        if (location.state && location.state.initialFormState !== undefined) {
            setFormState(location.state.initialFormState);
        }
    }, [location.state]);

    // Optimize MUI Theme creation using useMemo
    const activeTheme = useMemo(() => createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: { main: '#2563eb' },
            background: {
                default: darkMode ? '#0d1117' : '#f4f6f9',
                paper: darkMode ? '#161b22' : '#ffffff'
            }
        }
    }), [darkMode]);

    const resetFields = () => {
        setUsername("");
        setPassword("");
        setName("");
        setError("");
        setOtp("");
        setNewPassword("");
    };

    // Main Authentication Handler (Login / Register)
    const handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            } else if (formState === 1) {
                const result = await handleRegister(name, username, password);
                resetFields();
                setMessage(result);
                setOpen(true);
                setFormState(0);
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Something went wrong!");
            }
        }
    };

    // OTP Trigger Handler
    const handleSendOTP = async () => {
        try {
            setError("");
            const result = await handleForgotPasswordRequest(username);
            setMessage(result);
            setOpen(true);
            setResetStep(1);
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Mailing server connection timeout or email not found.");
            }
        }
    };

    // OTP Verification and Reset Handler
    const handleVerifyAndReset = async () => {
        try {
            setError("");
            const result = await handleVerifyOTPAndResetPassword(username, otp, newPassword);
            setMessage(result);
            setOpen(true);
            resetFields();
            setFormState(0);
            setResetStep(0);
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Verification code token mismatch error reported.");
            }
        }
    };

    return (
        <ThemeProvider theme={activeTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.default'
                }}
            >
                {/* Same radiant blob background as the landing page, for a consistent look */}
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

                {/* SIMPLE NAV */}
                <Box
                    component="nav"
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: { xs: '1rem 1.25rem', sm: '1.5rem 2rem' }
                    }}
                >
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', color: 'var(--text-main)' }}>
                            <span className="live-logo-icon">🔵</span> We<span style={{ color: '#2563eb' }}>Meet</span>
                        </Typography>
                    </Box>
                    <IconButton onClick={toggleTheme} color="inherit">
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Box>

                {/* CENTERED AUTH CARD */}
                <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2, py: 4 }}>
                    <Typography variant="body1" sx={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '420px', mb: 3, fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                        Enterprise-grade secure connectivity for crystal-clear video collaboration.
                    </Typography>

                    <Paper
                        elevation={darkMode ? 0 : 3}
                        sx={{
                            width: '100%',
                            maxWidth: '440px',
                            borderRadius: '20px',
                            border: darkMode ? '1px solid var(--nav-border)' : 'none',
                            p: { xs: 3, sm: 5 },
                            bgcolor: 'background.paper'
                        }}
                    >
                        {/* Top Switch Mode Navigation Link */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mb: 2 }}>
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                {formState === 0 && "New to WeMeet? "}
                                {formState === 1 && "Already have an account? "}
                                {formState === 2 && "Recall operational profile keys? "}
                                <Box
                                    component="span"
                                    sx={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600, ml: 0.5 }}
                                    onClick={() => {
                                        setFormState(formState === 2 ? 0 : (formState === 0 ? 1 : 0));
                                        setError("");
                                    }}
                                >
                                    {formState === 0 && "Sign Up Free"}
                                    {formState === 1 && "Sign In"}
                                    {formState === 2 && "Sign In Here"}
                                </Box>
                            </Typography>
                        </Box>

                        {/* Dynamic Form Title and Forms rendering */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: 'var(--text-main)', fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
                                {formState === 0 && "Sign in"}
                                {formState === 1 && "Create Account"}
                                {formState === 2 && "Recover Access"}
                            </Typography>

                            {formState === 0 && (
                                <SignInForm
                                    username={username} setUsername={setUsername}
                                    password={password} setPassword={setPassword}
                                    error={error} handleAuth={handleAuth}
                                    setFormState={setFormState}
                                />
                            )}

                            {formState === 1 && (
                                <SignUpForm
                                    name={name} setName={setName}
                                    username={username} setUsername={setUsername}
                                    password={password} setPassword={setPassword}
                                    error={error} handleAuth={handleAuth}
                                />
                            )}

                            {formState === 2 && (
                                <ResetPasswordForm
                                    username={username} setUsername={setUsername}
                                    otp={otp} setOtp={setOtp}
                                    newPassword={newPassword} setNewPassword={setNewPassword}
                                    resetStep={resetStep} setResetStep={setResetStep}
                                    error={error} setError={setError}
                                    handleSendOTP={handleSendOTP} handleVerifyAndReset={handleVerifyAndReset}
                                    setFormState={setFormState}
                                />
                            )}
                        </Box>
                    </Paper>

                    {/* Bottom Legal / Help Bar */}
                    <Box sx={{ width: '100%', textAlign: 'center', mt: 4, maxWidth: '650px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
                            <Typography component={Link} to="/help" variant="caption" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Help</Typography>
                            <Typography component={Link} to="/terms" variant="caption" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms</Typography>
                            <Typography component={Link} to="/privacy" variant="caption" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, display: 'block', mx: 'auto', px: 2 }}>
                            WeMeet is protected by reCAPTCHA and the Google{' '}
                            <Box component="a" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" sx={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Box>{' '}
                            and{' '}
                            <Box component="a" href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" sx={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms of Service</Box>{' '}
                            apply.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Notification Bar */}
            <Snackbar open={open} autoHideDuration={4000} message={message} onClose={() => setOpen(false)} />
        </ThemeProvider>
    );
}
