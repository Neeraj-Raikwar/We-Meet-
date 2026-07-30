import React, { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    Typography
} from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function SignUpForm({
    name, setName,
    username, setUsername,
    password, setPassword,
    error, handleAuth
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [mobile, setMobile] = useState("");
    const [validationError, setValidationError] = useState("");

    // Registration Form Validation Handler
    const handleRegistrationValidation = (e) => {
        e.preventDefault();
        setValidationError("");

        if (!name || !name.trim()) {
            setValidationError("Full Name is required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            setValidationError("Please enter a valid Email Address.");
            return;
        }

        if (mobile && !/^\d{10}$/.test(mobile)) {
            setValidationError("Mobile Number must be a valid 10-digit number.");
            return;
        }

        if (!password || password.length < 6) {
            setValidationError("Password must be at least 6 characters long.");
            return;
        }

        if (handleAuth) handleAuth();
    };

    return (
        <Box component="form" onSubmit={handleRegistrationValidation} noValidate sx={{ width: '100%' }}>

            {/* FULL NAME INPUT FIELD */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', marginBottom: '20px', paddingBlock: '8px' }}>
                <PersonOutlinedIcon style={{ color: '#666', marginRight: '12px', fontSize: '1.4rem' }} />
                <input
                    type="text"
                    value={name}
                    placeholder="Full Name"
                    required
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: 'inherit' }}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {/* EMAIL / USERNAME INPUT FIELD */}
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

            {/* MOBILE NUMBER INPUT FIELD (OPTIONAL) */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', marginBottom: '20px', paddingBlock: '8px' }}>
                <PhoneAndroidIcon style={{ color: '#666', marginRight: '12px', fontSize: '1.4rem' }} />
                <input
                    type="tel"
                    value={mobile}
                    placeholder="Mobile Number (Optional)"
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: 'inherit' }}
                    onChange={(e) => setMobile(e.target.value)}
                />
            </div>

            {/* PASSWORD INPUT FIELD */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', marginBottom: '20px', paddingBlock: '8px' }}>
                <LockOutlinedIcon style={{ color: '#666', marginRight: '12px', fontSize: '1.4rem' }} />
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="Create a password"
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

            {/* TERMS & CONDITIONS CHECKBOX */}
            <FormControlLabel
                control={<Checkbox defaultChecked color="primary" sx={{ p: 0.5, mr: 0.5 }} />}
                label={<Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>I accept all terms & conditions</Typography>}
                sx={{ mb: 1, mt: 1, width: '100%' }}
            />

            {/* ERROR DISPLAY */}
            {(validationError || error) && (
                <Typography variant="body2" sx={{ color: '#ef4444', mt: 1, mb: 1, fontSize: '0.9rem', fontWeight: 500 }}>
                    {validationError || error}
                </Typography>
            )}

            {/* REGISTER BUTTON */}
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
                Register Now
            </Button>
        </Box>
    );
}
