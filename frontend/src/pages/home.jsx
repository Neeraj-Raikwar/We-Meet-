import { Box, Button, Card, Container, Divider, IconButton, TextField, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LoginIcon from '@mui/icons-material/Login';
import RestoreIcon from '@mui/icons-material/Restore';
import VideoCallIcon from '@mui/icons-material/VideoCall';

import "../App.css";
import { AuthContext } from '../contexts/AuthContext';
import withAuth from '../utils/withAuth';

function HomeComponent() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    // Auth verification check
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth");
        }
    }, [navigate]);

    // Create unique room code & shareable link
    const handleCreateNewMeeting = async () => {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        const generatePart = (length) => Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');

        const newGeneratedCode = `wmt-${generatePart(3)}-${generatePart(3)}`;
        const currentDomain = window.location.origin;
        const fullShareableLink = `${currentDomain}/${newGeneratedCode}`;

        setMeetingCode(newGeneratedCode);
        setGeneratedLink(fullShareableLink);

        if (addToUserHistory) {
            try {
                await addToUserHistory(newGeneratedCode);
            } catch (error) {
                console.error("History logging error: ", error);
            }
        }
    };

    // Extract room ID and join call
    const handleJoinVideoCall = async () => {
        if (!meetingCode || !meetingCode.trim()) {
            alert("Please enter a valid Meeting Code or URL link!");
            return;
        }

        let extractedCode = meetingCode.trim().toLowerCase();

        if (extractedCode.includes('/')) {
            const urlParts = extractedCode.split('/');
            extractedCode = urlParts[urlParts.length - 1];
        }

        if (addToUserHistory) {
            try {
                await addToUserHistory(extractedCode);
            } catch (e) {
                console.error("Trace logging error: ", e);
            }
        }

        navigate(`/${extractedCode}`);
    };

    // Copy link helper
    const copyToClipboardShortcut = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        alert("Invite link copied to clipboard!");
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f9' }}>

            {/* NAVBAR */}
            <Box component="nav" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: { xs: 3, md: 6 },
                height: '70px',
                bgcolor: '#ffffff',
                borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: '#2563eb',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'pulse 2s infinite ease-in-out',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.7)' },
                                '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(37, 99, 235, 0)' },
                                '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(37, 99, 235, 0)' },
                            }
                        }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                        We<span style={{ color: '#2563eb' }}>Meet</span>
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate("/history")}>
                        <IconButton color="primary" sx={{ p: 0.5 }}>
                            <RestoreIcon />
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', ml: 0.5 }}>History</Typography>
                    </Box>

                    <Button
                        variant="text"
                        color="error"
                        sx={{ fontWeight: 700, textTransform: 'none' }}
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>

            {/* CENTERED MAIN CONTENT CONTAINER WITH BALANCED MARGINS */}
            <Container
                maxWidth="xl"
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4
                }}
            >
                <Box sx={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 4, md: 6 }
                }}>

                    {/* LEFT WORKSPACE PANEL */}
                    <Box sx={{ flex: 1.2, maxWidth: { md: '600px' }, width: '100%' }}>
                        <Typography variant="h3" sx={{ fontWeight: 950, mb: 1, lineHeight: 1.2, letterSpacing: '-1.5px', color: '#1a1a1a', fontSize: { xs: '2rem', md: '3rem' } }}>
                            Premium Video Conferencing.
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, color: '#2563eb', letterSpacing: '-0.5px', fontSize: { xs: '1.4rem', md: '2rem' } }}>
                            Now Available Free For Everyone.
                        </Typography>

                        <Card elevation={0} sx={{ p: { xs: 3, sm: 4 }, bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>

                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                startIcon={<VideoCallIcon />}
                                onClick={handleCreateNewMeeting}
                                sx={{ py: 1.6, borderRadius: '8px', fontWeight: 700, textTransform: 'none', fontSize: '1.05rem', boxShadow: 'none', '&:hover': { boxShadow: 'none', bgcolor: '#1d4ed8' } }}
                            >
                                Create an Instant Meeting Room
                            </Button>

                            {generatedLink && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ overflow: 'hidden', mr: 2 }}>
                                        <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Invite Link Ready:</Typography>
                                        <Typography variant="body2" noWrap sx={{ color: '#14532d', fontFamily: 'monospace', fontWeight: 600 }}>{generatedLink}</Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        startIcon={<ContentCopyIcon sx={{ fontSize: '0.9rem' }} />}
                                        onClick={copyToClipboardShortcut}
                                        sx={{ textTransform: 'none', fontWeight: 700, px: 2, whiteSpace: 'nowrap', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                                    >
                                        Copy Link
                                    </Button>
                                </Box>
                            )}

                            <Divider sx={{ my: 3 }}>
                                <Typography variant="caption" sx={{ color: '#666', px: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Or Join Existing Session
                                </Typography>
                            </Divider>

                            <Box sx={{ display: 'flex', gap: "15px", alignItems: 'flex-end', width: '100%', flexDirection: { xs: 'column', sm: 'row' } }}>
                                <TextField
                                    fullWidth
                                    onChange={e => setMeetingCode(e.target.value)}
                                    id="standard-basic"
                                    label="Enter Meeting Code or Paste Link"
                                    variant="standard"
                                    value={meetingCode}
                                    placeholder="e.g. wmt-abc-xyz"
                                    slotProps={{
                                        inputLabel: { shrink: true }
                                    }}
                                    sx={{ '& input': { fontSize: '1.1rem' } }}
                                />
                                <Button
                                    onClick={handleJoinVideoCall}
                                    variant='outlined'
                                    color="primary"
                                    startIcon={<LoginIcon />}
                                    sx={{
                                        py: 1.1,
                                        px: 4,
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        borderWidth: '2px',
                                        width: { xs: '100%', sm: 'auto' },
                                        '&:hover': { borderWidth: '2px' }
                                    }}
                                >
                                    Join
                                </Button>
                            </Box>
                        </Card>
                    </Box>

                    {/* RIGHT GRAPHIC PANEL */}
                    <Box sx={{ flex: 0.8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src='/logo3.png'
                            alt="WeMeet Dashboard Asset"
                            sx={{ width: '100%', maxWidth: '480px', height: 'auto', objectFit: 'contain' }}
                        />
                    </Box>

                </Box>
            </Container>
        </Box>
    );
}

export default withAuth(HomeComponent);
