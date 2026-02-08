"use client";

import Alert from "@mui/material/Alert";
import Badge from "@mui/material/Badge";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";

type Message = {
  id: number;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  subject: string | null;
  content: string;
  readAt: string | null;
  createdAt: string;
};

type MessageListResponse = {
  items: Message[];
  total: number;
  limit: number;
  offset: number;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
}

export default function MessagesPage() {
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");

  const {
    data: inboxData,
    loading: inboxLoading,
    error: inboxError,
  } = useApi<MessageListResponse>(
    tab === "inbox" ? "/api/messages?limit=50" : null,
  );
  const {
    data: sentData,
    loading: sentLoading,
    error: sentError,
  } = useApi<MessageListResponse>(
    tab === "sent" ? "/api/messages/sent?limit=50" : null,
  );
  const { data: unread } = useApi<{ count: number }>(
    "/api/messages/unread-count",
  );

  const messages =
    tab === "inbox" ? (inboxData?.items ?? []) : (sentData?.items ?? []);
  const loading = tab === "inbox" ? inboxLoading : sentLoading;
  const error = tab === "inbox" ? inboxError : sentError;

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">Messages</Typography>
        <Typography color="text.secondary">
          Direct messages between you and other users.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="center">
        <Chip
          label={unread?.count ? `Inbox (${unread.count})` : "Inbox"}
          color={tab === "inbox" ? "primary" : "default"}
          onClick={() => setTab("inbox")}
          variant={tab === "inbox" ? "filled" : "outlined"}
        />
        <Chip
          label="Sent"
          color={tab === "sent" ? "primary" : "default"}
          onClick={() => setTab("sent")}
          variant={tab === "sent" ? "filled" : "outlined"}
        />
        <Chip
          label="Compose"
          component={Link}
          href="/messages/compose"
          variant="outlined"
          clickable
        />
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Loading messages...</Typography>
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              {tab === "inbox"
                ? "No messages in your inbox."
                : "No sent messages."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Stack divider={<Divider />}>
            {messages.map((msg) => (
              <CardActionArea
                key={msg.id}
                component={Link}
                href={`/messages?selected=${msg.id}`}
              >
                <CardContent>
                  <Stack spacing={0.5}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        {tab === "inbox" && !msg.readAt && (
                          <Badge color="primary" variant="dot" />
                        )}
                        <Typography variant="subtitle2">
                          {tab === "inbox" ? msg.senderName : msg.recipientName}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(msg.createdAt)}
                      </Typography>
                    </Stack>
                    {msg.subject && (
                      <Typography
                        variant="body2"
                        fontWeight={msg.readAt ? 400 : 600}
                      >
                        {msg.subject}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {msg.content}
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
