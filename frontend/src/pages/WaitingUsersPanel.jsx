import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Avatar, Box, Button, Chip, Paper, Typography } from '@mui/material';

export default function WaitingUsersPanel({ waitingUsers = [], onAdmit, onDeny }) {
    if (!waitingUsers || waitingUsers.length === 0) return null;

    const currentUser = waitingUsers[0];
    const remainingCount = waitingUsers.length - 1;

    // Handle admitting all waiting guests at once
    const handleAdmitAll = () => {
        waitingUsers.forEach(u => onAdmit(u.id));
    };

    return (
        <Paper
            elevation={8}
            sx={{
                position: 'absolute',
                top: 80,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: '#ffffff',
                color: '#202124',
                py: 1.5,
                px: 2.5,
                borderRadius: '20px',
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                border: '1px solid #e0e0e0',
                maxWidth: { xs: '90vw', sm: '540px' },
                width: 'max-content'
            }}
        >
            <Avatar sx={{ bgcolor: '#1a73e8', width: 42, height: 42, fontWeight: 700 }}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G'}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {currentUser.name || "Someone"}
                    </Typography>
                    {remainingCount > 0 && (
                        <Chip
                            label={`+${remainingCount} more`}
                            size="small"
                            sx={{ height: '20px', fontSize: '0.7rem', fontWeight: 700, bgcolor: '#e8f0fe', color: '#1a73e8' }}
                        />
                    )}
                </Box>
                <Typography variant="caption" sx={{ color: '#5f6368', display: 'block' }}>
                    Wants to join this call
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onDeny(currentUser.id)}
                    startIcon={<CloseIcon />}
                    sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600, px: 1.5 }}
                >
                    Deny
                </Button>

                {remainingCount > 0 ? (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAdmitAll}
                        startIcon={<CheckIcon />}
                        sx={{ borderRadius: '20px', textTransform: 'none', bgcolor: '#1a73e8', fontWeight: 600, px: 2, whiteSpace: 'nowrap' }}
                    >
                        Admit All ({waitingUsers.length})
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => onAdmit(currentUser.id)}
                        startIcon={<CheckIcon />}
                        sx={{ borderRadius: '20px', textTransform: 'none', bgcolor: '#1a73e8', fontWeight: 600, px: 2 }}
                    >
                        Admit
                    </Button>
                )}
            </Box>
        </Paper>
    );
}
