import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    IconButton,
    Paper,
    Toolbar,
    Tooltip,
    Typography
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';

import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const { darkMode, toggleTheme } = useContext(ThemeContext);
    const [meetings, setMeetings] = useState([]);
    const navigate = useNavigate();

    // Fetch meeting history on component mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                if (getHistoryOfUser) {
                    const history = await getHistoryOfUser();
                    setMeetings(history || []);
                }
            } catch (err) {
                console.error("Failed to load meeting history:", err);
            }
        };

        fetchHistory();
    }, [getHistoryOfUser]);

    // Date Formatter Utility
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Duration comes from the backend in seconds (e.duration). Older records that
    // don't have it yet will simply skip showing a duration badge.
    const formatDuration = (totalSeconds) => {
        if (totalSeconds === undefined || totalSeconds === null || isNaN(totalSeconds)) return null;
        const mins = Math.floor(totalSeconds / 60);
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        if (hrs > 0) return `${hrs}h ${remMins}m`;
        if (mins > 0) return `${mins}m`;
        return `${Math.max(totalSeconds, 0)}s`;
    };

    // Summary stats derived from whatever history data is available
    const totalMeetings = meetings.length;
    const now = new Date();
    const meetingsThisMonth = meetings.filter(e => {
        const d = new Date(e.date);
        return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const totalDurationSeconds = meetings.reduce((sum, e) => sum + (Number(e.duration) || 0), 0);
    const hasDurationData = meetings.some(e => e.duration !== undefined && e.duration !== null);

    // Delete Record Handler
    const handleDeleteRecord = (eventIndex) => {
        const userConfirmation = window.confirm("Are you sure you want to remove this meeting record from history?");
        if (!userConfirmation) return;

        try {
            setMeetings(prev => prev.filter((_, idx) => idx !== eventIndex));
        } catch (error) {
            console.error("Error deleting meeting record:", error);
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: darkMode ? '#121212' : '#f8fafc',
            color: darkMode ? '#ffffff' : '#0f172a',
            transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>

            {/* TOP NAVIGATION BAR */}
            <AppBar position="static" elevation={0} sx={{
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                borderBottom: '1px solid var(--nav-border)',
                color: darkMode ? '#ffffff' : '#0f172a',
                transition: 'background-color 0.3s ease'
            }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '70px' }}>

                        {/* BRAND LOGO */}
                        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate("/home")}>
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: darkMode ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span className="live-logo-icon" style={{ fontSize: '1.4rem' }}>🔵</span>
                                We<span style={{ color: "#2563eb" }}>Meet</span>
                            </Typography>
                        </Box>

                        {/* NAV ACTIONS */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                startIcon={<HomeIcon />}
                                onClick={() => navigate("/home")}
                                size="medium"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    color: '#2563eb',
                                    borderRadius: '8px'
                                }}
                            >
                                Home
                            </Button>

                            <IconButton onClick={toggleTheme} color="inherit" sx={{ border: '1px solid', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                {darkMode ? <Brightness7Icon sx={{ color: '#f59e0b' }} /> : <Brightness4Icon />}
                            </IconButton>
                        </Box>

                    </Toolbar>
                </Container>
            </AppBar>

            {/* MAIN CONTENT AREA */}
            <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>

                {/* PAGE HEADER */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                        <HistoryIcon />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: darkMode ? '#ffffff' : '#0f172a', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                            Meeting Logs & History
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                            A summary of every session you've joined or hosted
                        </Typography>
                    </Box>
                </Box>

                {/* SUMMARY STATS ROW */}
                <Grid container spacing={2.5} sx={{ mb: 5 }}>
                    {[
                        { label: 'Total Meetings', value: totalMeetings, icon: <HistoryIcon /> },
                        { label: 'This Month', value: meetingsThisMonth, icon: <CalendarMonthIcon /> },
                        ...(hasDurationData ? [{ label: 'Total Time Spent', value: formatDuration(totalDurationSeconds) || '0m', icon: <AccessTimeIcon /> }] : [])
                    ].map((stat, idx) => (
                        <Grid item xs={12} sm={hasDurationData ? 4 : 6} key={idx}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    borderRadius: '14px',
                                    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'var(--nav-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Box sx={{ p: 1.2, borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex' }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: darkMode ? '#ffffff' : '#0f172a', lineHeight: 1.2 }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* MEETING CARDS GRID */}
                {meetings.length > 0 ? (
                    <Grid container spacing={4}>
                        {meetings.map((e, i) => (
                            <Grid item xs={12} sm={6} md={4} key={e._id || i}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        borderRadius: '14px',
                                        borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'var(--nav-border)',
                                        background: darkMode ? '#1e1e1e' : '#ffffff',
                                        boxShadow: darkMode ? '0 4px 25px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.02)',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: darkMode ? '0 12px 24px rgba(0,0,0,0.6)' : '0 12px 24px rgba(0,0,0,0.06)',
                                            borderColor: '#2563eb'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3, pr: 6, position: 'relative' }}>

                                        {/* DELETE LOG BUTTON */}
                                        <Tooltip title="Delete record" placement="top">
                                            <IconButton
                                                onClick={() => handleDeleteRecord(i)}
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    color: darkMode ? '#94a3b8' : '#64748b',
                                                    border: '1px solid',
                                                    borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'var(--nav-border)',
                                                    '&:hover': { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: '#ef4444' }
                                                }}
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: '1.1rem' }} />
                                            </IconButton>
                                        </Tooltip>

                                        {/* CARD METADATA */}
                                        <Typography variant="caption" display="block" sx={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#2563eb', mb: 1, fontSize: '0.75rem' }}>
                                            Conference Code
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.5px', color: darkMode ? '#ffffff' : '#0f172a' }}>
                                                {e.meetingCode || e.code || 'N/A'}
                                            </Typography>
                                            {formatDuration(e.duration) && (
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#16a34a', bgcolor: 'rgba(22, 163, 74, 0.1)', px: 1, py: 0.3, borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                                    {formatDuration(e.duration)}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'var(--nav-border)', pt: 2, mt: 1 }}>
                                            <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                                                Joined:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                                {formatDate(e.date)}{formatTime(e.date) ? ` · ${formatTime(e.date)}` : ''}
                                            </Typography>
                                        </Box>

                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    /* EMPTY STATE */
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 10,
                            px: 2,
                            border: '2px dashed',
                            borderColor: 'var(--nav-border)',
                            borderRadius: '16px',
                            background: darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                            mt: 2
                        }}
                    >
                        <HistoryIcon sx={{ fontSize: '4rem', color: '#94a3b8', opacity: 0.4, mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: darkMode ? '#ffffff' : '#0f172a' }}>
                            No Meeting Logs Found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', maxWidth: '360px' }}>
                            Your previous call history and meeting logs will appear here once you join or create a session.
                        </Typography>
                    </Box>
                )}
            </Container>

            {/* FOOTER */}
            <Box component="footer" sx={{
                width: '100%',
                textAlign: 'center',
                paddingBlock: '2.5rem',
                borderTop: '1px solid var(--nav-border)',
                marginTop: 'auto',
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                transition: 'background-color 0.3s ease'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '12px' }}>
                    <span style={{ color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '500' }}>Help</span>
                    <span style={{ color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '500' }}>Terms</span>
                    <span style={{ color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '500' }}>Privacy</span>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto', paddingInline: '1rem', fontWeight: '400' }}>
                    WeMeet is protected by reCAPTCHA and the Google <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}>Privacy Policy</span> and <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}>Terms of Service</span> apply.
                </Typography>
            </Box>

        </Box>
    );
}
