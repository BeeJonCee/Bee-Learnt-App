"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocket as useSocketContext } from "@/providers/SocketProvider";

// Types for socket events
export interface ChatMessage {
  id?: number;
  roomId: number;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
}

export interface TypingIndicator {
  roomId: number;
  userId: string;
  userName?: string;
  isTyping: boolean;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message?: string;
  createdAt: string;
  readAt?: string;
  data?: Record<string, unknown>;
}

export interface BadgeAwarded {
  badgeId: number;
  badgeName: string;
  description?: string;
  awardedAt: string;
}

export interface LeaderboardUpdate {
  userId: string;
  newRank: number;
  previousRank: number;
  score: number;
}

// Hook for real-time notifications
export function useNotifications() {
  const { socket, markNotificationRead } = useSocketContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket]);

  const markAsRead = useCallback(
    (notificationId: number) => {
      markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, readAt: new Date().toISOString() }
            : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [markNotificationRead],
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
}

// Hook for badge awards
export function useBadgeAwards() {
  const { socket } = useSocketContext();
  const [lastBadge, setLastBadge] = useState<BadgeAwarded | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleBadgeAwarded = (badge: BadgeAwarded) => {
      setLastBadge(badge);
    };

    socket.on("badge:awarded", handleBadgeAwarded);

    return () => {
      socket.off("badge:awarded", handleBadgeAwarded);
    };
  }, [socket]);

  const clearLastBadge = useCallback(() => {
    setLastBadge(null);
  }, []);

  return {
    lastBadge,
    clearLastBadge,
  };
}

// Hook for leaderboard updates
export function useLeaderboardUpdates() {
  const { socket } = useSocketContext();
  const [lastUpdate, setLastUpdate] = useState<LeaderboardUpdate | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (update: LeaderboardUpdate) => {
      setLastUpdate(update);
    };

    socket.on("leaderboard:update", handleUpdate);

    return () => {
      socket.off("leaderboard:update", handleUpdate);
    };
  }, [socket]);

  return { lastUpdate };
}

// Hook for chat room functionality
export function useChatRoom(roomId: number | null) {
  const { socket, joinRoom, leaveRoom, sendMessage, startTyping, stopTyping } =
    useSocketContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(
    new Map(),
  );
  const [isJoined, setIsJoined] = useState(false);

  // Join room on mount, leave on unmount
  useEffect(() => {
    if (!socket || !roomId) return;

    joinRoom(roomId);

    const handleJoined = (data: { roomId: number }) => {
      if (data.roomId === roomId) {
        setIsJoined(true);
      }
    };

    const handleMessage = (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTypingStart = (indicator: TypingIndicator) => {
      if (indicator.roomId === roomId) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.set(indicator.userId, indicator);
          return next;
        });
      }
    };

    const handleTypingStop = (indicator: TypingIndicator) => {
      if (indicator.roomId === roomId) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(indicator.userId);
          return next;
        });
      }
    };

    socket.on("room:joined", handleJoined);
    socket.on("message:receive", handleMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      leaveRoom(roomId);
      setIsJoined(false);
      socket.off("room:joined", handleJoined);
      socket.off("message:receive", handleMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, roomId, joinRoom, leaveRoom]);

  const send = useCallback(
    (content: string) => {
      if (roomId) {
        sendMessage(roomId, content);
      }
    },
    [roomId, sendMessage],
  );

  const typing = useCallback(() => {
    if (roomId) {
      startTyping(roomId);
    }
  }, [roomId, startTyping]);

  const stopTypingIndicator = useCallback(() => {
    if (roomId) {
      stopTyping(roomId);
    }
  }, [roomId, stopTyping]);

  return {
    messages,
    typingUsers: Array.from(typingUsers.values()),
    isJoined,
    send,
    typing,
    stopTyping: stopTypingIndicator,
    clearMessages: () => setMessages([]),
  };
}

// Hook for announcements
export function useAnnouncements() {
  const { socket } = useSocketContext();
  const [latestAnnouncement, setLatestAnnouncement] = useState<{
    id: number;
    title: string;
    body: string;
    publishedAt: string;
  } | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleAnnouncement = (announcement: {
      id: number;
      title: string;
      body: string;
      publishedAt: string;
    }) => {
      setLatestAnnouncement(announcement);
    };

    socket.on("announcement:new", handleAnnouncement);

    return () => {
      socket.off("announcement:new", handleAnnouncement);
    };
  }, [socket]);

  const dismiss = useCallback(() => {
    setLatestAnnouncement(null);
  }, []);

  return {
    latestAnnouncement,
    dismiss,
  };
}
