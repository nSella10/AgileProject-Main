import presence from "./presenceStore.js";
import Friendship from "../models/Friendship.js";
import rooms from "./roomStore.js";

export function handlePresenceEvents(io, socket) {
  const userId = socket.handshake.auth?.userId;

  if (userId) {
    // Set user as online on connect
    presence.set(userId, {
      socketId: socket.id,
      status: "online",
      roomCode: null,
    });
    broadcastPresenceToFriends(io, userId);
  }

  // Update presence status
  socket.on("updatePresence", ({ status, roomCode }) => {
    if (!userId) return;
    const current = presence.get(userId) || {};
    presence.set(userId, {
      socketId: socket.id,
      status: status || current.status || "online",
      roomCode: roomCode || null,
    });
    broadcastPresenceToFriends(io, userId);
  });

  // Get friends' presence
  socket.on("getFriendsPresence", async () => {
    if (!userId) return;
    const friendsPresence = await getFriendsPresenceData(userId);
    socket.emit("friendsPresence", friendsPresence);
  });

  // Invite a friend to a room
  socket.on("inviteFriend", ({ friendUserId, roomCode }) => {
    if (!userId) return;

    const room = rooms.get(roomCode);
    if (!room || !room.isOnline) {
      socket.emit("onlineError", "Room not found");
      return;
    }

    const friendPresence = presence.get(friendUserId);
    if (!friendPresence) {
      socket.emit("onlineError", "Friend is offline");
      return;
    }

    // Find inviter's username from room
    const inviter = room.players.find((p) => p.socketId === socket.id);
    const inviterName = inviter?.username || "Someone";

    io.to(friendPresence.socketId).emit("gameInvite", {
      fromUserId: userId,
      fromUsername: inviterName,
      roomCode,
      gameTitle: room.game?.title || "Untitled Game",
      playerCount: room.players.filter((p) => p.status !== "disconnected").length,
      maxPlayers: room.maxPlayers,
    });

    socket.emit("inviteSent", { friendUserId });
  });
}

export function handlePresenceDisconnect(io, socket) {
  const userId = socket.handshake.auth?.userId;
  if (!userId) return;

  const current = presence.get(userId);
  if (current && current.socketId === socket.id) {
    presence.delete(userId);
    broadcastPresenceToFriends(io, userId);
  }
}

export function setPresence(io, userId, status, roomCode = null) {
  const current = presence.get(userId);
  if (current) {
    presence.set(userId, { ...current, status, roomCode });
    broadcastPresenceToFriends(io, userId);
  }
}

async function broadcastPresenceToFriends(io, userId) {
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    });

    const update = presence.get(userId);
    const statusData = update
      ? { userId, status: update.status, roomCode: update.roomCode }
      : { userId, status: "offline", roomCode: null };

    for (const f of friendships) {
      const friendId =
        f.requester.toString() === userId
          ? f.recipient.toString()
          : f.requester.toString();
      const friendPresence = presence.get(friendId);
      if (friendPresence) {
        io.to(friendPresence.socketId).emit("friendPresenceUpdate", statusData);
      }
    }
  } catch (err) {
    console.error("Error broadcasting presence:", err);
  }
}

async function getFriendsPresenceData(userId) {
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    });

    const result = {};
    for (const f of friendships) {
      const friendId =
        f.requester.toString() === userId
          ? f.recipient.toString()
          : f.requester.toString();
      const p = presence.get(friendId);
      result[friendId] = p
        ? { status: p.status, roomCode: p.roomCode }
        : { status: "offline", roomCode: null };
    }
    return result;
  } catch (err) {
    console.error("Error getting friends presence:", err);
    return {};
  }
}
