"use client";

import SearchIcon from "@mui/icons-material/Search";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/utils/api";

type SearchResults = {
  subjects: { id: number; name: string; description?: string | null }[];
  modules: {
    id: number;
    title: string;
    description?: string | null;
    grade: number;
  }[];
  lessons: { id: number; title: string }[];
  resources: { id: number; title: string; url: string; type: string }[];
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<SearchResults>(
          `/api/search?query=${encodeURIComponent(query.trim())}`,
        );
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [query]);

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h3">Search</Typography>
        <Typography color="text.secondary">
          Find subjects, modules, lessons, and resources across BeeLearnt.
        </Typography>
      </Stack>

      <TextField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search for SQL, algorithms, binary, or SDLC"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
      />

      {loading && <Typography color="text.secondary">Searching...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {results && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Subjects</Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {results.subjects.length === 0 ? (
                    <Typography color="text.secondary">
                      No subjects found.
                    </Typography>
                  ) : (
                    results.subjects.map((subject) => (
                      <Stack key={subject.id} spacing={0.5}>
                        <Typography
                          component={Link}
                          href={`/subjects/${subject.id}`}
                          sx={{ color: "primary.main" }}
                        >
                          {subject.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subject.description}
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
                <Typography variant="h6">Modules</Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {results.modules.length === 0 ? (
                    <Typography color="text.secondary">
                      No modules found.
                    </Typography>
                  ) : (
                    results.modules.map((module) => (
                      <Stack key={module.id} spacing={0.5}>
                        <Typography
                          component={Link}
                          href={`/modules/${module.id}`}
                          sx={{ color: "primary.main" }}
                        >
                          {module.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={`Grade ${module.grade}`} size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {module.description}
                          </Typography>
                        </Stack>
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
                <Typography variant="h6">Lessons</Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {results.lessons.length === 0 ? (
                    <Typography color="text.secondary">
                      No lessons found.
                    </Typography>
                  ) : (
                    results.lessons.map((lesson) => (
                      <Typography
                        key={lesson.id}
                        component={Link}
                        href={`/lessons/${lesson.id}`}
                        sx={{ color: "primary.main" }}
                      >
                        {lesson.title}
                      </Typography>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Resources</Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {results.resources.length === 0 ? (
                    <Typography color="text.secondary">
                      No resources found.
                    </Typography>
                  ) : (
                    results.resources.map((resource) => (
                      <Stack key={resource.id} spacing={0.5}>
                        <Typography
                          component="a"
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: "primary.main" }}
                        >
                          {resource.title}
                        </Typography>
                        <Chip label={resource.type} size="small" />
                      </Stack>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
