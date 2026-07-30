import CloseIcon from '@mui/icons-material/Close';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import SendIcon from '@mui/icons-material/Send';
import { Box, Button, IconButton, InputAdornment, Menu, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const EMOJI_LIST = ['😀', '😂', '😍', '👍', '👏', '🔥', '🎉', '❤️', '🙌', '💡'];

export default function ChatDrawer({ isOpen, onClose, messages, message, setMessage, sendMessage }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const messagesEndRef = useRef(null);

    // Automatically scroll to the latest message on new message receive or panel open
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    if (!isOpen) return null;

    const handleEmojiClick = (emoji) => {
        setMessage(prev => prev + emoji);
        setAnchorEl(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (message.trim()) {
                sendMessage();
            }
        }
    };

    const handleSendClick = () => {
        if (message.trim()) {
            sendMessage();
        }
    };

    return (
        <Paper
            elevation={4}
            sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bottom: 80,
                width: { xs: 'calc(100vw - 32px)', sm: 360 },
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
            {/* DRAWER HEADER */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#202124' }}>
                    In-call messages
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#5f6368' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* MESSAGES CONTAINER */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#ffffff' }}>
                {messages.length > 0 ? (
                    messages.map((item, index) => {
                        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            <Box key={index} sx={{ backgroundColor: '#f1f3f4', p: 1.5, borderRadius: '12px', width: '100%', boxSizing: 'border-box' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a73e8', fontSize: '0.8rem' }}>
                                        {item.sender}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                                        {currentTime}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: '#3c4043', wordBreak: 'break-word', lineHeight: 1.4 }}>
                                    {item.data}
                                </Typography>
                            </Box>
                        );
                    })
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', px: 2 }}>
                        <Typography variant="body2" sx={{ color: '#80868b', textAlign: 'center', fontSize: '0.875rem', lineHeight: 1.5 }}>
                            Messages can only be seen by people in the call and are deleted when the call ends.
                        </Typography>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* MESSAGE INPUT & EMOJI ACTION BAR */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1, alignItems: 'center', bgcolor: '#ffffff' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Send a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                                        <InsertEmoticonIcon sx={{ color: '#5f6368', fontSize: '1.25rem' }} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '24px',
                            bgcolor: '#f8f9fa',
                            '& fieldset': { borderColor: '#dadce0' },
                            '&:hover fieldset': { borderColor: '#bdc1c6' },
                            '&.Mui-focused fieldset': { borderColor: '#1a73e8' }
                        }
                    }}
                />

                <Button
                    variant="contained"
                    onClick={handleSendClick}
                    disabled={!message.trim()}
                    sx={{
                        borderRadius: '24px',
                        textTransform: 'none',
                        px: 2.5,
                        py: 1,
                        minWidth: 'auto',
                        bgcolor: '#1a73e8',
                        '&:hover': { bgcolor: '#1557b0' },
                        '&.Mui-disabled': { bgcolor: '#f1f3f4', color: '#3c4043', opacity: 0.6 }
                    }}
                >
                    <SendIcon sx={{ fontSize: '1.1rem' }} />
                </Button>

                {/* EMOJI PICKER POPUP MENU */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    slotProps={{
                        paper: { sx: { p: 1, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' } }
                    }}
                >
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
                        {EMOJI_LIST.map((emoji, i) => (
                            <MenuItem
                                key={i}
                                onClick={() => handleEmojiClick(emoji)}
                                sx={{ fontSize: '1.3rem', justifyContent: 'center', p: 1, borderRadius: '8px' }}
                            >
                                {emoji}
                            </MenuItem>
                        ))}
                    </Box>
                </Menu>
            </Box>
        </Paper>
    );
}
