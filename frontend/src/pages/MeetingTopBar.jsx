import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import { Badge, Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function MeetingTopBar({
    activeCount,
    hasWaiting,
    onToggleWaiting,
    onTogglePeople,
    onToggleTranscript,
    isTranscriptOpen
}) {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toTimeString().split(' ')[0].substring(0, 5));
        };
        updateTime();
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            p: { xs: 1, sm: 2 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 20,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
        }}>
            {/* LEFT: CLOCK & ROOM CODE */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.5 }, color: '#fff', minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: '600', display: { xs: 'none', sm: 'block' } }}>{currentTime}</Typography>
                <Typography variant="body1" sx={{ opacity: 0.5, display: { xs: 'none', sm: 'block' } }}>|</Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: '600',
                        fontFamily: 'monospace',
                        fontSize: { xs: '0.75rem', sm: '1rem' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: { xs: '90px', sm: 'none' }
                    }}
                >
                    {window.location.pathname.split("/").pop() || 'mni-bfhy-qor'}
                </Typography>
            </Box>

            {/* RIGHT: ACTIONS & CONTROLS */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 2 } }}>
                {hasWaiting && (
                    <Box
                        onClick={onToggleWaiting}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 0.5, sm: 1 },
                            backgroundColor: '#81c784',
                            color: '#1b5e20',
                            px: { xs: 1, sm: 2 },
                            py: { xs: 0.5, sm: 0.75 },
                            borderRadius: '24px',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.9 }
                        }}
                    >
                        <PeopleIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>Admit guest</Typography>
                    </Box>
                )}

                {/* TRANSCRIPTION BUTTON */}
                <Tooltip title="Transcribe call">
                    <IconButton
                        onClick={onToggleTranscript}
                        size="small"
                        sx={{
                            color: isTranscriptOpen ? '#8ab4f8' : '#fff',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            p: { xs: 0.75, sm: 1 },
                            '& svg': { fontSize: { xs: '1.1rem', sm: '1.4rem' } },
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.18)' }
                        }}
                    >
                        <DescriptionIcon />
                    </IconButton>
                </Tooltip>

                {/* PARTICIPANTS / PEOPLE PANEL BUTTON */}
                <Tooltip title="Show participants">
                    <IconButton
                        onClick={onTogglePeople}
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            p: { xs: 0.75, sm: 1 },
                            '& svg': { fontSize: { xs: '1.1rem', sm: '1.4rem' } },
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.18)' }
                        }}
                    >
                        <Badge badgeContent={activeCount} color="primary">
                            <PeopleIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}
