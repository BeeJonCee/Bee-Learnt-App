import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
export type AssignmentItem = {
  id: number;
  title: string;
  description?: string | null;
  dueDate: string | Date;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "submitted" | "graded";
  grade: number;
  moduleTitle?: string;
};

type AssignmentListProps = {
  items: AssignmentItem[];
  onToggle: (assignmentId: number) => void;
  showModule?: boolean;
};

function getDueLabel(dueDate: string | Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} days`;
  }
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due in ${diffDays} days`;
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AssignmentList({
  items,
  onToggle,
  showModule,
}: AssignmentListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No assignments yet.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {items.map((assignment) => {
        const isCompleted =
          assignment.status === "submitted" || assignment.status === "graded";
        return (
          <Card key={assignment.id}>
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Checkbox
                      checked={isCompleted}
                      onChange={() => onToggle(assignment.id)}
                    />
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{
                        textDecoration: isCompleted ? "line-through" : "none",
                      }}
                    >
                      {assignment.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {assignment.description}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={formatLabel(assignment.priority)}
                      size="small"
                    />
                    <Chip label={formatLabel(assignment.status)} size="small" />
                    <Chip label={`Grade ${assignment.grade}`} size="small" />
                    {showModule && assignment.moduleTitle && (
                      <Chip
                        label={assignment.moduleTitle}
                        size="small"
                        color="secondary"
                      />
                    )}
                  </Stack>
                </Stack>
                <Box textAlign={{ xs: "left", md: "right" }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={isCompleted ? "text.secondary" : "primary.main"}
                  >
                    {isCompleted
                      ? "Completed"
                      : getDueLabel(assignment.dueDate)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
