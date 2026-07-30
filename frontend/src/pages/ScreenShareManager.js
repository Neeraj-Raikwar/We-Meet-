import { boostAudioQuality } from './webrtcUtils';

// Adding a track to an already-connected RTCPeerConnection does NOT get sent
// to the remote peer on its own — WebRTC requires a fresh offer/answer
// exchange ("renegotiation") before the new track is actually delivered.
// Without this, remote peers never receive the shared-screen video, and their
// screen-share box just keeps showing whatever frame arrived last.
const renegotiateConnection = async (pc, socketId, socketRef) => {
    if (!pc || !socketRef?.current) return;
    try {
        const offer = await pc.createOffer();
        offer.sdp = boostAudioQuality(offer.sdp);
        await pc.setLocalDescription(offer);
        socketRef.current.emit('signal', socketId, JSON.stringify({ 'sdp': pc.localDescription }));
    } catch (e) {
        console.warn('Screen share renegotiation failed for', socketId, e);
    }
};

export const startScreenSharing = async ({ connections, setScreen, setIsScreenSharer, socketRef, roomId, screenVideoref, onStreamEnded }) => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: false
        });

        const screenTrack = screenStream.getVideoTracks()[0];

        // Keep a global reference so late joiners requesting the live screen
        // can be attached to the same stream (see attach-screen-request in VideoMeet.jsx).
        window.localScreenStream = screenStream;
        window.screenShareSenders = window.screenShareSenders || {};

        // Add the screen track as a separate sender on all active peer connections,
        // then renegotiate each connection so the new track is actually sent.
        Object.keys(connections).forEach((socketId) => {
            try {
                const sender = connections[socketId].addTrack(screenTrack, screenStream);
                window.screenShareSenders[socketId] = sender;
                renegotiateConnection(connections[socketId], socketId, socketRef);
            } catch (e) {
                console.warn('Could not add screen track to connection', socketId, e);
            }
        });

        if (screenVideoref && screenVideoref.current) {
            screenVideoref.current.srcObject = screenStream;
        }

        setScreen(true);
        setIsScreenSharer(true);

        socketRef.current?.emit('screen-share-status', { roomId, isSharing: true });

        screenTrack.onended = () => {
            stopScreenSharing({ connections, setScreen, setIsScreenSharer, socketRef, roomId });
            if (onStreamEnded) onStreamEnded();
        };

        return screenStream;
    } catch (error) {
        console.error("Error starting screen share:", error);
        return null;
    }
};

export const stopScreenSharing = async ({ connections, setScreen, setIsScreenSharer, socketRef, roomId }) => {
    try {
        // Stop the actual capture so the browser's "you are sharing" bar goes away.
        if (window.localScreenStream) {
            window.localScreenStream.getTracks().forEach(track => track.stop());
        }
        window.localScreenStream = null;

        // Remove the screen sender from every peer connection and renegotiate,
        // so remote peers are told the track is gone instead of just freezing
        // on the last frame.
        if (window.screenShareSenders) {
            Object.keys(window.screenShareSenders).forEach((socketId) => {
                try {
                    const sender = window.screenShareSenders[socketId];
                    if (sender && connections[socketId]) {
                        connections[socketId].removeTrack(sender);
                        renegotiateConnection(connections[socketId], socketId, socketRef);
                    }
                } catch (e) {
                    console.warn('Could not remove screen sender for', socketId, e);
                }
                delete window.screenShareSenders[socketId];
            });
        }

        setScreen(false);
        setIsScreenSharer(false);

        socketRef.current?.emit('screen-share-status', { roomId, isSharing: false });
    } catch (error) {
        console.error("Error stopping screen share:", error);
    }
};
