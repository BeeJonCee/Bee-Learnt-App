"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

const audienceOptions = ["ALL", "STUDENT", "PARENT", "ADMIN"] as const;

type AnnouncementPayload = {
  title: string;
  body: string;
  audience: (typeof audienceOptions)[number];
  pinned: boolean;
  publishedAt?: string;
};

type EventPayload = {
  title: string;
  description: string;
  audience: (typeof audienceOptions)[number];
  startAt: string;
  endAt?: string | null;
  allDay: boolean;
  location?: string | null;
};

type Announcement = AnnouncementPayload & { id: number; publishedAt: string };

type EventItem = EventPayload & { id: number };

export default function AdminAnnouncementsEventsPage() {
  const [announcement, setAnnouncement] = useState<AnnouncementPayload>({
    title: "",
    body: "",
    audience: "ALL",
    pinned: false,
  });
  const [event, setEvent] = useState<EventPayload>({
    title: "",
    description: "",
    audience: "ALL",
    startAt: "",
    endAt: "",
    allDay: false,
    location: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: announcements, refetch: refetchAnnouncements } = useApi<
    Announcement[]
  >("/api/announcements?limit=10");
  const { data: events, refetch: refetchEvents } = useApi<EventItem[]>(
    "/api/events?limit=10",
  );

  const canSaveAnnouncement = useMemo(
    () =>
      announcement.title.trim().length > 2 &&
      announcement.body.trim().length > 9,
    [announcement],
  );
  const canSaveEvent = useMemo(
    () =>
      event.title.trim().length > 2 &&
      event.description.trim().length > 4 &&
      event.startAt,
    [event],
  );

  const resetNotice = () => {
    setMessage(null);
    setError(null);
  };

  const handleCreateAnnouncement = async () => {
    resetNotice();
    try {
      await apiFetch("/api/announcements", {
        method: "POST",
        body: JSON.stringify(announcement),
      });
      setMessage("Announcement created.");
      setAnnouncement({ title: "", body: "", audience: "ALL", pinned: false });
      refetchAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create announcement",
      );
    }
  };

  const handleCreateEvent = async () => {
    resetNotice();
    try {
      await apiFetch("/api/events", {
        method: "POST",
        body: JSON.stringify({
          ...event,
          endAt: event.endAt || null,
          location: event.location || null,
        }),
      });
      setMessage("Event created.");
      setEvent({
        title: "",
        description: "",
        audience: "ALL",
        startAt: "",
        endAt: "",
        allDay: false,
        location: "",
      });
      refetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    }
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h3">Announcements & events</Typography>
        <Typography color="text.secondary">
          Publish school-wide updates and upcoming dates.
        </Typography>
      </Stack>

      {(message || error) && (
        <Alert severity={error ? "error" : "success"}>{error ?? message}</Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">New announcement</Typography>
                <TextField
                  label="Title"
                  value={announcement.title}
                  onChange={(event) =>
                    setAnnouncement((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
                <TextField
                  label="Message"
                  value={announcement.body}
                  onChange={(event) =>
                    setAnnouncement((prev) => ({
                      ...prev,
                      body: event.target.value,
                    }))
                  }
                  minRows={3}
                  multiline
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Audience"
                      value={announcement.audience}
                      onChange={(event) =>
                        setAnnouncement((prev) => ({
                          ...prev,
                          audience: event.target
                            .value as AnnouncementPayload["audience"],
                        }))
                      }
                    >
                      {audienceOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Pinned"
                      value={announcement.pinned ? "yes" : "no"}
                      onChange={(event) =>
                        setAnnouncement((prev) => ({
                          ...prev,
                          pinned: event.target.value === "yes",
                        }))
                      }
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  onClick={handleCreateAnnouncement}
                  disabled={!canSaveAnnouncement}
                >
                  Publish announcement
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">New event</Typography>
                <TextField
                  label="Title"
                  value={event.title}
                  onChange={(eventValue) =>
                    setEvent((prev) => ({
                      ...prev,
                      title: eventValue.target.value,
                    }))
                  }
                />
                <TextField
                  label="Description"
                  value={event.description}
                  onChange={(eventValue) =>
                    setEvent((prev) => ({
                      ...prev,
                      description: eventValue.target.value,
                    }))
                  }
                  minRows={3}
                  multiline
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Audience"
                      value={event.audience}
                      onChange={(eventValue) =>
                        setEvent((prev) => ({
                          ...prev,
                          audience: eventValue.target
                            .value as EventPayload["audience"],
                        }))
                      }
                    >
                      {audienceOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="All day"
                      value={event.allDay ? "yes" : "no"}
                      onChange={(eventValue) =>
                        setEvent((prev) => ({
                          ...prev,
                          allDay: eventValue.target.value === "yes",
                        }))
                      }
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="datetime-local"
                      label="Start"
                      value={event.startAt}
                      onChange={(eventValue) =>
                        setEvent((prev) => ({
                          ...prev,
                          startAt: eventValue.target.value,
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="datetime-local"
                      label="End"
                      value={event.endAt ?? ""}
                      onChange={(eventValue) =>
                        setEvent((prev) => ({
                          ...prev,
                          endAt: eventValue.target.value,
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Location"
                  value={event.location ?? ""}
                  onChange={(eventValue) =>
                    setEvent((prev) => ({
                      ...prev,
                      location: eventValue.target.value,
                    }))
                  }
                />
                <Button
                  variant="contained"
                  onClick={handleCreateEvent}
                  disabled={!canSaveEvent}
                >
                  Publish event
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent announcements</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1.5}>
                {(announcements ?? []).length === 0 ? (
                  <Typography color="text.secondary">
                    No announcements yet.
                  </Typography>
                ) : (
                  (announcements ?? []).map((announcement) => (
                    <Stack key={announcement.id} spacing={0.5}>
                      <Typography fontWeight={600}>
                        {announcement.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {announcement.body}
                      </Typography>
                    </Stack>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Upcoming events</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1.5}>
                {(events ?? []).length === 0 ? (
                  <Typography color="text.secondary">No events yet.</Typography>
                ) : (
                  (events ?? []).map((eventItem) => (
                    <Stack key={eventItem.id} spacing={0.5}>
                      <Typography fontWeight={600}>
                        {eventItem.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {eventItem.description}
                      </Typography>
                    </Stack>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
