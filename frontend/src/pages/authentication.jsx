import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
    Box,
    CssBaseline,
    Grid,
    IconButton,
    Paper,
    Snackbar,
    ThemeProvider,
    Typography,
    createTheme
} from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

import ResetPasswordForm from './ResetPasswordForm';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export default function Authentication() {
    const location = useLocation();

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
            <Grid container component="main" sx={{ height: '100vh', width: '100vw', bgcolor: 'background.default' }}>
                <CssBaseline />

                {/* Dark/Light Mode Switch Button */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
                    <IconButton onClick={toggleTheme} color="inherit">
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Box>

                {/* Left Branding Side Panel */}
                <Grid
                    item
                    xs={12}
                    sm={4}
                    md={6}
                    sx={{
                        display: { xs: 'none', sm: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 4,
                        bgcolor: darkMode ? '#090d13' : '#eff6ff',
                        borderRight: '1px solid var(--nav-border)'
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h1" sx={{ fontSize: '3.8rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px' }}>
                            <span className="live-logo-icon">🔵</span> We<span style={{ color: '#2563eb' }}>Meet</span>
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '450px', mx: 'auto', mt: 2, fontWeight: 400 }}>
                            Enterprise-grade secure connectivity for crystal-clear video collaboration.
                        </Typography>
                    </Box>
                </Grid>

                {/* Right Active Form Workspace */}
                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={6}
                    component={Paper}
                    elevation={0}
                    square
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderLeft: '1px solid var(--nav-border)',
                        overflowY: 'auto',
                        p: 4
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '420px', mx: 'auto' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: 'var(--text-main)' }}>
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

                    {/* Bottom Legal / Help Bar */}
                    <Box sx={{ width: '100%', textAlign: 'center', mt: 'auto', pt: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>Help</Typography>
                            <Typography variant="caption" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>Terms</Typography>
                            <Typography variant="caption" sx={{ color: '#2563eb', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>Privacy</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '650px', display: 'block', mx: 'auto', px: 2 }}>
                            WeMeet is protected by reCAPTCHA and the Google <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>Privacy Policy</span> and <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>Terms of Service</span> apply.
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Notification Bar */}
            <Snackbar open={open} autoHideDuration={4000} message={message} onClose={() => setOpen(false)} />
        </ThemeProvider>
    );
}
