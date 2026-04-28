
import { useEffect, useRef } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";

export const useSocket = (userId, eventHandlers = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = connectSocket(userId);

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socketRef.current.on(event, handler);
    });

    return () => {
      Object.keys(eventHandlers).forEach((event) => {
        socketRef.current?.off(event);
      });
    };
  }, [userId]);

  return socketRef.current;
};