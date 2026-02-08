"use client";

import BiotechIcon from "@mui/icons-material/Biotech";
import ComputerIcon from "@mui/icons-material/Computer";
import FunctionsIcon from "@mui/icons-material/Functions";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ScienceIcon from "@mui/icons-material/Science";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";

type Subject = {
  id: number;
  name: string;
  description?: string | null;
  minGrade: number;
  maxGrade: number;
};

const subjectIcons: Record<string, typeof MenuBookIcon> = {
  Mathematics: FunctionsIcon,
  "Physical Sciences": ScienceIcon,
  "Life Sciences": BiotechIcon,
  "Information Technology": ComputerIcon,
};

function SubjectIcon({ subject }: { subject: Subject }) {
  const Icon = subjectIcons[subject.name] ?? MenuBookIcon;
  return <Icon sx={{ fontSize: 48, color: "primary.main" }} />;
}

export default function SubjectsPage() {
  const { data, loading, error } = useApi<Subject[]>("/api/subjects");
  const subjects = data ?? [];

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">Explore subjects</Typography>
        <Typography color="text.secondary">
          CAPS-aligned lessons designed to build confidence and mastery.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Loading subjects...</Typography>
          </CardContent>
        </Card>
      ) : subjects.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No subjects found. Check your backend connection and seed data.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {subjects.map((subject) => {
            const gradeLabel =
              subject.minGrade === subject.maxGrade
                ? `Grade ${subject.minGrade}`
                : `Grades ${subject.minGrade}-${subject.maxGrade}`;

            return (
              <Grid item xs={12} md={6} lg={4} key={subject.id}>
                <Card>
                  <CardActionArea
                    component={Link}
                    href={`/subjects/${subject.id}`}
                  >
                    <Box
                      sx={{
                        height: 180,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "linear-gradient(135deg, rgba(246, 201, 69, 0.16), rgba(255,255,255,0))",
                      }}
                    >
                      <SubjectIcon subject={subject} />
                    </Box>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Chip
                          label={gradeLabel}
                          color="primary"
                          size="small"
                          sx={{ alignSelf: "flex-start" }}
                        />
                        <Typography variant="h5">{subject.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subject.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
