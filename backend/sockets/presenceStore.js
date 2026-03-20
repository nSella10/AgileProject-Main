// Maps userId (string) → { socketId, status, roomCode }
// status: "online" | "in_lobby" | "in_game"
const presence = new Map();

export default presence;
