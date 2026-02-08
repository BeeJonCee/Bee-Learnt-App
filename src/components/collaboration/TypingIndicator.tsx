"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { TypingIndicator as TypingIndicatorData } from "@/hooks/useSocket";

interface TypingIndicatorProps {
  users: TypingIndicatorData[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const names = users.map((u) => u.userName ?? "Someone");
  let text = "";

  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = `${names.length} people are typing`;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* Animated dots */}
      <Box sx={{ display: "flex", gap: 0.3 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "text.secondary",
              animation: "typing 1.4s infinite",
              animationDelay: `${i * 0.2}s`,
              "@keyframes typing": {
                "0%, 60%, 100%": {
                  transform: "translateY(0)",
                  opacity: 0.4,
                },
                "30%": {
                  transform: "translateY(-4px)",
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">
        {text}...
      </Typography>
    </Box>
  );
}
