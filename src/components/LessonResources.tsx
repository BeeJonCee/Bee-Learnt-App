"use client";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useApi } from "@/hooks/useApi";

type LessonResource = {
  id: number;
  title: string;
  type: "pdf" | "link" | "video" | "diagram";
  url: string;
  tags: string[] | null;
};

type LessonResourcesProps = {
  lessonId: number;
};

export default function LessonResources({ lessonId }: LessonResourcesProps) {
  const { data, loading, error } = useApi<LessonResource[]>(
    lessonId ? `/api/resources?lessonId=${lessonId}` : null,
  );

  const resources = data ?? [];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LibraryBooksIcon color="primary" />
            <Typography variant="h6">Resource library</Typography>
          </Stack>

          {loading && !data && (
            <Typography variant="body2" color="text.secondary">
              Loading resources...
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {resources.length === 0 && !loading ? (
            <Typography variant="body2" color="text.secondary">
              No resources linked to this lesson yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {resources.map((resource) => (
                <Stack key={resource.id} spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1">
                      {resource.title}
                    </Typography>
                    <Chip label={resource.type} size="small" />
                  </Stack>
                  {resource.type === "video" && (
                    <Box
                      component="iframe"
                      src={resource.url}
                      title={resource.title}
                      sx={{
                        width: "100%",
                        minHeight: 220,
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  )}
                  {resource.type === "diagram" && (
                    <Box
                      component="img"
                      src={resource.url}
                      alt={resource.title}
                      sx={{
                        width: "100%",
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  )}
                  <Link href={resource.url} target="_blank" rel="noopener">
                    {resource.url}
                  </Link>
                  {resource.tags && resource.tags.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {resource.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
