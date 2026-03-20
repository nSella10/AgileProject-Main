// src/socket.js - Play App Socket Connection
import { io } from "socket.io-client";
import { BASE_URL } from "./constants";

let socket = null;
let currentUserId = null;

export const getSocket = ({ userId = null } = {}) => {
  // If userId changed and we have an existing socket, reconnect with new auth
  if (socket && userId !== currentUserId && userId !== null) {
    socket.auth = { userId };
    currentUserId = userId;
    if (socket.connected) {
      socket.disconnect().connect();
    }
    return socket;
  }

  if (!socket) {
    currentUserId = userId;
    socket = io(BASE_URL, {
      withCredentials: true,
      auth: { userId },
    });

    socket.on("connect", () => {
      console.log("Socket connected!", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("Socket connection error:", err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};
