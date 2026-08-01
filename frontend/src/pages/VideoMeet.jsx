import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogContent,
    IconButton,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";

import CloseIcon from '@mui/icons-material/Close';
import DevicesIcon from '@mui/icons-material/Devices';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import PanToolIcon from '@mui/icons-material/PanTool';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

import ChatDrawer from './ChatDrawer';
import MeetingControls from './MeetingControls';
import MeetingEndScreen from './MeetingEndScreen';
import MeetingTopBar from './MeetingTopBar';
import Navbar from './Navbar';
import PeoplePanel from './PeoplePanel';
import TranscriptionPanel from './TranscriptionPanel';
import WaitingUsersPanel from './WaitingUsersPanel';

import server from '../environment';
import { startScreenSharing, stopScreenSharing } from './ScreenShareManager';
import { boostAudioQuality } from './webrtcUtils';

const SERVER_URL = server.baseUrl;
let connections = {};
const peerConfigConnections = {
    "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }]
};

// Reaction emoji float-up animation. Using MUI's `keyframes` helper (backed by
// emotion, which MUI already ships with) instead of a raw <style> tag — this
// guarantees the animation is registered before anything tries to use it and
// avoids relying on untracked global CSS.
const floatUpAnimation = keyframes`
    0%   { transform: translateY(0) translateX(0) scale(0.7) rotate(0deg); opacity: 0; }
    10%  { opacity: 1; }
    100% { transform: translateY(-420px) translateX(var(--drift, 0px)) scale(1.3) rotate(var(--spin, 0deg)); opacity: 0; }
`;

const handPulseAnimation = keyframes`
    0%   { transform: scale(1); }
    50%  { transform: scale(1.1); }
    100% { transform: scale(1); }
`;

