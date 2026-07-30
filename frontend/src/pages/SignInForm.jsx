import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    IconButton,
    Tooltip,
    Typography
} from '@mui/material';
import { useState } from 'react';

import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Dynamic API host determination
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// Flip these to true once GOOGLE_CLIENT_ID / FACEBOOK_APP_ID etc. are set in
// the backend .env — until then the buttons stay visible but disabled instead
// of bouncing the user to an "oauth_error" redirect.
const SOCIAL_LOGIN_ENABLED = {
    google: false,
    facebook: false,
    microsoft: false
};

export default function SignInForm({
    username, setUsername,
    password, setPassword,
    error, handleAuth,
    setFormState
}) {
    const [showPassword, setShowPassword] = useState(false);

    // Dynamic Social Login OAuth Trigger
    const handleGoogleLogin = () => {
        window.open(`${BACKEND_URL}/api/v1/users/auth/google`, "_self");
    };

    const handleFacebookLogin = () => {
        window.open(`${BACKEND_URL}/api/v1/users/auth/facebook`, "_self");
    };

    const handleMicrosoftLogin = () => {
        window.open(`${BACKEND_URL}/api/v1/users/auth/microsoft`, "_self");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (handleAuth) handleAuth();
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>

            {/* EMAIL INPUT FIELD */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', marginBottom: '20px', paddingBlock: '8px' }}>
                <MailOutlinedIcon style={{ color: '#666', marginRight: '12px', fontSize: '1.4rem' }} />
                <input
                    type="email"
                    value={username}
                    placeholder="Email Address"
                    required
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: 'inherit' }}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            {/* PASSWORD INPUT FIELD */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', marginBottom: '20px', paddingBlock: '8px' }}>
                <LockOutlinedIcon style={{ color: '#666', marginRight: '12px', fontSize: '1.4rem' }} />
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="Password"
                    required
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: 'inherit' }}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <IconButton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ padding: '4px', marginLeft: '8px', color: '#666' }}
                >
                    {showPassword ? <VisibilityOff style={{ fontSize: '1.25rem' }} /> : <Visibility style={{ fontSize: '1.25rem' }} />}
                </IconButton>
            </div>

            {/* REMEMBER ME & FORGOT PASSWORD */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
                <FormControlLabel
                    control={<Checkbox value="remember" color="primary" sx={{ p: 0.5, mr: 0.5 }} />}
                    label={<Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Remember me</Typography>}
                />
                <Typography
                    variant="body2"
                    sx={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => setFormState(2)}
                >
                    Forgot password?
                </Typography>
            </Box>

            {/* ERROR DISPLAY */}
            {error && (
                <Typography variant="body2" sx={{ color: '#ef4444', mt: 1, mb: 1, fontSize: '0.9rem', fontWeight: 500 }}>
                    {error}
                </Typography>
            )}

            {/* SUBMIT BUTTON */}
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                    mt: 1,
                    mb: 3,
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: 'none',
                    bgcolor: '#2563eb',
                    '&:hover': { boxShadow: 'none', bgcolor: '#1d4ed8' }
                }}
            >
                Login Now
            </Button>

            <Divider sx={{ my: 2 }}>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>Or sign in with</Typography>
            </Divider>

            {/* SOCIAL AUTH BUTTONS */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, mb: 1 }}>
                <Tooltip title={SOCIAL_LOGIN_ENABLED.google ? '' : 'Coming soon'}>
                    <span>
                        <IconButton onClick={handleGoogleLogin} disabled={!SOCIAL_LOGIN_ENABLED.google} className="social-login-btn">
                            <GoogleIcon sx={{ color: SOCIAL_LOGIN_ENABLED.google ? '#ea4335' : undefined }} />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={SOCIAL_LOGIN_ENABLED.facebook ? '' : 'Coming soon'}>
                    <span>
                        <IconButton onClick={handleFacebookLogin} disabled={!SOCIAL_LOGIN_ENABLED.facebook} className="social-login-btn">
                            <FacebookIcon sx={{ color: SOCIAL_LOGIN_ENABLED.facebook ? '#1877f2' : undefined }} />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={SOCIAL_LOGIN_ENABLED.microsoft ? '' : 'Coming soon'}>
                    <span>
                        <IconButton onClick={handleMicrosoftLogin} disabled={!SOCIAL_LOGIN_ENABLED.microsoft} className="social-login-btn">
                            <MicrosoftIcon sx={{ color: SOCIAL_LOGIN_ENABLED.microsoft ? '#00a4ef' : undefined }} />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </Box>
    );
}
