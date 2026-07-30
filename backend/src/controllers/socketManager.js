import { Server } from "socket.io";

const activeRooms = {};
const userNames = {}; // Store socketId -> username mapping

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    const connections = {};
    const messages = {};

    const getRoomBySocketId = (socketId) => {
        for (let [roomKey, roomValue] of Object.entries(connections)) {
            if (roomValue.includes(socketId)) {
                return roomKey;
            }
        }
        return null;
    };

    io.on("connection", (socket) => {
        socket.on("check-room-status", (roomId, username) => {
            if (username) userNames[socket.id] = username;

            if (!activeRooms[roomId]) {
                activeRooms[roomId] = {
                    hostSocketId: socket.id,
                    hostName: username,
                    approvedUsers: [socket.id]
                };
                socket.emit("room-role-response", { isHost: true });
            } else {
                socket.emit("room-role-response", { isHost: false });
            }
        });

        socket.on("knock-admit-request", ({ roomId, username, socketId }) => {
            if (username) userNames[socket.id] = username;
            const room = activeRooms[roomId];
            if (room && room.hostSocketId) {
                io.to(room.hostSocketId).emit("receive-knock-request", {
                    socketId: socketId || socket.id,
                    username: username || "Guest"
                });
            }
        });

        socket.on("approve-guest", ({ guestSocketId, allowed, roomId }) => {
            if (allowed) {
                if (activeRooms[roomId]) {
                    activeRooms[roomId].approvedUsers.push(guestSocketId);
                }
                io.to(guestSocketId).emit("admit-decision", { allowed: true });
            } else {
                io.to(guestSocketId).emit("admit-decision", { allowed: false });
            }
        });

        socket.on("join-call", (path, username) => {
            if (username) userNames[socket.id] = username;

            if (connections[path] === undefined) {
                connections[path] = [];
            }
            if (!connections[path].includes(socket.id)) {
                connections[path].push(socket.id);
            }

            // Broadcast joined user event with complete userNames mapping
            connections[path].forEach((clientSocketId) => {
                io.to(clientSocketId).emit("user-joined", socket.id, connections[path], userNames);
            });

            if (messages[path] !== undefined) {
                messages[path].forEach((msg) => {
                    io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg['socket-id-sender']);
                });
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const matchingRoom = getRoomBySocketId(socket.id);
            if (matchingRoom) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({ sender, data, 'socket-id-sender': socket.id });
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("hand-raise-update", ({ roomId, isHandRaised, socketId }) => {
            const roomKey = roomId || getRoomBySocketId(socket.id);
            if (roomKey && connections[roomKey]) {
                connections[roomKey].forEach((id) => {
                    io.to(id).emit("hand-raise-update", {
                        socketId: socketId || socket.id,
                        isHandRaised: isHandRaised
                    });
                });
            }
        });

        socket.on("emoji-reaction", (data) => {
            const emoji = typeof data === 'object' ? data.emoji : data;
            const roomKey = (typeof data === 'object' && data.roomId) ? data.roomId : getRoomBySocketId(socket.id);
            if (roomKey && connections[roomKey]) {
                connections[roomKey].forEach((id) => {
                    if (id !== socket.id) {
                        io.to(id).emit("emoji-reaction", emoji);
                    }
                });
            }
        });

        // Each client runs speech-to-text on its own mic locally, then sends the
        // finished line here so it can be relayed to everyone else in the room.
        socket.on("transcript-update", ({ roomId, text, sender }) => {
            if (!text) return;
            const roomKey = roomId || getRoomBySocketId(socket.id);
            if (roomKey && connections[roomKey]) {
                connections[roomKey].forEach((id) => {
                    if (id !== socket.id) {
                        io.to(id).emit("transcript-update", { text, sender: sender || userNames[socket.id] || "Participant" });
                    }
                });
            }
        });

        socket.on("screen-share-status", ({ roomId, isSharing }) => {
            const roomKey = roomId || getRoomBySocketId(socket.id);
            console.log('[screen-share-status] from', socket.id, 'roomKey=', roomKey, 'isSharing=', isSharing);
            if (roomKey && connections[roomKey]) {
                // Ensure we track who is the current screen sharer for the room
                activeRooms[roomKey] = activeRooms[roomKey] || {};
                if (isSharing) {
                    // Only the room host is allowed to start screen sharing.
                    const roomInfo = activeRooms[roomKey] || {};
                    if (roomInfo.hostSocketId && roomInfo.hostSocketId !== socket.id) {
                        // Deny: non-host trying to start presenting
                        console.warn('[screen-share-start-denied] non-host', socket.id, 'tried to present in', roomKey);
                        io.to(socket.id).emit('screen-share-start-denied', { reason: 'Only the host may start presenting.' });
                    } else {
                        activeRooms[roomKey].screenSharer = socket.id;
                        connections[roomKey].forEach((id) => {
                            io.to(id).emit("screen-share-status", {
                                sharerSocketId: socket.id,
                                isSharing: true
                            });
                        });
                        console.log('[screen-share-status] set screenSharer=', socket.id, 'for room', roomKey);
                    }
                } else {
                    // Only the sharer or the host may stop the screen share
                    const roomInfo = activeRooms[roomKey] || {};
                    if (roomInfo.screenSharer === socket.id || roomInfo.hostSocketId === socket.id) {
                        delete activeRooms[roomKey].screenSharer;
                        connections[roomKey].forEach((id) => {
                            io.to(id).emit("screen-share-status", {
                                sharerSocketId: socket.id,
                                isSharing: false
                            });
                        });
                        console.log('[screen-share-status] cleared screenSharer for room', roomKey, 'by', socket.id);
                    } else {
                        // Inform the requester they're not authorized to stop
                        console.warn('[screen-share-stop-denied] socket', socket.id, 'not allowed to stop sharing in', roomKey, 'currentSharer=', roomInfo.screenSharer);
                        io.to(socket.id).emit('screen-share-stop-denied', { reason: 'Not authorized to stop screen share.' });
                    }
                }
            }
        });

        socket.on("admin-kick-user", ({ targetSocketId }) => {
            if (targetSocketId) io.to(targetSocketId).emit("force-kick-out");
        });

        socket.on("admin-toggle-audio", ({ targetSocketId, lockState }) => {
            if (targetSocketId) io.to(targetSocketId).emit("force-toggle-audio", { lockState });
        });

        socket.on("admin-toggle-video", ({ targetSocketId, lockState }) => {
            if (targetSocketId) io.to(targetSocketId).emit("force-toggle-video", { lockState });
        });

        socket.on("admin-strict-mute-all", ({ roomId }) => {
            const roomKey = roomId || getRoomBySocketId(socket.id);
            if (roomKey && connections[roomKey]) {
                connections[roomKey].forEach((id) => {
                    if (id !== socket.id) {
                        io.to(id).emit("force-toggle-audio", { lockState: true });
                        io.to(id).emit("force-toggle-video", { lockState: true });
                    }
                });
            }
        });

        socket.on("disconnect", () => {
            delete userNames[socket.id];
            for (let roomId in activeRooms) {
                if (activeRooms[roomId].hostSocketId === socket.id) {
                    delete activeRooms[roomId];
                } else if (activeRooms[roomId]?.approvedUsers) {
                    activeRooms[roomId].approvedUsers = activeRooms[roomId].approvedUsers.filter(id => id !== socket.id);
                }
            }

            let key;
            for (let [k, v] of Object.entries(connections)) {
                let index = v.indexOf(socket.id);
                if (index !== -1) {
                    key = k;
                    connections[key].forEach((socketInRoom) => {
                        io.to(socketInRoom).emit("user-left", socket.id);
                    });
                    connections[key].splice(index, 1);
                    if (connections[key].length === 0) {
                        delete connections[key];
                    }
                }
            }
        });

        // Relay a request from a client to the sharer to attach the active screen
        // stream to a specific peer connection (helpful for race conditions).
        socket.on('request-screen-attach', ({ targetId, requesterId }) => {
            if (targetId) {
                io.to(targetId).emit('attach-screen-request', { requesterId: requesterId || socket.id });
            }
        });
    });

    return io;
};
