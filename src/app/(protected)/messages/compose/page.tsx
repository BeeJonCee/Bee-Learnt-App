"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/utils/api";

export default function ComposeMessagePage() {
  const router = useRouter();
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!recipientId.trim() || !content.trim()) return;
    setError(null);
    setSending(true);
    try {
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          recipientId: recipientId.trim(),
          subject: subject.trim() || undefined,
          content: content.trim(),
        }),
      });
      router.push("/messages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">Compose Message</Typography>
        <Typography color="text.secondary">
          Send a direct message to another user.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="Recipient ID"
              placeholder="Enter the recipient's user ID"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              fullWidth
              required
              size="small"
            />
            <TextField
              label="Subject"
              placeholder="Optional subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Message"
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              required
              multiline
              rows={6}
            />
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={sending || !recipientId.trim() || !content.trim()}
              >
                {sending ? "Sending..." : "Send"}
              </Button>
              <Button variant="outlined" href="/messages">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
