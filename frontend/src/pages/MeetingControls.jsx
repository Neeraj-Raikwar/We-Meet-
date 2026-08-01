import { Badge, Box, IconButton, Paper, Tooltip } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import PanToolIcon from '@mui/icons-material/PanTool';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

const REACTION_EMOJIS = ['💖', '👍', '🎉', '👏', '😂', '😮', '😢', '🤔'];

export default function MeetingControls({
    video, audio, screen, isScreenSharer, isHost, isHandRaised, screenAvailable, newMessages, showModal,
    onToggleVideo, onToggleAudio, onToggleScreen, onToggleHand, onEndCall, onToggleChat, onSendReaction
}) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    const handleReactionClick = (emoji) => {
        if (onSendReaction) onSendReaction(emoji);
        setShowEmojiPicker(false);
    };

    return (
        <Box sx={{
            height: { xs: '68px', sm: '80px' },
            bgcolor: '#202124',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 100,
            px: { xs: 0.5, sm: 2 },
            boxSizing: 'border-box'
        }}>
            {showEmojiPicker && (
                <Paper
                    ref={emojiPickerRef}
                    elevation={6}
                    sx={{
                        position: 'absolute',
                        bottom: { xs: '78px', sm: '90px' },
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: '#ffffff',
                        borderRadius: '30px',
                        p: { xs: '4px 10px', sm: '6px 16px' },
                        display: 'flex',
                        gap: { xs: 0.75, sm: 1.5 },
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        alignItems: 'center',
                        zIndex: 110,
                        maxWidth: 'calc(100vw - 24px)',
                        overflowX: 'auto'
                    }}
                >
                    {REACTION_EMOJIS.map((emoji, index) => (
                        <Box
                            key={index}
                            onClick={() => handleReactionClick(emoji)}
                            sx={{
                                fontSize: { xs: '1.3rem', sm: '1.6rem' },
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                flexShrink: 0,
                                '&:hover': { transform: 'scale(1.3)' }
                            }}
                        >
                            {emoji}
                        </Box>
                    ))}
                </Paper>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 0.5, sm: 2 }, mx: 'auto', maxWidth: '100%', overflowX: 'auto' }}>
                {/* Audio */}
                <Tooltip title={audio ? "Turn off microphone" : "Turn on microphone"}>
                    <IconButton onClick={onToggleAudio} sx={{ bgcolor: audio ? '#3c4043' : '#ea4335', color: '#fff', p: { xs: 1, sm: 1.5 }, '& svg': { fontSize: { xs: '1.15rem', sm: '1.5rem' } }, '&:hover': { bgcolor: audio ? '#4a4e51' : '#dc2626' } }}>
                        {audio ? <MicIcon /> : <MicOffIcon />}
                    </IconButton>
                </Tooltip>

                {/* Video */}
                <Tooltip title={video ? "Turn off camera" : "Turn on camera"}>
                    <IconButton onClick={onToggleVideo} sx={{ bgcolor: video ? '#3c4043' : '#ea4335', color: '#fff', p: { xs: 1, sm: 1.5 }, '& svg': { fontSize: { xs: '1.15rem', sm: '1.5rem' } }, '&:hover': { bgcolor: video ? '#4a4e51' : '#dc2626' } }}>
                        {video ? <VideocamIcon /> : <VideocamOffIcon />}
                    </IconButton>
                </Tooltip>

                {/* Screen Share Guard */}
                {screenAvailable && (
                    <Tooltip title={screen ? (isScreenSharer ? "Stop presenting" : "Someone else is presenting") : "Present screen"}>
                        <span>
                            <IconButton
                                onClick={onToggleScreen}
                                disabled={!isHost && !isScreenSharer} // Only host or current sharer can start/stop
                                sx={{
                                    bgcolor: (screen && isScreenSharer) ? '#ea4335' : (screen ? '#3c4043' : '#3c4043'),
                                    color: '#fff',
                                    p: { xs: 1, sm: 1.5 },
                                    '& svg': { fontSize: { xs: '1.15rem', sm: '1.5rem' } },
                                    '&.Mui-disabled': { bgcolor: '#282a2d', color: '#5f6368', opacity: 0.5 }
                                }}
                            >
                                {screen && isScreenSharer ? <StopScreenShareIcon /> : <PresentToAllIcon />}
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {/* Hand Raise */}
                <Tooltip title={isHandRaised ? "Lower hand" : "Raise hand"}>
                    <IconButton onClick={onToggleHand} sx={{ bgcolor: isHandRaised ? '#8ab4f8' : '#3c4043', color: isHandRaised ? '#202124' : '#fff', p: { xs: 1, sm: 1.5 }, '& svg': { fontSize: { xs: '1.15rem', sm: '1.5rem' } } }}>
                        <PanToolIcon />
                    </IconButton>
                </Tooltip>

                {/* Emoji Reaction */}
                <Tooltip title="Send a reaction">
                    <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)} sx={{ bgcolor: showEmojiPicker ? '#8ab4f8' : '#3c4043', color: showEmojiPicker ? '#202124' : '#fff', p: { xs: 1, sm: 1.5 }, '& svg': { fontSize: { xs: '1.15rem', sm: '1.5rem' } } }}>
                        <SentimentSatisfiedAltIcon />
                    </IconButton>
                </Tooltip>

                {/* Chat — moved into the row (was absolutely positioned and overlapping End Call on narrow screens) */}
                <Tooltip title="Chat with everyone">
                    <IconButton onClick={onToggleChat} sx={{ bgcolor: showModal ? '#8ab4f8' : '#3c4043', color: showModal ? '#202124' : '#fff', p: { xs: 1, sm: 1.5 }, '& svg': { fontSize: { xs: '1.15rem', sm: '1.5rem' } } }}>
                        <Badge badgeContent={newMessages} color="error">
                            <ChatIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* End Call */}
                <Tooltip title="Leave call">
                    <IconButton onClick={onEndCall} sx={{ bgcolor: '#ea4335', color: '#fff', px: { xs: 1.5, sm: 2.5 }, py: { xs: 1, sm: 1.5 }, borderRadius: '24px', flexShrink: 0, '& svg': { fontSize: { xs: '1.15rem', sm: '1.5rem' } }, '&:hover': { bgcolor: '#dc2626' } }}>
                        <CallEndIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}
