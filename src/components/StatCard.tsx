import type { SvgIconComponent } from "@mui/icons-material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
export type StatCardProps = {
  label: string;
  value: string;
  icon: SvgIconComponent;
  accent?: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: StatCardProps) {
  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Icon sx={{ color: accent ?? "primary.main" }} />
        </Stack>
        <Typography variant="h3" sx={{ mt: 2 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
