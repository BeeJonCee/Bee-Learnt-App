"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const starterMessages: Message[] = [
  {
    role: "assistant",
    content:
      "I can help you break down lessons, quiz you, or summarize tricky topics.",
  },
];

export default function AiTutorWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(starterMessages);

  const greeting = useMemo(() => {
    const name = user?.name?.split(" ")[0] ?? "there";
    return `Hi ${name}, what do you want to learn today?`;
  }, [user?.name]);

  const handleSend = () => {
    if (!input.trim()) return;
    const message = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Got it. Want a quick summary, a step-by-step walkthrough, or a mini quiz?",
        },
      ]);
    }, 800);
  };

  return (
    <>
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1200,
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.35)",
        }}
      >
        <AutoAwesomeIcon />
      </Fab>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            backgroundImage: "none",
            backgroundColor: "rgba(16, 18, 24, 0.96)",
          },
        }}
      >
        <Stack sx={{ height: "100%" }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack>
              <Typography variant="subtitle1" fontWeight={700}>
                AI Tutor
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Always ready to help
              </Typography>
            </Stack>
            <IconButton onClick={() => setOpen(false)} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>

          <Stack spacing={2} sx={{ px: 3, py: 3, flex: 1, overflowY: "auto" }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {greeting}
              </Typography>
            </Box>
            {messages.map((message, index) => (
              <Box
                key={`${message.role}-${index}`}
                sx={{
                  alignSelf:
                    message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor:
                    message.role === "user"
                      ? "primary.main"
                      : "rgba(255,255,255,0.08)",
                  color: message.role === "user" ? "#101010" : "text.primary",
                }}
              >
                <Typography variant="body2">{message.content}</Typography>
              </Box>
            ))}
          </Stack>

          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question"
                size="small"
                fullWidth
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
