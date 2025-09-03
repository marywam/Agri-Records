// FarmerDashboard (centered metric cards -> Crops by Type -> row: Harvest Progress + Distribution -> Recent Crops)
// Dark/Light mode toggle REMOVED (moved to sidebar/topbar as per request).
// Requirements: @mui/material @mui/icons-material recharts axios react-countup

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  IconButton,
  Alert,
  Button,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import RefreshIcon from "@mui/icons-material/Refresh";
import CountUp from "react-countup";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ---------------- Data Hook ---------------- */
const useFarmerDashboardData = (apiUrl) => {
  const [data, setData] = useState({
    totalCrops: 0,
    cropsByType: [],
    recentCrops: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [cropsRes, typeRes, recentRes] = await Promise.all([
        axios.get(`${apiUrl}/farmer/dashboard/`, { headers }),
        axios.get(`${apiUrl}/farmer/crops-by-type/`, { headers }),
        axios.get(`${apiUrl}/crops/`, { headers, params: { limit: 8 } }),
      ]);
      setData({
        totalCrops: cropsRes.data?.total_crops || 0,
        cropsByType: Array.isArray(typeRes.data) ? typeRes.data : [],
        recentCrops: Array.isArray(recentRes.data) ? recentRes.data : [],
      });
    } catch (e) {
      console.error(e);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refetch: fetchAll };
};

/* -------------- Compact Metric Card -------------- */
const MetricCard = ({ title, value, accent, icon, gradient, loading }) => {
  return (
    <Tooltip title={title} arrow placement="top">
      <Card
        elevation={3}
        sx={{
          width: 170,
          minHeight: 118,
          borderRadius: 2,
          background: gradient,
          color: "#fff",
          display: "flex",
        }}
      >
        <CardContent
          sx={{
            p: 1.4,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.4,
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.18)",
              width: 38,
              height: 38,
              mb: 0.2,
            }}
          >
            {icon}
          </Avatar>
            <Typography
            variant="subtitle2"
            sx={{ letterSpacing: 0.3, fontWeight: 600, lineHeight: 1 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, lineHeight: 1.1, mt: 0.2 }}
          >
            {loading ? "..." : <CountUp end={value} duration={0.9} separator="," />}
          </Typography>
          {accent && (
            <Typography
              variant="caption"
              sx={{
                mt: 0.1,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.18)",
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {accent}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Tooltip>
  );
};

/* ---------------- Bar Chart ---------------- */
const CropTypeBarChart = ({ data }) => {
  const theme = useTheme();
  if (!data?.length)
    return (
      <Box sx={{ p: 3, textAlign: "center", opacity: 0.65, fontSize: 14 }}>
        No crop type data yet.
      </Box>
    );
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        barSize={38}
        margin={{ top: 10, right: 20, left: 4, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="type"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <ReTooltip />
        <Legend />
        <Bar
          dataKey="total"
          name="Number"
          fill={theme.palette.success.main}
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ---------------- Harvest Progress Donut ---------------- */
const HarvestProgressDonut = ({ harvested, total }) => {
  const percent = total ? Math.round((harvested / total) * 100) : 0;
  return (
    <Box
      sx={{
        width: 140,
        height: 140,
        mx: "auto",
        position: "relative",
      }}
    >
      <CircularProgress
        variant="determinate"
        value={100}
        size={140}
        thickness={4}
        sx={{ color: "action.hover", position: "absolute", left: 0 }}
      />
      <CircularProgress
        variant="determinate"
        value={percent}
        size={140}
        thickness={4}
        color="success"
        sx={{ position: "absolute", left: 0 }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 0.2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1 }}>
          {percent}%
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Harvested
        </Typography>
      </Box>
    </Box>
  );
};

/* ---------------- Distribution Pie ---------------- */
const CropDistributionPie = ({ data }) => {
  const theme = useTheme();
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.secondary.main,
  ];
  if (!data?.length)
    return (
      <Box sx={{ p: 3, textAlign: "center", opacity: 0.65, fontSize: 14 }}>
        No distribution data yet.
      </Box>
    );
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="type"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={3}
          labelLine={false}
          label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <ReTooltip />
        <Legend verticalAlign="bottom" height={32} />
      </PieChart>
    </ResponsiveContainer>
  );
};

/* ---------------- Recent Crops List ---------------- */
const RecentCrops = ({ crops }) => {
  if (!crops?.length)
    return (
      <Box sx={{ p: 3, textAlign: "center", opacity: 0.6 }}>
        <Typography variant="body2">No crops recorded yet.</Typography>
      </Box>
    );
  return (
    <List dense disablePadding>
      {crops.map((crop, i) => (
        <React.Fragment key={crop.id}>
          <ListItem sx={{ py: 1, px: 1 }}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: crop.harvested ? "success.main" : "warning.main",
                }}
              >
                <AgricultureIcon fontSize="small" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box
                  display="flex"
                  gap={0.7}
                  flexWrap="wrap"
                  alignItems="center"
                  sx={{ fontSize: 13 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {crop.name}
                  </Typography>
                  <Chip size="small" label={crop.type} variant="outlined" />
                  <Chip
                    size="small"
                    label={`Qty ${crop.quantity}`}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={new Date(crop.planted_date).toLocaleDateString()}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={crop.harvested ? "Harvested" : "Growing"}
                    color={crop.harvested ? "success" : "warning"}
                  />
                </Box>
              }
              secondary={
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.6, fontSize: 10 }}
                >
                  ID: {crop.id}
                </Typography>
              }
            />
          </ListItem>
          {i < crops.length - 1 && <Divider component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

/* ---------------- Main Component ---------------- */
const FarmerDashboard = () => {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const { totalCrops, cropsByType, recentCrops, loading, error, refetch } =
    useFarmerDashboardData(apiUrl);

  const harvestedCount = useMemo(
    () => recentCrops.filter((c) => c.harvested).length,
    [recentCrops]
  );
  const growingCount = Math.max(0, totalCrops - harvestedCount);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Header (no theme toggle here) */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        textAlign="flex-start"
        mb={1}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(90deg,#2e7d32,#43a047)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            letterSpacing: 0.5,
          }}
        >
          Farmer Dashboard
        </Typography>
        <Typography
          variant="body2"
          sx={{ opacity: 0.7, mt: 0.4, maxWidth: 540, lineHeight: 1.3 }}
        >
          Quick overview of your farm activity and performance.
        </Typography>

        <Stack direction="row" spacing={1.5} mt={1.5}>
          <Button
            size="small"
            variant="contained"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={refetch}
            sx={{
                backgroundColor: "green",
                "&:hover": { backgroundColor: "#006400" },
                color: "white",
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ borderRadius: 2, maxWidth: 600, mx: "auto" }}
          action={
            <IconButton size="small" color="inherit" onClick={refetch}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Metric Cards Centered */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.4,
          justifyContent: "center",
          alignItems: "stretch",
          mt: 0.5,
        }}
      >
        <MetricCard
          title="Total Crops"
          value={totalCrops}
          accent="All"
          loading={loading}
          icon={<AgricultureIcon fontSize="small" />}
          gradient="linear-gradient(135deg,#2e7d32,#43a047)"
        />
        <MetricCard
          title="Harvested"
          value={harvestedCount}
          accent={
            totalCrops ? `${Math.round((harvestedCount / totalCrops) * 100)}%` : "0%"
          }
          loading={loading}
          icon={<EmojiNatureIcon fontSize="small" />}
          gradient="linear-gradient(135deg,#ef6c00,#ff9800)"
        />
        <MetricCard
          title="Growing"
          value={growingCount}
          accent="Active"
          loading={loading}
          icon={<TrendingUpIcon fontSize="small" />}
          gradient="linear-gradient(135deg,#1565c0,#42a5f5)"
        />
        <MetricCard
          title="Crop Types"
          value={cropsByType.length}
          accent="Variety"
          loading={loading}
          icon={<LocalOfferIcon fontSize="small" />}
          gradient="linear-gradient(135deg,#6a1b9a,#9c27b0)"
        />
      </Box>

      {/* Crops by Type Section (full width container centered) */}
      <Box
        sx={{
          mt: 1.5,
          background: (t) =>
            t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#ffffff",
          borderRadius: 3,
          boxShadow: 3,
          p: { xs: 2, md: 2.5 },
          maxWidth: 1100,
          mx: "auto",
          width: "100%",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          flexWrap="wrap"
          alignItems="center"
          mb={0.5}
          gap={1}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Crops by Type
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.65, letterSpacing: 0.3 }}
            >
              Breakdown of your registered crop types
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={refetch}
            aria-label="refresh crops by type"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ height: 230 }}>
          {loading ? (
            <Skeleton variant="rounded" height={210} />
          ) : (
            <CropTypeBarChart data={cropsByType} />
          )}
        </Box>
      </Box>

      {/* Row: Harvest Progress + Distribution side-by-side */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          maxWidth: 1100,
          mx: "auto",
          width: "100%",
          mt: 1,
          alignItems: "stretch",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            flex: "1 1 300px",
            background: (t) =>
              t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#ffffff",
            borderRadius: 3,
            boxShadow: 3,
            p: 2,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Harvest Progress
          </Typography>
          <Typography
            variant="caption"
            sx={{ opacity: 0.65, letterSpacing: 0.3 }}
          >
            Percent harvested
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            {loading ? (
              <Skeleton
                variant="circular"
                sx={{ mx: "auto" }}
                width={140}
                height={140}
              />
            ) : (
              <HarvestProgressDonut
                harvested={harvestedCount}
                total={totalCrops}
              />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            flex: "1 1 300px",
            background: (t) =>
              t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#ffffff",
            borderRadius: 3,
            boxShadow: 3,
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            mb={0.5}
            alignItems="center"
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Distribution
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.65, letterSpacing: 0.3 }}
              >
                Share per crop type
              </Typography>
            </Box>
            <IconButton size="small" onClick={refetch}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, minHeight: 180 }}>
            {loading ? (
              <Skeleton variant="rounded" height={170} />
            ) : (
              <CropDistributionPie data={cropsByType} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Recent Crops centered below */}
      <Box
        sx={{
          mt: 1.5,
          background: (t) =>
            t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#ffffff",
          borderRadius: 3,
          boxShadow: 3,
          p: 2,
          maxWidth: 900,
          mx: "auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          mb={0.5}
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Recent Crops
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.65, letterSpacing: 0.3 }}
            >
              Latest entries
            </Typography>
          </Box>
          <IconButton size="small" onClick={refetch}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            maxHeight: isMobile ? 320 : 360,
            pr: 0.5,
          }}
        >
          {loading ? (
            <Skeleton variant="rounded" height={240} />
          ) : (
            <RecentCrops crops={recentCrops} />
          )}
        </Box>
      </Box>

      <Box sx={{ height: 12 }} />
    </Box>
  );
};

export default FarmerDashboard;