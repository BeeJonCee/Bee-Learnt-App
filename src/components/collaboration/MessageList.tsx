"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/hooks/useSocket";
import { formatDistanceToNow } from "@/lib/utils/date";
import { useAuth } from "@/providers/AuthProvider";

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (messages.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No messages yet. Start the conversation!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        {messages.map((message, index) => {
          const isOwn = message.userId === user?.id;
          const showAvatar =
            index === 0 || messages[index - 1].userId !== message.userId;

          return (
            <Box
              key={message.id ?? `${message.createdAt}-${index}`}
              sx={{
                display: "flex",
                flexDirection: isOwn ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              {/* Avatar */}
              {showAvatar ? (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: isOwn ? "primary.main" : "secondary.main",
                    fontSize: "0.875rem",
                  }}
                >
                  {message.userName?.[0]?.toUpperCase() ?? "?"}
                </Avatar>
              ) : (
                <Box sx={{ width: 32 }} />
              )}

              {/* Message bubble */}
              <Box
                sx={{
                  maxWidth: "70%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isOwn ? "flex-end" : "flex-start",
                }}
              >
                {/* Name and time */}
                {showAvatar && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      mb: 0.5,
                      flexDirection: isOwn ? "row-reverse" : "row",
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      {isOwn ? "You" : (message.userName ?? "Unknown")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(message.createdAt)}
                    </Typography>
                  </Stack>
                )}

                {/* Message content */}
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: isOwn
                      ? "primary.main"
                      : "rgba(255, 255, 255, 0.08)",
                    color: isOwn ? "primary.contrastText" : "text.primary",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Stack>
    </Box>
  );
}
