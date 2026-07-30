import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// After a Google/Facebook login, the backend redirects here with ?token=...
// This just needs to store that token the same way a normal login does
// (home.jsx checks localStorage.getItem("token")) and continue into the app.
export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const oauthError = searchParams.get('oauth_error');

        if (token) {
            localStorage.setItem('token', token);
            navigate('/home', { replace: true });
        } else {
            navigate('/auth', {
                replace: true,
                state: oauthError ? { oauthError } : undefined
            });
        }
    }, [searchParams, navigate]);

    return (
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>Signing you in...</Typography>
        </Box>
    );
}
