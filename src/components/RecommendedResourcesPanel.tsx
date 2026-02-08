"use client";

import ArticleIcon from "@mui/icons-material/Article";
import BookIcon from "@mui/icons-material/Book";
import LinkIcon from "@mui/icons-material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type Resource = {
  id: string;
  title: string;
  description: string;
  type: "video" | "article" | "textbook" | "interactive";
  subject: string;
  topic: string;
  url: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number; // minutes
  rating: number; // 0-5
  reviews: number;
  relevanceScore: number; // 0-100
  saved: boolean;
};

type RecommendedResources = {
  personalized: Resource[];
  trending: Resource[];
  byDifficulty: {
    beginner: Resource[];
    intermediate: Resource[];
    advanced: Resource[];
  };
  categoryStats: {
    name: string;
    resources: number;
    avgRating: number;
  }[];
};

const typeIcons = {
  video: VideoLibraryIcon,
  article: ArticleIcon,
  textbook: BookIcon,
  interactive: LinkIcon,
};

const typeLabelMap = {
  video: "Video",
  article: "Article",
  textbook: "Textbook",
  interactive: "Interactive",
};

export default function RecommendedResourcesPanel() {
  const {
    data: resources,
    loading,
    error,
    refetch,
  } = useApi<RecommendedResources>("/api/student/recommended-resources");

  const categoryData = useMemo(
    () => resources?.categoryStats ?? [],
    [resources?.categoryStats],
  );

  const handleSaveResource = async (resourceId: string, saved: boolean) => {
    try {
      await apiFetch(`/api/student/resources/${resourceId}/save`, {
        method: "PATCH",
        body: JSON.stringify({ saved: !saved }),
      });
      refetch();
    } catch (err) {
      console.error("Failed to save resource:", err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Loading resources...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!resources) {
    return null;
  }

  const ResourceCard = ({
    resource,
    showRelevance = false,
  }: {
    resource: Resource;
    showRelevance?: boolean;
  }) => {
    const Icon = typeIcons[resource.type];
    return (
      <Card key={resource.id}>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Stack spacing={0.5} flex={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Icon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    {resource.title}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {resource.subject} • {resource.topic}
                </Typography>
              </Stack>
              <Chip
                label={typeLabelMap[resource.type]}
                size="small"
                variant="outlined"
              />
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.4 }}
            >
              {resource.description}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Rating value={resource.rating} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  ({resource.reviews})
                </Typography>
              </Stack>
              <Chip
                label={`${resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}`}
                size="small"
                color={
                  resource.difficulty === "beginner"
                    ? "success"
                    : resource.difficulty === "intermediate"
                      ? "warning"
                      : "error"
                }
              />
              <Typography variant="caption" color="text.secondary">
                {resource.duration} min
              </Typography>
              {showRelevance && (
                <Chip
                  label={`${resource.relevanceScore}% match`}
                  size="small"
                  variant="filled"
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                component="a"
                href={resource.url}
                target="_blank"
                rel="noopener"
                size="small"
                variant="contained"
                endIcon={<OpenInNewIcon fontSize="small" />}
              >
                Open
              </Button>
              <Button
                size="small"
                variant={resource.saved ? "contained" : "outlined"}
                color={resource.saved ? "primary" : "inherit"}
                startIcon={<ThumbUpIcon fontSize="small" />}
                onClick={() => handleSaveResource(resource.id, resource.saved)}
              >
                {resource.saved ? "Saved" : "Save"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Stack spacing={3}>
      {/* Category Stats Chart */}
      {categoryData.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Resources" color="primary" size="small" />
                <Typography variant="body2" color="text.secondary">
                  Available by category
                </Typography>
              </Stack>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="resources"
                      fill="#8884d8"
                      name="Total Resources"
                    />
                    <Bar dataKey="avgRating" fill="#82ca9d" name="Avg Rating" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      {resources.personalized.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">
            🎯 Personalized for You ({resources.personalized.length})
          </Typography>
          <Grid container spacing={2}>
            {resources.personalized.slice(0, 3).map((resource) => (
              <Grid item xs={12} md={6} lg={4} key={resource.id}>
                <ResourceCard resource={resource} showRelevance />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {/* Resources by Difficulty */}
      {Object.entries(resources.byDifficulty).map(([difficulty, items]) => {
        if (items.length === 0) return null;
        return (
          <Stack key={difficulty} spacing={2}>
            <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
              {difficulty === "beginner"
                ? "🌱 Beginner Friendly"
                : difficulty === "intermediate"
                  ? "📈 Intermediate"
                  : "🚀 Advanced"}
            </Typography>
            <Grid container spacing={2}>
              {items.slice(0, 3).map((resource) => (
                <Grid item xs={12} md={6} lg={4} key={resource.id}>
                  <ResourceCard resource={resource} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        );
      })}

      {/* Trending Resources */}
      {resources.trending.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">
            🔥 Trending Now ({resources.trending.length})
          </Typography>
          <Grid container spacing={2}>
            {resources.trending.slice(0, 3).map((resource) => (
              <Grid item xs={12} md={6} lg={4} key={resource.id}>
                <ResourceCard resource={resource} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {/* Summary Card */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Learning Resources Guide</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Total Resources</Typography>
                  <Typography variant="h6">
                    {resources.personalized.length +
                      resources.trending.length +
                      Object.values(resources.byDifficulty).reduce(
                        (sum, arr) => sum + arr.length,
                        0,
                      )}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Average Rating</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Rating
                      value={
                        categoryData.length > 0
                          ? Number(
                              (
                                categoryData.reduce(
                                  (sum, cat) => sum + cat.avgRating,
                                  0,
                                ) / categoryData.length
                              ).toFixed(1),
                            )
                          : 0
                      }
                      readOnly
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {categoryData.length > 0
                        ? (
                            categoryData.reduce(
                              (sum, cat) => sum + cat.avgRating,
                              0,
                            ) / categoryData.length
                          ).toFixed(1)
                        : 0}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary">
              Resources are curated based on your learning progress and
              difficulty level. Start with beginner resources and progress to
              advanced materials.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
