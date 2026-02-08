"use client";

import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import alpha from "@mui/material/alpha";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useMemo, useState } from "react";

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  hidden?: "xs" | "sm" | "md" | "lg" | "xl";
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
}

export interface ActionItem<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  show?: (row: T) => boolean;
}

interface DataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  actions?: ActionItem<T>[];
  onRowClick?: (row: T) => void;
  onCreate?: () => void;
  createLabel?: string;
  loading?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  filters?: { label: string; value: string }[];
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
}

type SortDirection = "asc" | "desc";

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  title,
  searchPlaceholder = "Search...",
  searchKeys = [],
  actions,
  onRowClick,
  onCreate,
  createLabel = "Create New",
  loading = false,
  pageSize = 10,
  emptyMessage = "No data found",
  filters,
  onFilterChange,
  activeFilter,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      if (searchKeys.length === 0) {
        // Search all string fields
        return Object.values(row as Record<string, unknown>).some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(query),
        );
      }
      return searchKeys.some((key) => {
        const value = row[key];
        return typeof value === "string" && value.toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortBy as keyof T];
      const bVal = b[sortBy as keyof T];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortBy, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = useCallback((columnId: string) => {
    setSortBy((prev) => {
      if (prev === columnId) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        return columnId;
      }
      setSortDirection("asc");
      return columnId;
    });
  }, []);

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, row: T) => {
    event.stopPropagation();
    setSelectedRow(row);
    setAnchorEl(event.currentTarget);
  };

  const handleActionSelect = (action: ActionItem<T>) => {
    if (selectedRow) {
      action.onClick(selectedRow);
    }
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const getHiddenStyle = (hidden?: string) => {
    if (!hidden) return {};
    const breakpoints: Record<string, object> = {
      xs: { display: { xs: "none", sm: "table-cell" } },
      sm: { display: { xs: "none", md: "table-cell" } },
      md: { display: { xs: "none", lg: "table-cell" } },
      lg: { display: { xs: "none", xl: "table-cell" } },
    };
    return breakpoints[hidden] || {};
  };

  const getValue = (row: T, columnId: string) => {
    const keys = columnId.split(".");
    let value: unknown = row;
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key];
    }
    return value;
  };

  return (
    <Card>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {title && (
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          )}
          {sortedData.length > 0 && (
            <Chip
              size="small"
              label={`${sortedData.length} items`}
              sx={{ bgcolor: alpha("#FFD600", 0.1), color: "primary.main" }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />

          {filters && filters.length > 0 && (
            <>
              <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
                <FilterListIcon />
              </IconButton>
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={() => setFilterAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    onFilterChange?.("");
                    setFilterAnchorEl(null);
                  }}
                  selected={!activeFilter}
                >
                  All
                </MenuItem>
                {filters.map((filter) => (
                  <MenuItem
                    key={filter.value}
                    onClick={() => {
                      onFilterChange?.(filter.value);
                      setFilterAnchorEl(null);
                    }}
                    selected={activeFilter === filter.value}
                  >
                    {filter.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {onCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreate}
              size="small"
            >
              {createLabel}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  sx={{
                    minWidth: column.minWidth,
                    fontWeight: 600,
                    ...getHiddenStyle(column.hidden),
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : "asc"}
                      onClick={() => handleSort(String(column.id))}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell align="right" sx={{ width: 60 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no identity
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.id)}
                      sx={getHiddenStyle(column.hidden)}
                    >
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <Skeleton variant="circular" width={24} height={24} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:last-child td": { border: 0 },
                  }}
                >
                  {columns.map((column) => {
                    const value = getValue(row, String(column.id));
                    return (
                      <TableCell
                        key={String(column.id)}
                        align={column.align}
                        sx={getHiddenStyle(column.hidden)}
                      >
                        {column.render
                          ? column.render(value as T[keyof T], row, rowIndex)
                          : String(value ?? "-")}
                      </TableCell>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionClick(e, row)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, borderTop: 1, borderColor: "divider" }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, sortedData.length)} of{" "}
            {sortedData.length} entries
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedRow(null);
        }}
      >
        {actions?.map((action) => {
          if (selectedRow && action.show && !action.show(selectedRow)) {
            return null;
          }
          return (
            <MenuItem
              key={action.label}
              onClick={() => handleActionSelect(action)}
              sx={{
                color: action.color ? `${action.color}.main` : "inherit",
              }}
            >
              {action.icon && (
                <Box component="span" sx={{ mr: 1, display: "flex" }}>
                  {action.icon}
                </Box>
              )}
              {action.label}
            </MenuItem>
          );
        })}
      </Menu>
    </Card>
  );
}
