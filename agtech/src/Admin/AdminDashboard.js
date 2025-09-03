import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Skeleton,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
  Fade,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  alpha,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import GroupIcon from "@mui/icons-material/Group";
import PercentIcon from "@mui/icons-material/Percent";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useTheme } from "@mui/material/styles";
import { AdminAPI } from "../api/adminApi";

// OPTIONAL: run `npm i recharts` (or `yarn add recharts`)
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#2e7d32", "#43a047", "#66bb6a", "#81c784", "#a5d6a7", "#c5e1a5"];

const StatCard = ({ label, value, icon, loading, accent = "success" }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2.2,
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
        minHeight: 122,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(145deg,#16251d,#1d3126)"
            : "linear-gradient(145deg,#ffffff,#f2faf3)",
        "&:before": {
          content: '""',
            position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 85% 15%, ${alpha(
            theme.palette[accent]?.main || theme.palette.success.main,
            0.18
          )}, transparent 70%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            letterSpacing: 0.7,
            opacity: 0.65,
          }}
        >
          {label.toUpperCase()}
        </Typography>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(
              theme.palette[accent]?.main || theme.palette.success.main,
              0.12
            ),
            color: theme.palette[accent]?.main || theme.palette.success.main,
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          lineHeight: 1.1,
          mt: 0.6,
          background: "linear-gradient(90deg,#2e7d32,#43a047,#66bb6a)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {loading ? <Skeleton width={60} /> : value}
      </Typography>
    </Paper>
  );
};

const EmptyState = ({ message }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 6,
      opacity: 0.7,
      fontStyle: "italic",
      fontSize: 14,
    }}
  >
    {message}
  </Box>
);

const AdminDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_farmers: 0, total_crops: 0 });
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState("bar"); // "bar" | "pie"
  const [viewMode, setViewMode] = useState("absolute"); // "absolute" | "percentage"
  const [farmerLimit, setFarmerLimit] = useState("top10"); // filtering option
  const [lastLoaded, setLastLoaded] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dash, chart] = await Promise.all([
        AdminAPI.dashboard(),
        AdminAPI.cropsPerFarmer(),
      ]);
      setStats(dash);
      setChartData(chart);
      setLastLoaded(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const processedChartData = useMemo(() => {
    if (!chartData?.length) return [];
    let data = [...chartData];
    // sort descending by total_crops
    data.sort((a, b) => b.total_crops - a.total_crops);
    if (farmerLimit === "top5") data = data.slice(0, 5);
    else if (farmerLimit === "top10") data = data.slice(0, 10);
    if (viewMode === "percentage") {
      const total = data.reduce((sum, d) => sum + d.total_crops, 0) || 1;
      return data.map((d) => ({
        ...d,
        displayValue: ((d.total_crops / total) * 100).toFixed(1),
        percentage: (d.total_crops / total) * 100,
      }));
    }
    return data.map((d) => ({
      ...d,
      displayValue: d.total_crops,
      percentage: d.total_crops,
    }));
  }, [chartData, farmerLimit, viewMode]);

  const maxValue = useMemo(
    () =>
      processedChartData.length
        ? Math.max(...processedChartData.map((d) => Number(d.displayValue)))
        : 0,
    [processedChartData]
  );

  const avgCropsPerFarmer = useMemo(() => {
    if (!stats.total_farmers) return 0;
    return (stats.total_crops / stats.total_farmers).toFixed(1);
  }, [stats]);

  const diversityIndex = useMemo(() => {
    // Simple measure: (#farmers with >=1 crop / total farmers) * 100
    if (!stats.total_farmers) return 0;
    const active = chartData.filter((c) => c.total_crops > 0).length;
    return ((active / stats.total_farmers) * 100).toFixed(1);
  }, [chartData, stats]);

  const headerGradient =
    theme.palette.mode === "dark"
      ? "linear-gradient(90deg,#144d2b,#1c6b3b,#228b22)"
      : "linear-gradient(90deg,#e8f5e9,#ffffff)";

  return (
    <Box>
      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3.5,
          borderRadius: 4,
          background: headerGradient,
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            width: 280,
            height: 280,
            top: -80,
            right: -60,
            background:
              "radial-gradient(circle at center, rgba(76,175,80,0.35), transparent 70%)",
            filter: "blur(8px)",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          gap={2.5}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background:
                  "linear-gradient(90deg,#2e7d32,#43a047,#66bb6a,#81c784)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                letterSpacing: 0.5,
              }}
            >
              Admin Performance Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{ opacity: 0.7, maxWidth: 560, mt: 0.6 }}
            >
              Real‑time snapshot of platform farming activity, crop distribution
              and farmer engagement. Use filters to explore data visually.
            </Typography>
            {lastLoaded && (
              <Typography
                variant="caption"
                sx={{ opacity: 0.55, display: "block", mt: 0.8 }}
              >
                Last updated: {lastLoaded.toLocaleTimeString()}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1.2} flexWrap="wrap">
            <Tooltip title="Reload data">
              <span>
                <IconButton
                  size="small"
                  onClick={loadData}
                  disabled={loading}
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: theme.palette.success.main,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.success.main, 0.2),
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>

            <ToggleButtonGroup
              size="small"
              exclusive
              value={chartType}
              onChange={(_, v) => v && setChartType(v)}
              sx={{
                background: alpha(theme.palette.success.main, 0.08),
                borderRadius: 3,
              }}
            >
              <ToggleButton value="bar" sx={{ px: 1.6 }}>
                <BarChartIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="pie" sx={{ px: 1.6 }}>
                <PieChartIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              size="small"
              exclusive
              value={viewMode}
              onChange={(_, v) => v && setViewMode(v)}
              sx={{
                background: alpha(theme.palette.success.main, 0.08),
                borderRadius: 3,
              }}
            >
              <ToggleButton value="absolute" sx={{ px: 1.5 }}>
                Abs
              </ToggleButton>
              <ToggleButton value="percentage" sx={{ px: 1.5 }}>
                %
              </ToggleButton>
            </ToggleButtonGroup>

            <FormControl
              size="small"
              sx={{ minWidth: 110 }}
              variant="outlined"
            >
              <InputLabel>
                <FilterAltIcon fontSize="small" sx={{ mr: 0.3 }} />
                Limit
              </InputLabel>
              <Select
                label="Limit"
                value={farmerLimit}
                onChange={(e) => setFarmerLimit(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="top10">Top 10</MenuItem>
                <MenuItem value="top5">Top 5</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            mb: 3,
            bgcolor: theme.palette.error.light,
            color: theme.palette.error.contrastText,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Failed to load data: {error}
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3} sx={{ mb: 0.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Farmers"
            value={stats.total_farmers}
            loading={loading}
            icon={<GroupIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Crops"
            value={stats.total_crops}
            loading={loading}
            icon={<AgricultureIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Avg Crops / Farmer"
            value={loading ? null : avgCropsPerFarmer}
            loading={loading}
            icon={<TrendingUpIcon fontSize="small" />}
            accent="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active Farmer %"
            value={loading ? null : `${diversityIndex}%`}
            loading={loading}
            icon={<PercentIcon fontSize="small" />}
            accent="secondary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{
              p: 2.7,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 1.2,
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(145deg,#182820,#15241d)"
                  : "linear-gradient(145deg,#ffffff,#f6faf5)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              spacing={1.5}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, letterSpacing: 0.5 }}
              >
                Crops per Farmer ({viewMode === "percentage" ? "%" : "count"})
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                label={
                  processedChartData.length
                    ? `${processedChartData.length} farmers`
                    : "No data"
                }
              />
            </Stack>
            <Divider />

            <Box sx={{ flexGrow: 1, minHeight: 320 }}>
              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Skeleton
                    variant="rounded"
                    height={260}
                    sx={{ mt: 2, borderRadius: 3 }}
                  />
                </Box>
              )}

              {!loading && !processedChartData.length && (
                <EmptyState message="No crop distribution data yet." />
              )}

              {!loading && processedChartData.length > 0 && (
                <Fade in timeout={600}>
                  <Box sx={{ width: "100%", height: 320 }}>
                    {chartType === "bar" ? (
                      <ResponsiveContainer>
                        <BarChart
                          data={processedChartData}
                          margin={{ top: 10, right: 10, left: -15, bottom: 35 }}
                        >
                          <XAxis
                            dataKey="username"
                            tick={{ fontSize: 11 }}
                            interval={0}
                            angle={-25}
                            dy={20}
                            height={60}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            width={38}
                            allowDecimals={false}
                            label={{
                              value:
                                viewMode === "percentage" ? "% Share" : "Crops",
                              angle: -90,
                              position: "insideLeft",
                              fontSize: 11,
                            }}
                          />
                          <ReTooltip
                            cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                            formatter={(val) =>
                              viewMode === "percentage" ? `${val}%` : val
                            }
                          />
                          <Bar
                            dataKey={viewMode === "percentage" ? "displayValue" : "displayValue"}
                            isAnimationActive
                            animationDuration={700}
                            radius={[6, 6, 0, 0]}
                            fill="url(#cropGradient)"
                          />
                          <defs>
                            <linearGradient id="cropGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="0%"
                                stopColor={theme.palette.success.dark}
                                stopOpacity={0.85}
                              />
                              <stop
                                offset="100%"
                                stopColor={theme.palette.success.light}
                                stopOpacity={0.65}
                              />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={processedChartData}
                            dataKey="displayValue"
                            nameKey="username"
                            innerRadius={60}
                            outerRadius={110}
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={-270}
                          >
                            {processedChartData.map((entry, index) => (
                              <Cell
                                key={entry.username}
                                fill={
                                  COLORS[index % COLORS.length] ||
                                  theme.palette.success.main
                                }
                              />
                            ))}
                          </Pie>
                          <Legend
                            verticalAlign="bottom"
                            height={64}
                            iconSize={10}
                            wrapperStyle={{ fontSize: 11 }}
                          />
                          <ReTooltip
                            formatter={(val, _, payload) =>
                              viewMode === "percentage"
                                ? [`${val}%`, payload?.payload?.username]
                                : [val, payload?.payload?.username]
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </Fade>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{
              p: 2.7,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(145deg,#1b2b23,#16231d)"
                  : "linear-gradient(145deg,#ffffff,#f6faf5)",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, letterSpacing: 0.5 }}
            >
              Distribution Insights
            </Typography>
            <Divider />
            {loading && (
              <Box>
                <Skeleton height={28} />
                <Skeleton height={28} />
                <Skeleton height={28} />
                <Skeleton height={28} />
              </Box>
            )}
            {!loading && processedChartData.length === 0 && (
              <EmptyState message="No insights available yet." />
            )}
            {!loading && processedChartData.length > 0 && (
              <Stack spacing={1.4}>
                {processedChartData.map((row, i) => {
                  const share =
                    viewMode === "percentage"
                      ? row.displayValue
                      : (
                          (row.total_crops /
                            (stats.total_crops || 1)) *
                          100
                        ).toFixed(1);
                  return (
                    <Box
                      key={row.username}
                      sx={{
                        p: 1.2,
                        borderRadius: 2.5,
                        background: alpha(
                          COLORS[i % COLORS.length],
                          theme.palette.mode === "dark" ? 0.18 : 0.12
                        ),
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.6,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: 13.5 }}
                        >
                          {row.username}
                        </Typography>
                        <Chip
                          size="small"
                          label={
                            viewMode === "percentage"
                              ? `${row.displayValue}%`
                              : `${row.total_crops} crops`
                          }
                          sx={{
                            fontSize: 11,
                            bgcolor: alpha(
                              COLORS[i % COLORS.length],
                              theme.palette.mode === "dark" ? 0.35 : 0.25
                            ),
                            color: "#fff",
                          }}
                        />
                      </Stack>
                      <Box
                        sx={{
                          position: "relative",
                          height: 6,
                          borderRadius: 3,
                          overflow: "hidden",
                          bgcolor: alpha(
                            theme.palette.text.primary,
                            theme.palette.mode === "dark" ? 0.2 : 0.08
                          ),
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            width: `${share}%`,
                            background: COLORS[i % COLORS.length],
                            transition: "width 500ms",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.65, fontSize: 11.5 }}
                      >
                        Share: {share}%
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;