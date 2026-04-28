import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    socket.emit("join_room", userId);
  });

  socket.on("disconnect", () => console.log("Socket disconnected"));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};