export default function VideoMeetComponent() {
    let socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    let screenVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(false);
    let [audioAvailable, setAudioAvailable] = useState(false);

    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState(false);
    let [isScreenSharer, setIsScreenSharer] = useState(false);
    let [screenSharerId, setScreenSharerId] = useState(null);
    let [localScreenStream, setLocalScreenStream] = useState(null);

    let [showModal, setModal] = useState(false);
    let [showPeoplePanel, setShowPeoplePanel] = useState(false);
    let [showTranscriptPanel, setShowTranscriptPanel] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");

    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    let [permissionPromptOpen, setPermissionPromptOpen] = useState(true);
    const [myStream, setMyStream] = useState(null);

    const [isHost, setIsHost] = useState(false);
    const [hostSocketId, setHostSocketId] = useState(null);
    const [isWaitingToAdmit, setIsWaitingToAdmit] = useState(false);
    const [waitingUsers, setWaitingUsers] = useState([]);

    const [alertMessage, setAlertMessage] = useState("");
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [floatingEmojis, setFloatingEmojis] = useState([]);

    const [isAudioLocked, setIsAudioLocked] = useState(false);
    const [isVideoLocked, setIsVideoLocked] = useState(false);

    const [callEnded, setCallEnded] = useState(false);
    const callStartTimeRef = useRef(null);
    const [transcripts, setTranscripts] = useState([]);
    const recognitionRef = useRef(null);
    const usernameRef = useRef("");
    useEffect(() => { usernameRef.current = username; }, [username]);

    // Socket listeners below are registered once when the call connects, so they close
    // over whatever `isScreenSharer` was AT THAT TIME. This ref always holds the latest
    // value so the "attach-screen-request" handler can reliably tell if we're presenting.
    const isScreenSharerRef = useRef(false);
    useEffect(() => {
        isScreenSharerRef.current = isScreenSharer;
    }, [isScreenSharer]);

    useEffect(() => {
        return () => {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }
    }, [askForUsername, isWaitingToAdmit, myStream, video, screen]);

    useEffect(() => {
        if (screen && screenVideoref.current && localScreenStream) {
            screenVideoref.current.srcObject = localScreenStream;
        }
    }, [screen, localScreenStream]);

    // Live transcription: uses the browser's own Speech Recognition on the local
    // mic (this can only ever capture your own voice, not remote audio), and
    // broadcasts each finished line to everyone else in the room via socket.
    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!showTranscriptPanel) {
            if (recognitionRef.current) {
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            return;
        }

        if (!SpeechRecognitionAPI) {
            setAlertMessage("Live transcription isn't supported in this browser. Try Chrome or Edge.");
            return;
        }

        let stoppedIntentionally = false;
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    const text = event.results[i][0].transcript.trim();
                    if (!text) continue;
                    const sender = usernameRef.current || 'You';
                    setTranscripts(prev => [...prev, { sender, text }]);
                    socketRef.current?.emit('transcript-update', { text, sender, roomId: window.location.href });
                }
            }
        };

        recognition.onerror = (event) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.warn('Speech recognition error:', event.error);
            }
        };

        // The API stops itself after a pause in speech — restart it automatically
        // so transcription keeps running for the whole call.
        recognition.onend = () => {
            if (!stoppedIntentionally) {
                try { recognition.start(); } catch (e) { /* already running */ }
            }
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
        } catch (e) {
            console.warn('Could not start speech recognition:', e);
        }

        return () => {
            stoppedIntentionally = true;
            recognition.onend = null;
            recognition.stop();
        };
    }, [showTranscriptPanel]);

    const getPermissions = async () => {
        try {
            setPermissionPromptOpen(false);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: { ideal: 48000 },
                    sampleSize: 16,
                    channelCount: 1
                }
            });
            if (stream) {
                setVideoAvailable(true);
                setAudioAvailable(true);
                window.localStream = stream;
                setMyStream(stream);
                if (localVideoref.current) {
                    localVideoref.current.srcObject = stream;
                }
            }
            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
        } catch (error) {
            console.error("Media permission error: ", error);
            setVideoAvailable(false);
            setAudioAvailable(false);
        }
    };

    let connectToSocketServer = () => {
        socketRef.current = io.connect(SERVER_URL, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id;
            callStartTimeRef.current = Date.now();
            socketRef.current.emit('check-room-status', window.location.href, username);

            socketRef.current.on('room-role-response', (roleData) => {
                setHostSocketId(roleData.hostSocketId || socketRef.current.id);
                if (roleData.isHost) {
                    setIsHost(true);
                    setIsWaitingToAdmit(false);
                    socketRef.current.emit('join-call', window.location.href, username);
                } else {
                    setIsHost(false);
                    setIsWaitingToAdmit(true);
                    socketRef.current.emit('knock-admit-request', {
                        roomId: window.location.href,
                        username: username,
                        socketId: socketRef.current.id
                    });
                }
            });

            socketRef.current.on('receive-knock-request', (data) => {
                setWaitingUsers(prev => [...prev.filter(u => u.id !== data.socketId), { id: data.socketId, name: data.username }]);
            });

            socketRef.current.on('admit-decision', (decision) => {
                if (decision.allowed) {
                    setIsWaitingToAdmit(false);
                    socketRef.current.emit('join-call', window.location.href, username);
                } else {
                    alert("Entry denied by host.");
                    window.location.href = "/";
                }
            });

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on('hand-raise-update', ({ socketId, isHandRaised: remoteState }) => {
                if (socketId === socketIdRef.current) {
                    setIsHandRaised(remoteState);
                }
                setVideos(prev => prev.map(v => v.socketId === socketId ? { ...v, isHandRaised: remoteState } : v));
            });

            socketRef.current.on('emoji-reaction', (emoji) => {
                triggerEmojiAnimation(emoji);
            });

            // Each participant runs speech-to-text on their own mic locally (a browser
            // can't transcribe audio it isn't capturing), then broadcasts finished lines
            // here so everyone's transcript panel shows the full conversation.
            socketRef.current.on('transcript-update', ({ text, sender }) => {
                if (text) setTranscripts(prev => [...prev, { sender: sender || 'Participant', text }]);
            });

            socketRef.current.on('screen-share-status', ({ sharerSocketId, isSharing }) => {
                setScreen(isSharing);
                setScreenSharerId(isSharing ? sharerSocketId : null);
                setIsScreenSharer(isSharing && sharerSocketId === socketIdRef.current);
                if (!isSharing) {
                    // Drop the old screen stream reference so a stale/frozen frame
                    // never lingers into the next screen-share session.
                    setVideos(prev => prev.map(v => v.screenStream ? { ...v, screenStream: null } : v));
                }
            });

            socketRef.current.on('screen-share-start-denied', ({ reason }) => {
                setAlertMessage(reason || 'Not authorized to start screen share.');
            });

            socketRef.current.on('screen-share-stop-denied', ({ reason }) => {
                setAlertMessage(reason || 'Not authorized to stop screen share.');
            });

            socketRef.current.on('attach-screen-request', ({ requesterId }) => {
                if (!requesterId) return;
                if (isScreenSharerRef.current && window.localScreenStream && connections[requesterId]) {
                    window.localScreenStream.getTracks().forEach(track => {
                        try {
                            const sender = connections[requesterId].addTrack(track, window.localScreenStream);
                            window.screenShareSenders = window.screenShareSenders || {};
                            window.screenShareSenders[requesterId] = sender;
                        } catch (e) {
                            console.warn('Failed to attach screen to requester', requesterId, e);
                        }
                    });
                    // Newly added tracks still need a fresh offer/answer before they're delivered.
                    connections[requesterId].createOffer().then((offer) => {
                        offer.sdp = boostAudioQuality(offer.sdp);
                        return connections[requesterId].setLocalDescription(offer).then(() => {
                            socketRef.current.emit('signal', requesterId, JSON.stringify({ 'sdp': connections[requesterId].localDescription }));
                        });
                    }).catch(e => console.warn('Renegotiation failed for late screen attach', requesterId, e));
                }
            });

            socketRef.current.on('screen-share-denied', ({ reason }) => {
                setAlertMessage(reason || 'Not authorized to stop the screen share.');
            });

            socketRef.current.on('force-kick-out', () => {
                alert("You have been removed from the meeting by the host.");
                window.location.href = "/";
            });

            socketRef.current.on('force-toggle-audio', ({ lockState }) => {
                const nextLock = lockState !== undefined ? lockState : !isAudioLocked;
                setIsAudioLocked(nextLock);
                setAudio(!nextLock);
                if (localVideoref.current && localVideoref.current.srcObject) {
                    localVideoref.current.srcObject.getAudioTracks().forEach(track => track.enabled = !nextLock);
                }
                setAlertMessage(nextLock ? "Host restricted your microphone." : "Host allowed your microphone.");
            });

            socketRef.current.on('force-toggle-video', ({ lockState }) => {
                const nextLock = lockState !== undefined ? lockState : !isVideoLocked;
                setIsVideoLocked(nextLock);
                setVideo(!nextLock);
                if (localVideoref.current && localVideoref.current.srcObject) {
                    localVideoref.current.srcObject.getVideoTracks().forEach(track => track.enabled = !nextLock);
                }
                setAlertMessage(nextLock ? "Host restricted your camera." : "Host allowed your camera.");
            });

            socketRef.current.on('user-left', (id) => {
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
                setVideos((videos) => videos.filter((v) => v.socketId !== id));
            });

            socketRef.current.on('user-joined', (id, clients, userMap, roomHostId) => {
                if (roomHostId) setHostSocketId(roomHostId);

                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return;
                    let remoteName = (userMap && userMap[socketListId]) ? userMap[socketListId] : "Participant";

                    if (!connections[socketListId]) {
                        connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                        connections[socketListId].onicecandidate = function (event) {
                            if (event.candidate != null) {
                                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                            }
                        };

                        connections[socketListId].ontrack = (event) => {
                            const incomingStream = event.streams[0];
                            const videoTrack = incomingStream.getVideoTracks()[0];
                            const isVideoActive = !!videoTrack;

                            setVideos(prev => {
                                const existing = prev.find(v => v.socketId === socketListId);

                                if (!existing) {
                                    // The very first stream we ever get from a peer is always their camera.
                                    const newVideo = {
                                        socketId: socketListId,
                                        cameraStream: incomingStream,
                                        screenStream: null,
                                        stream: incomingStream,
                                        name: remoteName,
                                        isVideoActive: isVideoActive,
                                        isHandRaised: false,
                                        isAudioLocked: false,
                                        isVideoLocked: false
                                    };
                                    const updated = [...prev.filter(v => v.socketId !== socketListId), newVideo];
                                    videoRef.current = updated;
                                    return updated;
                                } else {
                                    // A later, DIFFERENT stream (different MediaStream id) is the
                                    // screen-share stream — the camera keeps using its original stream.
                                    const isCameraStream = existing.cameraStream && incomingStream.id === existing.cameraStream.id;
                                    const updatedVideo = isCameraStream
                                        ? { ...existing, cameraStream: incomingStream, stream: incomingStream, isVideoActive }
                                        : { ...existing, screenStream: incomingStream, stream: incomingStream };
                                    const updated = prev.map(v => v.socketId === socketListId ? updatedVideo : v);
                                    videoRef.current = updated;
                                    return updated;
                                }
                            });
                        };

                        if (window.localStream) {
                            window.localStream.getTracks().forEach(track => {
                                connections[socketListId].addTrack(track, window.localStream);
                            });
                        }
                    } else {
                        setVideos(prev => prev.map(v => v.socketId === socketListId ? { ...v, name: remoteName } : v));
                    }
                });

                if (id !== socketIdRef.current && connections[id]) {
                    connections[id].createOffer().then((description) => {
                        description.sdp = boostAudioQuality(description.sdp);
                        connections[id].setLocalDescription(description).then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        });
                    });
                }
            });
        });
    };

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            description.sdp = boostAudioQuality(description.sdp);
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                            });
                        });
                    }
                }).catch(e => console.error("SDP Error: ", e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.error("ICE Error: ", e));
            }
        }
    };

    const handleKickUser = (targetSocketId) => {
        socketRef.current?.emit('admin-kick-user', { targetSocketId, roomId: window.location.href });
    };

    const handleToggleRemoteAudio = (targetSocketId) => {
        const targetUser = videos.find(v => v.socketId === targetSocketId);
        const nextLock = !targetUser?.isAudioLocked;
        setVideos(prev => prev.map(v => v.socketId === targetSocketId ? { ...v, isAudioLocked: nextLock } : v));
        socketRef.current?.emit('admin-toggle-audio', { targetSocketId, lockState: nextLock });
    };

    const handleToggleRemoteVideo = (targetSocketId) => {
        const targetUser = videos.find(v => v.socketId === targetSocketId);
        const nextLock = !targetUser?.isVideoLocked;
        setVideos(prev => prev.map(v => v.socketId === targetSocketId ? { ...v, isVideoLocked: nextLock } : v));
        socketRef.current?.emit('admin-toggle-video', { targetSocketId, lockState: nextLock });
    };

    const handleStrictMuteAll = () => {
        setVideos(prev => prev.map(v => ({ ...v, isAudioLocked: true, isVideoLocked: true })));
        socketRef.current?.emit('admin-strict-mute-all', { roomId: window.location.href });
        setAlertMessage("Strict Mode Activated: All participants muted and locked.");
    };

    const handleToggleScreenShare = async () => {
        if (screen && !isScreenSharer) {
            setAlertMessage("Only the current presenter can stop the screen share.");
            return;
        }

        const roomId = window.location.href;
        if (!screen) {
            const stream = await startScreenSharing({
                connections,
                setScreen,
                setIsScreenSharer,
                socketRef,
                roomId,
                screenVideoref,
                onStreamEnded: () => {
                    setLocalScreenStream(null);
                }
            });
            if (stream) {
                setLocalScreenStream(stream);
            }
        } else {
            await stopScreenSharing({ connections, setScreen, setIsScreenSharer, socketRef, roomId });
            setLocalScreenStream(null);
        }
    };

    const handleEndCall = () => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            if (window.localScreenStream) {
                window.localScreenStream.getTracks().forEach(track => track.stop());
            }
            Object.keys(connections).forEach(id => {
                try { connections[id].close(); } catch (e) { /* ignore */ }
            });
            connections = {};

            // Report how long we were actually in the call so History can show it.
            // Guests without an account (no token) simply skip this — there's no
            // history record to attach the duration to.
            const token = localStorage.getItem("token");
            if (token && callStartTimeRef.current) {
                const durationSeconds = Math.round((Date.now() - callStartTimeRef.current) / 1000);
                const meetingCode = window.location.pathname.split("/").pop();
                fetch(`${SERVER_URL}/api/v1/users/update_activity_duration`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, meeting_code: meetingCode, duration: durationSeconds })
                }).catch(e => console.warn('Could not report meeting duration:', e));
            }

            socketRef.current?.disconnect();
        } catch (e) {
            console.warn('Error while ending call:', e);
        }
        setCallEnded(true);
    };

    const triggerEmojiAnimation = (emoji) => {
        const id = Date.now() + Math.random();
        const leftOffset = Math.floor(Math.random() * 40) + 30; // 30%-70%, centered over the stage
        const drift = `${Math.floor(Math.random() * 120) - 60}px`; // gentle left/right drift
        const spin = `${Math.floor(Math.random() * 40) - 20}deg`; // slight rotation
        setFloatingEmojis(prev => [...prev, { id, emoji, left: `${leftOffset}%`, drift, spin }]);
        setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 2800);
    };

    const handleSendReaction = (emoji) => {
        triggerEmojiAnimation(emoji);
        socketRef.current?.emit('emoji-reaction', emoji);
    };

    const toggleLocalHand = () => {
        const nextState = !isHandRaised;
        setIsHandRaised(nextState);
        socketRef.current?.emit('hand-raise-update', {
            roomId: window.location.href,
            isHandRaised: nextState,
            socketId: socketIdRef.current
        });
    };

    const handleAdmitUser = (guestSocketId) => {
        const targetId = typeof guestSocketId === 'string' ? guestSocketId : waitingUsers[0]?.id;
        if (!targetId) return;
        socketRef.current.emit('approve-guest', { guestSocketId: targetId, allowed: true, roomId: window.location.href });
        setWaitingUsers(prev => prev.filter(u => u.id !== targetId));
    };

    const handleDenyUser = (guestSocketId) => {
        const targetId = typeof guestSocketId === 'string' ? guestSocketId : waitingUsers[0]?.id;
        if (!targetId) return;
        socketRef.current.emit('approve-guest', { guestSocketId: targetId, allowed: false, roomId: window.location.href });
        setWaitingUsers(prev => prev.filter(u => u.id !== targetId));
    };

    let handleVideo = async () => {
        const nextVideoState = !videoAvailable;
        setVideoAvailable(nextVideoState);
        setVideo(nextVideoState);
        if (localVideoref.current && localVideoref.current.srcObject) {
            localVideoref.current.srcObject.getVideoTracks().forEach(track => track.enabled = nextVideoState);
        }
    };

    let handleAudio = async () => {
        const nextAudioState = !audioAvailable;
        setAudioAvailable(nextAudioState);
        setAudio(nextAudioState);
        if (localVideoref.current && localVideoref.current.srcObject) {
            localVideoref.current.srcObject.getAudioTracks().forEach(track => track.enabled = nextAudioState);
        }
    };

    let handleRoomVideoToggle = () => {
        if (isVideoLocked) {
            setAlertMessage("Your camera is restricted by the meeting host.");
            return;
        }
        const nextState = !video;
        setVideo(nextState);
        if (localVideoref.current && localVideoref.current.srcObject) {
            localVideoref.current.srcObject.getVideoTracks().forEach(track => track.enabled = nextState);
        }
    };

    let handleRoomAudioToggle = () => {
        if (isAudioLocked) {
            setAlertMessage("Your microphone is restricted by the meeting host.");
            return;
        }
        const nextState = !audio;
        setAudio(nextState);
        if (localVideoref.current && localVideoref.current.srcObject) {
            localVideoref.current.srcObject.getAudioTracks().forEach(track => track.enabled = nextState);
        }
    };

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prev) => [...prev, { sender, data }]);
        if (socketIdSender !== socketIdRef.current && !showModal) {
            setNewMessages((prev) => prev + 1);
        }
    };

    let sendMessage = () => {
        if (message.trim()) {
            socketRef.current.emit('chat-message', message, username);
            setMessage("");
        }
    };

    let connect = () => {
        if (!username.trim()) {
            setAlertMessage("Please enter your name first!");
            return;
        }
        setAskForUsername(false);
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    const presenterVideo = videos.find(v => v.socketId === screenSharerId);
    const hostRemoteVideo = videos.find(v => v.socketId === hostSocketId) || videos[0];

    const mainDisplaySocketId = isHost ? socketIdRef.current : hostRemoteVideo?.socketId;
    const pipParticipants = videos.filter(v => v.socketId !== mainDisplaySocketId);

    if (callEnded) {
        return (
            <MeetingEndScreen
                meetingCode={window.location.pathname.split("/").pop()}
                username={username}
                onRejoin={() => window.location.reload()}
            />
        );
    }

    return (
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', bgcolor: askForUsername ? 'var(--bg-primary)' : '#202124', color: 'var(--text-primary)', overflow: 'hidden' }}>

            <Snackbar open={!!alertMessage} autoHideDuration={3000} onClose={() => setAlertMessage("")}>
                <Alert severity="warning">{alertMessage}</Alert>
            </Snackbar>

            <Dialog open={permissionPromptOpen} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '24px', p: 2 } } }}>
                <IconButton onClick={() => setPermissionPromptOpen(false)} sx={{ position: 'absolute', right: 16, top: 16 }}><CloseIcon /></IconButton>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <DevicesIcon sx={{ fontSize: '4.5rem', color: '#2563eb', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 500, mb: 1.5 }}>Allow Camera and Microphone</Typography>
                    <Button variant="contained" onClick={getPermissions} sx={{ bgcolor: '#1a73e8', textTransform: 'none', px: 4, py: 1.5, borderRadius: '100px' }}>Use microphone and camera</Button>
                </DialogContent>
            </Dialog>

            {askForUsername ? (
                /* LOBBY PAGE */
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: 'var(--bg-primary)' }}>
                    <Navbar />
                    <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 4 } }}>
                        <Box sx={{ display: 'flex', width: '100%', maxWidth: '1000px', gap: { xs: '24px', sm: '40px' }, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '320px' } }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'var(--text-primary)', fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>Ready to Join?</Typography>
                                <Card elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                    <TextField fullWidth label="Username" variant="standard" required value={username} onChange={e => setUsername(e.target.value)} sx={{ mb: 4 }} />
                                    <Button fullWidth variant="contained" onClick={connect} sx={{ py: 1.6, borderRadius: '8px', fontWeight: 700, textTransform: 'none', bgcolor: '#2563eb' }}>Connect & Enter Room</Button>
                                </Card>
                            </Box>
                            <Box sx={{ flex: 1.2, minWidth: { xs: '100%', sm: '360px' }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#1e293b', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                                    <video ref={localVideoref} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: videoAvailable ? 'block' : 'none' }} />
                                    {!videoAvailable && (
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111827' }}>
                                            <Avatar sx={{ width: 80, height: 80, fontSize: '2.5rem', bgcolor: '#2563eb' }}>{username ? username.charAt(0).toUpperCase() : 'U'}</Avatar>
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 3, mt: 2.5 }}>
                                    <IconButton onClick={handleVideo} sx={{ bgcolor: videoAvailable ? 'rgba(37, 99, 235, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: videoAvailable ? '#2563eb' : '#ef4444', p: 1.5 }}>
                                        {videoAvailable ? <VideocamIcon /> : <VideocamOffIcon />}
                                    </IconButton>
                                    <IconButton onClick={handleAudio} sx={{ bgcolor: audioAvailable ? 'rgba(37, 99, 235, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: audioAvailable ? '#2563eb' : '#ef4444', p: 1.5 }}>
                                        {audioAvailable ? <MicIcon /> : <MicOffIcon />}
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            ) : isWaitingToAdmit ? (
                /* WAITING LOBBY SCREEN */
                <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#202124', color: '#fff' }}>
                    <Avatar sx={{ width: 90, height: 90, bgcolor: '#e91e63', mb: 3, fontSize: '2.5rem' }}>
                        {username ? username.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>Asking to join...</Typography>
                    <Typography variant="body1" sx={{ color: '#aaa', textAlign: 'center', maxWidth: '400px' }}>
                        You'll join the call once the meeting host approves your request.
                    </Typography>
                </Box>
            ) : (
                /* IN-MEETING ROOM STAGE */
                <Box sx={{ position: 'relative', flex: 1, backgroundColor: '#202124', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh' }}>

                    <MeetingTopBar
                        activeCount={videos.length + 1}
                        hasWaiting={waitingUsers.length > 0}
                        onToggleWaiting={() => setShowPeoplePanel(!showPeoplePanel)}
                        onTogglePeople={() => setShowPeoplePanel(!showPeoplePanel)}
                        onToggleTranscript={() => setShowTranscriptPanel(!showTranscriptPanel)}
                        isTranscriptOpen={showTranscriptPanel}
                    />

                    {isHost && (
                        <WaitingUsersPanel
                            waitingUsers={waitingUsers}
                            onDeny={(id) => handleDenyUser(id)}
                            onAdmit={(id) => handleAdmitUser(id)}
                        />
                    )}

                    <PeoplePanel
                        isOpen={showPeoplePanel}
                        onClose={() => setShowPeoplePanel(false)}
                        isHost={isHost}
                        participants={videos}
                        currentUsername={username}
                        waitingUsers={waitingUsers}
                        onAdmitUser={handleAdmitUser}
                        onDenyUser={handleDenyUser}
                        onKickUser={handleKickUser}
                        onToggleRemoteAudio={handleToggleRemoteAudio}
                        onToggleRemoteVideo={handleToggleRemoteVideo}
                        onMuteAllStrict={handleStrictMuteAll}
                    />

                    {showTranscriptPanel && (
                        <TranscriptionPanel
                            onClose={() => setShowTranscriptPanel(false)}
                            username={username}
                            transcripts={transcripts}
                        />
                    )}

                    <ChatDrawer
                        isOpen={showModal}
                        onClose={() => setModal(false)}
                        messages={messages}
                        message={message}
                        setMessage={setMessage}
                        sendMessage={sendMessage}
                    />

                    {/* FLOATING EMOJI LAYER */}
                    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
                        {floatingEmojis.map(item => (
                            <Box
                                key={item.id}
                                style={{ '--drift': item.drift, '--spin': item.spin }}
                                sx={{
                                    position: 'absolute',
                                    bottom: '90px',
                                    left: item.left,
                                    fontSize: '3rem',
                                    lineHeight: 1,
                                    animation: `${floatUpAnimation} 2.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`,
                                    willChange: 'transform, opacity'
                                }}
                            >
                                {item.emoji}
                            </Box>
                        ))}
                    </Box>

                    {/* MAIN STAGE LAYOUT */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        width: '100%',
                        height: 'calc(100vh - 140px)',
                        px: { xs: 2, sm: 4, md: 6 },
                        py: 2,
                        boxSizing: 'border-box'
                    }}>

                        {/* BIG RECTANGLE CENTER DISPLAY */}
                        <Box sx={{
                            width: '100%',
                            height: '100%',
                            maxWidth: '1280px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            bgcolor: '#3c4043',
                            position: 'relative',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {screen ? (
                                /* SCREEN PRESENTATION MODE */
                                <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000000' }}>
                                    {isScreenSharer ? (
                                        <video ref={screenVideoref} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <video
                                            key={screenSharerId || 'presenter'}
                                            autoPlay
                                            playsInline
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            ref={ref => {
                                                if (!ref) return;
                                                // FIXED: Directly bind presenter's incoming stream
                                                const presenter = videos.find(v => v.socketId === screenSharerId);
                                                const activeStream = presenter?.screenStream || presenter?.stream;
                                                if (activeStream && ref.srcObject !== activeStream) {
                                                    ref.srcObject = activeStream;
                                                }
                                            }}
                                        />
                                    )}
                                    <Typography sx={{ position: 'absolute', bottom: 16, left: 16, color: '#ffffff', fontWeight: 500, fontSize: '0.85rem', bgcolor: 'rgba(0,0,0,0.65)', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                        {isScreenSharer ? "You are presenting" : `${videos.find(v => v.socketId === screenSharerId)?.name || 'ADMIN'}'s Screen`}
                                    </Typography>

                                    {/* CIRCULAR ADMIN CAMERA OVERLAY */}
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 20,
                                        right: 20,
                                        width: '130px',
                                        height: '130px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '3px solid #8ab4f8',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                                        bgcolor: '#202124',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 25
                                    }}>
                                        {isHost ? (
                                            <video ref={localVideoref} autoPlay muted playsInline style={{ display: video ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <video
                                                autoPlay
                                                playsInline
                                                style={{ display: hostRemoteVideo?.isVideoActive ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
                                                ref={ref => {
                                                    const hostCameraStream = hostRemoteVideo?.cameraStream || hostRemoteVideo?.stream;
                                                    if (ref && hostCameraStream && ref.srcObject !== hostCameraStream) {
                                                        ref.srcObject = hostCameraStream;
                                                    }
                                                }}
                                            />
                                        )}
                                        {((isHost && !video) || (!isHost && !hostRemoteVideo?.isVideoActive)) && (
                                            <Avatar sx={{ width: 55, height: 55, fontSize: '1.6rem', bgcolor: '#e91e63' }}>
                                                {isHost ? (username ? username.charAt(0).toUpperCase() : 'A') : (hostRemoteVideo?.name ? hostRemoteVideo.name.charAt(0).toUpperCase() : 'A')}
                                            </Avatar>
                                        )}
                                    </Box>
                                </Box>
                            ) : isHost ? (
                                /* NORMAL MODE - HOST / ADMIN IN BIG CENTER SCREEN */
                                <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <video ref={localVideoref} autoPlay muted playsInline style={{ display: video ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {!video && (
                                        <Avatar sx={{ width: 100, height: 100, fontSize: '3rem', bgcolor: '#e91e63' }}>
                                            {username ? username.charAt(0).toUpperCase() : 'A'}
                                        </Avatar>
                                    )}
                                    {isHandRaised && (
                                        <Chip
                                            icon={<PanToolIcon sx={{ color: '#202124 !important' }} />}
                                            label="You raised hand"
                                            sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#8ab4f8', color: '#202124', fontWeight: 600, animation: `${handPulseAnimation} 1.5s infinite ease-in-out` }}
                                        />
                                    )}
                                    <Typography sx={{ position: 'absolute', bottom: 16, left: 16, color: '#ffffff', fontWeight: 500, fontSize: '0.85rem', bgcolor: 'rgba(0,0,0,0.65)', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                        {username || "You"} (Host)
                                    </Typography>
                                </Box>
                            ) : (
                                /* NORMAL MODE - GUEST VIEW */
                                <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {hostRemoteVideo ? (
                                        <>
                                            <video
                                                data-socket={hostRemoteVideo.socketId}
                                                autoPlay
                                                playsInline
                                                style={{ display: hostRemoteVideo.isVideoActive ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
                                                ref={ref => {
                                                    const hostCameraStream = hostRemoteVideo?.cameraStream || hostRemoteVideo?.stream;
                                                    if (ref && hostCameraStream && ref.srcObject !== hostCameraStream) {
                                                        ref.srcObject = hostCameraStream;
                                                    }
                                                }}
                                            />
                                            {!hostRemoteVideo.isVideoActive && (
                                                <Avatar sx={{ width: 100, height: 100, fontSize: '3rem', bgcolor: '#2563eb' }}>
                                                    {hostRemoteVideo.name ? hostRemoteVideo.name.charAt(0).toUpperCase() : 'H'}
                                                </Avatar>
                                            )}
                                            {hostRemoteVideo.isHandRaised && (
                                                <Chip
                                                    icon={<PanToolIcon sx={{ color: '#202124 !important' }} />}
                                                    label={`${hostRemoteVideo.name} raised hand`}
                                                    sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#8ab4f8', color: '#202124', fontWeight: 600, animation: `${handPulseAnimation} 1.5s infinite ease-in-out` }}
                                                />
                                            )}
                                            <Typography sx={{ position: 'absolute', bottom: 16, left: 16, color: '#ffffff', fontWeight: 500, fontSize: '0.85rem', bgcolor: 'rgba(0,0,0,0.65)', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                                {hostRemoteVideo.name || 'Host'} (Host)
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="h6" sx={{ color: '#aaa' }}>Waiting for host video...</Typography>
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* PIP SIDEBAR COLUMN */}
                        <Box sx={{
                            position: 'absolute',
                            top: '70px',
                            left: { xs: '16px', md: '24px' },
                            bottom: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            zIndex: 10,
                            maxHeight: 'calc(100% - 90px)',
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }
                        }}>
                            {!isHost && (
                                <Box sx={{
                                    width: { xs: '130px', md: '160px' },
                                    height: { xs: '75px', md: '90px' },
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    bgcolor: '#202124',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <video ref={localVideoref} autoPlay muted playsInline style={{ display: video ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {!video && (
                                        <Avatar sx={{ width: 36, height: 36, fontSize: '1rem', bgcolor: '#e91e63' }}>
                                            {username ? username.charAt(0).toUpperCase() : 'Y'}
                                        </Avatar>
                                    )}
                                    {isHandRaised && (
                                        <PanToolIcon sx={{ position: 'absolute', top: 6, right: 6, color: '#8ab4f8', fontSize: '1rem' }} />
                                    )}
                                    <Typography sx={{ position: 'absolute', bottom: 4, left: 6, color: '#ffffff', fontWeight: 500, fontSize: '0.65rem', bgcolor: 'rgba(0,0,0,0.65)', px: 0.6, py: 0.1, borderRadius: '4px' }}>
                                        {username || "You"} (You)
                                    </Typography>
                                </Box>
                            )}

                            {pipParticipants.map((v) => (
                                <Box key={v.socketId} sx={{
                                    width: { xs: '130px', md: '160px' },
                                    height: { xs: '75px', md: '90px' },
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    bgcolor: '#202124',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <video
                                        data-socket={v.socketId}
                                        autoPlay
                                        playsInline
                                        style={{ display: v.isVideoActive ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
                                        ref={ref => {
                                            const camStream = v.cameraStream || v.stream;
                                            if (ref && camStream && ref.srcObject !== camStream) {
                                                ref.srcObject = camStream;
                                            }
                                        }}
                                    />
                                    {!v.isVideoActive && (
                                        <Avatar sx={{ width: 36, height: 36, fontSize: '1rem', bgcolor: '#2563eb' }}>
                                            {v.name ? v.name.charAt(0).toUpperCase() : 'P'}
                                        </Avatar>
                                    )}
                                    {v.isHandRaised && (
                                        <PanToolIcon sx={{ position: 'absolute', top: 6, right: 6, color: '#8ab4f8', fontSize: '1rem' }} />
                                    )}
                                    <Typography sx={{ position: 'absolute', bottom: 4, left: 6, color: '#ffffff', fontWeight: 500, fontSize: '0.65rem', bgcolor: 'rgba(0,0,0,0.65)', px: 0.6, py: 0.1, borderRadius: '4px' }}>
                                        {v.name || 'Participant'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <MeetingControls
                        video={video}
                        audio={audio}
                        screen={screen}
                        isScreenSharer={isScreenSharer}
                        isHost={isHost}
                        isHandRaised={isHandRaised}
                        screenAvailable={screenAvailable}
                        newMessages={newMessages}
                        showModal={showModal}
                        onToggleVideo={handleRoomVideoToggle}
                        onToggleAudio={handleRoomAudioToggle}
                        onToggleScreen={handleToggleScreenShare}
                        onToggleHand={toggleLocalHand}
                        onEndCall={handleEndCall}
                        onToggleChat={() => { setModal(!showModal); setNewMessages(0); }}
                        onSendReaction={handleSendReaction}
                    />
                </Box>
            )}
        </Box>
    );
}

