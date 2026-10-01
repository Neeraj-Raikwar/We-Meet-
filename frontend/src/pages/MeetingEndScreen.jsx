import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Alert, Box, Button, Paper, Snackbar, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import server from '../environment';

const BACKEND_URL = server.baseUrl;
const STAR_LABELS = ['Very bad', '', '', '', 'Very good'];

export default function MeetingEndScreen({ meetingCode, username, onRejoin }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState("");

    const handleSubmitFeedback = async () => {
        if (!rating && !feedback.trim()) return;
        setSubmitting(true);

        // Without an explicit timeout, fetch() will wait forever if the backend
        // hangs (e.g. a slow/blocked outbound SMTP connection while sending the
        // email) — that's what was leaving this button stuck on "Sending...".
        // Aborting after 15s guarantees the UI always recovers either way.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/meetings/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meetingCode, username, rating, feedback }),
                signal: controller.signal
            });
            if (!res.ok) throw new Error('Request failed');
            setSubmitted(true);
            setSnackbar("Thanks — your feedback has been sent!");
        } catch (e) {
            if (e.name === 'AbortError') {
                console.error("Feedback submit timed out after 15s");
                setSnackbar("This is taking too long — please try again in a moment.");
            } else {
                console.error("Feedback submit error:", e);
                setSnackbar("Couldn't send feedback right now. Please try again later.");
            }
        } finally {
            clearTimeout(timeoutId);
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#ffffff', p: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 500, color: '#202124', mb: 3, textAlign: 'center' }}>
                You've left the meeting
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                    variant="outlined"
                    onClick={onRejoin}
                    sx={{ borderRadius: '24px', textTransform: 'none', fontWeight: 600, px: 3, borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}
                >
                    Rejoin
                </Button>
                <Button
                    variant="contained"
                    onClick={() => window.location.href = "/home"}
                    sx={{ borderRadius: '24px', textTransform: 'none', fontWeight: 600, px: 3, bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' } }}
                >
                    Return to home screen
                </Button>
            </Box>

            <Paper elevation={0} variant="outlined" sx={{ width: '100%', maxWidth: 420, borderRadius: '16px', p: 3, mb: 3 }}>
                {submitted ? (
                    <Typography variant="body1" sx={{ textAlign: 'center', color: '#188038', fontWeight: 600, py: 1 }}>
                        Thanks for your feedback! 🎉
                    </Typography>
                ) : (
                    <>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#202124', mb: 2, textAlign: 'center' }}>
                            How was the audio and video?
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Box
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    sx={{ cursor: 'pointer', color: (hoverRating || rating) >= star ? '#fbbc04' : '#bdc1c6' }}
                                >
                                    {(hoverRating || rating) >= star ? <StarIcon sx={{ fontSize: '2rem' }} /> : <StarBorderIcon sx={{ fontSize: '2rem' }} />}
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5, mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#5f6368' }}>{STAR_LABELS[0]}</Typography>
                            <Typography variant="caption" sx={{ color: '#5f6368' }}>{STAR_LABELS[4]}</Typography>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="Anything else you'd like to share? (optional)"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            disabled={submitting || (!rating && !feedback.trim())}
                            onClick={handleSubmitFeedback}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' } }}
                        >
                            {submitting ? 'Sending...' : 'Send feedback'}
                        </Button>
                    </>
                )}
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%', maxWidth: 420, bgcolor: '#f8f9fa', borderRadius: '12px', p: 2 }}>
                <LockIcon sx={{ color: '#1a73e8', fontSize: '1.3rem', mt: 0.2 }} />
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#202124' }}>Your meeting is safe</Typography>
                    <Typography variant="caption" sx={{ color: '#5f6368' }}>
                        No one can join a meeting unless invited or admitted by the host.
                    </Typography>
                </Box>
            </Box>

            <Snackbar open={!!snackbar} autoHideDuration={3500} onClose={() => setSnackbar("")}>
                <Alert severity={submitted ? "success" : "info"}>{snackbar}</Alert>
            </Snackbar>
        </Box>
    );
}
