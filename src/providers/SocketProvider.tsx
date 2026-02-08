"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/providers/AuthProvider";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: number) => void;
  leaveRoom: (roomId: number) => void;
  sendMessage: (roomId: number, content: string) => void;
  startTyping: (roomId: number) => void;
  stopTyping: (roomId: number) => void;
  markNotificationRead: (notificationId: number) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuth();

  // Initialize socket connection when token is available
  useEffect(() => {
    // Don't connect if already connected or no token
    if (socketRef.current?.connected) return;
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("[Socket] Connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);
      setIsConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("[Socket] Error:", error);
    });

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  // Update socket auth when token changes
  useEffect(() => {
    if (socketRef.current && token) {
      socketRef.current.auth = { token };
      if (!socketRef.current.connected) {
        socketRef.current.connect();
      }
    }
  }, [token]);

  // Join a collaboration room
  const joinRoom = useCallback((roomId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("room:join", roomId);
    }
  }, []);

  // Leave a collaboration room
  const leaveRoom = useCallback((roomId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("room:leave", roomId);
    }
  }, []);

  // Send a message to a room
  const sendMessage = useCallback((roomId: number, content: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message:send", { roomId, content });
    }
  }, []);

  // Start typing indicator
  const startTyping = useCallback((roomId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:start", roomId);
    }
  }, []);

  // Stop typing indicator
  const stopTyping = useCallback((roomId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:stop", roomId);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback((notificationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("notification:read", notificationId);
    }
  }, []);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      joinRoom,
      leaveRoom,
      sendMessage,
      startTyping,
      stopTyping,
      markNotificationRead,
    }),
    [
      socket,
      isConnected,
      joinRoom,
      leaveRoom,
      sendMessage,
      startTyping,
      stopTyping,
      markNotificationRead,
    ],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
}
