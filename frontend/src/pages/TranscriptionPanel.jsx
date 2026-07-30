import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import { Box, Chip, IconButton, Paper, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';

export default function TranscriptionPanel({ onClose, username, transcripts = [] }) {
    const transcriptEndRef = useRef(null);

    // Auto-scroll to latest speech-to-text entry
    useEffect(() => {
        if (transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [transcripts]);

    return (
        <Paper
            elevation={8}
            sx={{
                position: 'absolute',
                top: '80px',
                right: '20px',
                width: { xs: 'calc(100vw - 40px)', sm: '360px' },
                maxHeight: 'calc(100vh - 180px)',
                backgroundColor: '#202124',
                color: '#fff',
                borderRadius: '16px',
                p: 2.5,
                zIndex: 999,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
        >
            {/* PANEL HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        Transcribing
                    </Typography>
                    <Chip
                        label="LIVE"
                        size="small"
                        sx={{
                            height: '20px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: '#ea4335',
                            color: '#fff'
                        }}
                    />
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#9aa0a6', '&:hover': { color: '#fff' } }}>
                    <CloseIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
            </Box>

            {/* DESCRIPTION INFO */}
            <Typography variant="body2" sx={{ color: '#bdc1c6', mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                This call is being transcribed and will be saved in <strong style={{ color: '#fff' }}>{username || 'Host'}'s Google Drive</strong>.
            </Typography>

            {/* STATUS CARDS */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', p: 1.5, borderRadius: '10px', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <DescriptionIcon sx={{ color: '#f48fb1', fontSize: '1.4rem' }} />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Active Speech-to-Text</Typography>
                        <Typography variant="caption" sx={{ color: '#9aa0a6' }}>Language: English (US)</Typography>
                    </Box>
                </Box>
            </Box>

            {/* DYNAMIC TRANSCRIPTS LIST / STREAM AREA */}
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, pr: 0.5 }}>
                {transcripts.length > 0 ? (
                    transcripts.map((t, index) => (
                        <Box key={index} sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 1.2, borderRadius: '8px' }}>
                            <Typography variant="caption" sx={{ color: '#8ab4f8', fontWeight: 700, display: 'block', mb: 0.3 }}>
                                {t.sender || 'Participant'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#e8eaed', fontSize: '0.85rem' }}>
                                {t.text}
                            </Typography>
                        </Box>
                    ))
                ) : (
                    <Box sx={{ py: 3, textAlign: 'center', color: '#80868b' }}>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            Listening for spoken text...
                        </Typography>
                    </Box>
                )}
                <div ref={transcriptEndRef} />
            </Box>
        </Paper>
    );
}
