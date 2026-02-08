"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMemo } from "react";

type HexModule = {
  id: number;
  title: string;
  grade: number;
  subjectName: string;
};

type HexModulePickerProps = {
  modules: HexModule[];
  onPick: (module: HexModule) => void;
};

const gradeColors: Record<number, { fill: string; stroke: string }> = {
  10: { fill: "rgba(255, 214, 0, 0.32)", stroke: "rgba(255, 214, 0, 0.9)" },
  11: { fill: "rgba(91, 192, 235, 0.28)", stroke: "rgba(91, 192, 235, 0.9)" },
  12: { fill: "rgba(249, 115, 22, 0.28)", stroke: "rgba(249, 115, 22, 0.9)" },
};

export default function HexModulePicker({
  modules,
  onPick,
}: HexModulePickerProps) {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));

  const columns = isLg ? 5 : isMd ? 4 : isSm ? 3 : 2;
  const radius = isSm ? 52 : 44;
  const hexWidth = Math.sqrt(3) * radius;
  const hexHeight = 2 * radius;
  const rowSpacing = hexHeight * 0.75;

  const hexPath = useMemo(() => {
    const angle = Math.PI / 3;
    const points = Array.from({ length: 6 }, (_value, index) => {
      const radians = angle * index - Math.PI / 6;
      return [radius * Math.cos(radians), radius * Math.sin(radians)];
    });
    const [first, ...rest] = points;
    return `M ${first[0]} ${first[1]} ${rest
      .map((point) => `L ${point[0]} ${point[1]}`)
      .join(" ")} Z`;
  }, [radius]);

  const layout = useMemo(() => {
    const rows = Math.ceil(modules.length / columns);
    const width = columns * hexWidth + hexWidth / 2;
    const height = rows * rowSpacing + radius;

    const positions = modules.map((module, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = col * hexWidth + (row % 2 ? hexWidth / 2 : 0) + radius;
      const y = row * rowSpacing + radius;
      return { module, x, y };
    });

    return { width, height, positions };
  }, [columns, hexWidth, modules, radius, rowSpacing]);

  if (modules.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary">
          All available modules are on your dashboard.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Box
        component="svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        sx={{
          width: "100%",
          height: { xs: 320, sm: 380, md: 460 },
        }}
      >
        {layout.positions.map(({ module, x, y }) => {
          const colors = gradeColors[module.grade] ?? {
            fill: "rgba(255,255,255,0.08)",
            stroke: "rgba(255,255,255,0.3)",
          };
          const lines = module.title
            .split(" ")
            .reduce<string[]>((acc, word) => {
              if (acc.length === 0) return [word];
              const next = `${acc[acc.length - 1]} ${word}`;
              if (next.length > 16) {
                acc.push(word);
              } else {
                acc[acc.length - 1] = next;
              }
              return acc;
            }, []);

          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: SVG interactive element
            <g
              key={module.id}
              transform={`translate(${x},${y})`}
              onClick={() => onPick(module)}
              style={{ cursor: "pointer" }}
            >
              <path
                d={hexPath}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={2}
              />
              <text
                textAnchor="middle"
                fill={theme.palette.text.primary}
                fontSize={12}
                fontWeight={600}
              >
                {lines.slice(0, 2).map((line, index) => (
                  <tspan key={line} x={0} dy={index === 0 ? -4 : 16}>
                    {line}
                  </tspan>
                ))}
              </text>
              <text
                textAnchor="middle"
                fill={theme.palette.text.secondary}
                fontSize={10}
                y={radius * 0.55}
              >
                Grade {module.grade}
              </text>
            </g>
          );
        })}
      </Box>
    </Box>
  );
}
