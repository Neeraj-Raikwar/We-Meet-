import { Avatar, Box, Button, Divider, IconButton, Paper, Tooltip, Typography } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SecurityIcon from '@mui/icons-material/Security';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

export default function PeoplePanel({
    isOpen,
    onClose,
    isHost,
    participants = [],
    currentUsername,
    waitingUsers = [],
    onAdmitUser,
    onDenyUser,
    onKickUser,
    onToggleRemoteAudio,
    onToggleRemoteVideo,
    onMuteAllStrict
}) {
    if (!isOpen) return null;

    return (
        <Paper
            elevation={4}
            sx={{
                position: 'absolute',
                top: { xs: 'auto', sm: 16 },
                right: 16,
                bottom: { xs: 90, sm: 80 },
                left: { xs: 16, sm: 'auto' },
                width: { xs: 'auto', sm: 360 },
                maxHeight: { xs: '60vh', sm: 'auto' },
                backgroundColor: '#ffffff',
                color: '#202124',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
            }}
        >
            {/* PANEL HEADER */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#202124' }}>
                    People ({participants.length + 1})
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#5f6368' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* MAIN PARTICIPANT LIST CONTENT */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* STRICT MODE BUTTON (ONLY FOR HOST) */}
                {isHost && (
                    <>
                        <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            startIcon={<SecurityIcon />}
                            onClick={onMuteAllStrict}
                            sx={{
                                py: 1,
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                boxShadow: '0 4px 12px rgba(217, 48, 37, 0.25)',
                                bgcolor: '#d93025',
                                '&:hover': { bgcolor: '#b3261e' }
                            }}
                        >
                            Strict Mode (Mute & Lock All)
                        </Button>
                        <Divider />
                    </>
                )}

                {/* WAITING / KNOCKING REQUESTS SECTION */}
                {isHost && waitingUsers.length > 0 && (
                    <Box sx={{ p: 1.5, bgcolor: '#e8f0fe', borderRadius: '12px', border: '1px solid #aecbfa' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a73e8', display: 'block', mb: 1, textTransform: 'uppercase' }}>
                            Waiting to join ({waitingUsers.length})
                        </Typography>
                        {waitingUsers.map(u => (
                            <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#202124' }}>
                                    {u.name || "Guest"}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        onClick={() => onAdmitUser(u.id)}
                                        sx={{ minWidth: 'auto', px: 1.5, py: 0.2, fontSize: '0.75rem', borderRadius: '12px', textTransform: 'none', bgcolor: '#1a73e8' }}
                                    >
                                        Admit
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() => onDenyUser(u.id)}
                                        sx={{ minWidth: 'auto', px: 1, py: 0.2, fontSize: '0.75rem', borderRadius: '12px', textTransform: 'none' }}
                                    >
                                        Deny
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* IN-CALL SECTION HEADER */}
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#5f6368', letterSpacing: '0.5px' }}>
                    IN CALL
                </Typography>

                {/* LOCAL USER ITEM */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderRadius: '8px', bgcolor: '#f8f9fa' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#e91e63', width: 36, height: 36, fontSize: '1rem', fontWeight: 600 }}>
                            {currentUsername ? currentUsername.charAt(0).toUpperCase() : 'Y'}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#202124' }}>
                                {currentUsername || "You"} (You)
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#1a73e8', fontWeight: 600, display: 'block' }}>
                                {isHost ? 'Meeting host' : 'Participant'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* REMOTE PARTICIPANTS LIST */}
                {participants.map((p) => {
                    const participantName = p.name || 'Guest User';
                    return (
                        <Box key={p.socketId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderRadius: '8px', bgcolor: '#f1f3f4' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: '#2563eb', width: 36, height: 36, fontSize: '1rem', fontWeight: 600 }}>
                                    {participantName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#202124' }}>
                                    {participantName}
                                </Typography>
                            </Box>

                            {/* HOST MODERATION CONTROLS */}
                            {isHost && (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title={p.isAudioLocked ? "Allow Microphone" : "Restrict Microphone"}>
                                        <IconButton size="small" onClick={() => onToggleRemoteAudio(p.socketId)}>
                                            {p.isAudioLocked ? <MicOffIcon fontSize="small" color="error" /> : <MicIcon fontSize="small" sx={{ color: '#5f6368' }} />}
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title={p.isVideoLocked ? "Allow Camera" : "Restrict Camera"}>
                                        <IconButton size="small" onClick={() => onToggleRemoteVideo(p.socketId)}>
                                            {p.isVideoLocked ? <VideocamOffIcon fontSize="small" color="error" /> : <VideocamIcon fontSize="small" sx={{ color: '#5f6368' }} />}
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Remove participant">
                                        <IconButton size="small" onClick={() => onKickUser(p.socketId)} color="error">
                                            <PersonRemoveIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}
