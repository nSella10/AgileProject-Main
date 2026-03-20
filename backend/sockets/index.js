import handleRoomEvents from "./roomEvents.js";
import { handlePlayerEvents } from "./playerEvents.js";
import { handleGameEvents } from "./gameEvents.js";
import { handleOnlineLobbyEvents, handleOnlinePlayerLeave, broadcastLobbyUpdate } from "./onlineLobbyEvents.js";
import { handlePresenceEvents, handlePresenceDisconnect, setPresence } from "./presenceEvents.js";
import rooms from "../sockets/roomStore.js";

const socketManager = (io) => {
  io.on("connection", (socket) => {
    console.log(`📡 New client connected: ${socket.id}`);
    console.log(`🔗 Total connected clients: ${io.engine.clientsCount}`);
    console.log(`🔍 Socket auth:`, socket.handshake.auth);
    console.log(`🔍 Socket query:`, socket.handshake.query);

    handleRoomEvents(io, socket);
    handlePlayerEvents(io, socket);
    handleGameEvents(io, socket);
    handleOnlineLobbyEvents(io, socket);
    handlePresenceEvents(io, socket);

    socket.on("disconnect", () => {
      handlePresenceDisconnect(io, socket);
      console.log(`❌ Client disconnected: ${socket.id}`);

      // Check if this socket is in an online room
      for (const [roomCode, room] of rooms.entries()) {
        if (room.isOnline) {
          const onlinePlayer = room.players.find((p) => p.socketId === socket.id);
          if (onlinePlayer) {
            console.log(`🌐 Online player ${onlinePlayer.username} disconnected from room ${roomCode}`);
            handleOnlinePlayerLeave(io, socket, roomCode);
            return;
          }
        }
      }

      // בדיקה אם זה מארגן שהתנתק (local mode only)
      for (const [code, room] of rooms.entries()) {
        if (!room.isOnline && room.hostSocketId === socket.id) {
          console.log(`🧹 Cleaning up room ${code} (host disconnected)`);
          rooms.delete(code);
          return;
        }
      }

      // בדיקה אם זה משתתף שהתנתק (local mode)
      for (const [roomCode, room] of rooms.entries()) {
        if (room.isOnline) continue; // Already handled above

        const disconnectedPlayer = room.players.find(
          (p) => p.socketId === socket.id
        );
        if (disconnectedPlayer) {
          console.log(
            `🚪 Player ${disconnectedPlayer.username} disconnected from room ${roomCode}`
          );
          console.log(`🔍 Room status: ${room.status}`);
          console.log(`🔍 Room data:`, {
            status: room.status,
            currentSongIndex: room.currentSongIndex,
            roundDeadline: room.roundDeadline,
            currentTimeout: !!room.currentTimeout,
          });

          // סימון השחקן כמנותק במקום מחיקה
          disconnectedPlayer.status = "disconnected";
          disconnectedPlayer.disconnectedAt = new Date();

          // אם המשחק פעיל, נשהה את הטיימר ונודיע לכל השחקנים
          if (room.status === "playing") {
            console.log(
              `⏸️ Game is active, pausing for disconnected player: ${disconnectedPlayer.username}`
            );

            // שמירת זמן הטיימר הנוכחי
            if (room.roundDeadline) {
              room.pausedTimeLeft = Math.max(
                0,
                room.roundDeadline - Date.now()
              );
              console.log(
                `⏸️ Game paused, time left: ${room.pausedTimeLeft}ms`
              );
            }

            // עצירת הטיימר הנוכחי
            if (room.currentTimeout) {
              clearTimeout(room.currentTimeout);
              room.currentTimeout = null;
              console.log(`⏸️ Cleared current timeout for room ${roomCode}`);
            }

            // הודעה לכל השחקנים שהמשחק מושהה
            console.log(
              `📢 Sending gamePaused event to all players in room ${roomCode}`
            );
            io.to(roomCode).emit("gamePaused", {
              reason: "playerDisconnected",
              disconnectedPlayer: disconnectedPlayer.username,
            });

            // הודעה נוספת לוודא שכל השחקנים מקבלים
            room.players.forEach((player) => {
              if (
                player.status !== "disconnected" &&
                player.socketId !== socket.id
              ) {
                io.to(player.socketId).emit("gamePaused", {
                  reason: "playerDisconnected",
                  disconnectedPlayer: disconnectedPlayer.username,
                });
                console.log(
                  `📢 Sent gamePaused directly to player ${player.username}`
                );
              }
            });
          }

          // שליחת התראה למארגן על ניתוק השחקן
          io.to(room.hostSocketId).emit("playerDisconnected", {
            username: disconnectedPlayer.username,
            emoji: disconnectedPlayer.emoji,
            roomCode: roomCode,
            gameInProgress: room.status === "playing",
          });

          break;
        }
      }
    });
  });
};

export default socketManager;
