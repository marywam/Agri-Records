import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Tooltip,
  Avatar,
  useTheme,
  alpha,
  Badge,
  Stack,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  PeopleAlt as PeopleIcon,
  Agriculture as CropsIcon,
  AddCircleOutline as AddIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Assessment as AnalyticsIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const DRAWER_WIDTH = 250;

// Helper to get token
const getToken = () => localStorage.getItem("access_token") || "";

/**
 * AdminSidebar
 * Props:
 *  - children: node (main content)
 *  - onLogout: function (optional) if you want parent to handle logout
 *  - onToggleTheme: function (optional) toggles light/dark
 *  - showThemeToggle: bool (default true)
 *  - apiBase: string; base API URL (default from env)
 */
const AdminSidebar = ({
  children,
  onLogout,
  onToggleTheme,
  showThemeToggle = true,
  apiBase = process.env.REACT_APP_API_URL || "",
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const location = useLocation();

  // NEW: pull user info (username) once; memoized parse
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user_info") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [farmersOpen, setFarmersOpen] = useState(true); // collapse group
  const [dashboardStats, setDashboardStats] = useState({
    total_farmers: null,
    total_crops: null,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const toggleDrawer = () => setOpen((o) => !o);
  const toggleMobileDrawer = () => setMobileOpen((m) => !m);
  const toggleFarmers = () => setFarmersOpen((o) => !o);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    ["access_token", "refresh_token", "user_role", "user_info"].forEach(
      (k) => localStorage.removeItem(k)
    );
    navigate("/login", { replace: true });
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`${apiBase}/admin-api/dashboard/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!res.ok) throw new Error("Failed stats fetch");
      const data = await res.json();
      setDashboardStats({
        total_farmers: data.total_farmers ?? 0,
        total_crops: data.total_crops ?? 0,
      });
    } catch (e) {
      // fallback stays null
    } finally {
      setLoadingStats(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const active = (path) => location.pathname.startsWith(path);

  const navItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      path: "/admin/dashboard",
    },
    {
      label: "Analytics",
      icon: <AnalyticsIcon />,
      path: "/admin/analytics", // optional future
      hidden: true, // example of hiding; set false when you add page
    },
  ];

  // Farmer group (nested)
  const farmerGroup = [
    {
      label: "All Farmers",
      icon: <PeopleIcon />,
      path: "/admin/farmers",
    },
   
  ];

  const cropItem = {
    label: "Crops",
    icon: <CropsIcon />,
    path: "/admin/crops",
  };

  // NEW: dynamic header title logic with username
  const headerTitle = location.pathname.startsWith("/admin/farmers")
    ? "Farmer Management"
    : location.pathname.startsWith("/admin/crops")
    ? "Crop Management"
    : userInfo?.username
    ? `Admin ${userInfo.username}`
    : "Admin Dashboard";

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: isDark
          ? "linear-gradient(180deg,#13261b,#0e1b14)"
          : "linear-gradient(180deg,#e8f5e9,#ffffff)",
      }}
    >
      {/* Brand / Collapse toggle */}
      <Toolbar
        sx={{
          minHeight: 60,
            px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              fontWeight: 700,
              bgcolor: "success.main",
              boxShadow: isDark
                ? "0 0 0 2px rgba(255,255,255,0.15)"
                : "0 0 0 2px rgba(0,0,0,0.08)",
            }}
          >
            {userInfo?.username?.[0]?.toUpperCase() || "A"}
          </Avatar>
          {open && (
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(90deg,#2e7d32,#43a047,#66bb6a)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
              }}
            >
              Admin Panel
            </Typography>
          )}
        </Stack>
        <IconButton
          onClick={toggleDrawer}
          size="small"
          sx={{
            color: isDark ? "#fff" : "success.dark",
          }}
          aria-label="collapse drawer"
        >
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider
        sx={{
          opacity: 0.6,
          borderColor: alpha(
            isDark ? "#ffffff" : "#000000",
            isDark ? 0.2 : 0.12
          ),
        }}
      />

      {/* Dashboard Section */}
      <List sx={{ py: 0 }}>
        {navItems
          .filter((i) => !i.hidden)
          .map((item) => {
            const selected = active(item.path);
            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  position: "relative",
                  "&.Mui-selected": {
                    background: alpha(
                      theme.palette.success.main,
                      isDark ? 0.25 : 0.15
                    ),
                    color: isDark ? "#fff" : "success.dark",
                    "& .MuiListItemIcon-root": {
                      color: isDark ? "#fff" : "success.dark",
                    },
                  },
                  "&:hover": {
                    background: alpha(
                      theme.palette.success.main,
                      isDark ? 0.18 : 0.1
                    ),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: selected
                      ? isDark
                        ? "#fff"
                        : "success.dark"
                      : alpha(
                          theme.palette.text.primary,
                          isDark ? 0.85 : 0.7
                        ),
                    minWidth: 42,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: selected ? 600 : 500,
                        }}
                      >
                        {item.label}
                      </Typography>
                    }
                  />
                )}
              </ListItemButton>
            );
          })}
      </List>

      {/* Farmers Group */}
      <Typography
        variant="caption"
        sx={{
          px: open ? 2.5 : 2,
          mt: 1.5,
          mb: 0.5,
          letterSpacing: 0.5,
          fontWeight: 600,
          opacity: 0.7,
        }}
      >
        {open ? "MANAGEMENT" : ""}
      </Typography>

      <List sx={{ py: 0 }}>
        <ListItemButton
          onClick={toggleFarmers}
          sx={{
            mx: 1,
            borderRadius: 2,
            my: 0.5,
            "&:hover": {
              background: alpha(
                theme.palette.success.main,
                isDark ? 0.15 : 0.08
              ),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 42,
              color: alpha(theme.palette.text.primary, isDark ? 0.85 : 0.7),
            }}
          >
            <PeopleIcon />
          </ListItemIcon>
          {open && (
            <ListItemText
              primary={
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  Farmers
                </Typography>
              }
            />
          )}
          {open && (farmersOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
        <Collapse in={farmersOpen && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {farmerGroup.map((fg) => {
              const selected = active(fg.path);
              return (
                <ListItemButton
                  key={fg.path}
                  sx={{
                    ml: 4.5,
                    mr: 1.5,
                    my: 0.3,
                    borderRadius: 2,
                    "&.Mui-selected": {
                      background: alpha(
                        theme.palette.success.main,
                        isDark ? 0.28 : 0.16
                      ),
                      color: isDark ? "#fff" : "success.dark",
                      "& .MuiListItemIcon-root": {
                        color: isDark ? "#fff" : "success.dark",
                      },
                    },
                    "&:hover": {
                      background: alpha(
                        theme.palette.success.main,
                        isDark ? 0.18 : 0.1
                      ),
                    },
                  }}
                  selected={selected}
                  onClick={() => {
                    navigate(fg.path);
                    setMobileOpen(false);
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: selected
                        ? isDark
                          ? "#fff"
                          : "success.dark"
                        : alpha(
                            theme.palette.text.primary,
                            isDark ? 0.85 : 0.65
                          ),
                    }}
                  >
                    {fg.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: 13.2,
                          fontWeight: selected ? 600 : 500,
                        }}
                      >
                        {fg.label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>

        {/* Crops */}
        <ListItemButton
          selected={active(cropItem.path)}
          onClick={() => {
            navigate(cropItem.path);
            setMobileOpen(false);
          }}
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            "&.Mui-selected": {
              background: alpha(
                theme.palette.success.main,
                isDark ? 0.25 : 0.15
              ),
              color: isDark ? "#fff" : "success.dark",
              "& .MuiListItemIcon-root": {
                color: isDark ? "#fff" : "success.dark",
              },
            },
            "&:hover": {
              background: alpha(
                theme.palette.success.main,
                isDark ? 0.18 : 0.1
              ),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 42,
              color: active(cropItem.path)
                ? isDark
                  ? "#fff"
                  : "success.dark"
                : alpha(theme.palette.text.primary, isDark ? 0.85 : 0.7),
            }}
          >
            <Badge
              color="success"
              variant="dot"
              invisible={!dashboardStats.total_crops}
            >
              {cropItem.icon}
            </Badge>
          </ListItemIcon>
          {open && (
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: active(cropItem.path) ? 600 : 500,
                  }}
                >
                  {cropItem.label}
                </Typography>
              }
            />
          )}
        </ListItemButton>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Bottom actions */}
      <Box
        sx={{
          p: 1.2,
          borderTop: `1px solid ${alpha(
            isDark ? "#ffffff" : "#000000",
            isDark ? 0.12 : 0.12
          )}`,
        }}
      >
        <Stack direction={open ? "row" : "column"} spacing={open ? 1 : 0.5}>
          {showThemeToggle && (
            <Tooltip
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              placement="top"
            >
              <IconButton
                size="small"
                onClick={onToggleTheme}
                sx={{
                  bgcolor: alpha(
                    theme.palette.success.main,
                    isDark ? 0.15 : 0.1
                  ),
                  color: isDark ? "#fff" : "success.dark",
                  "&:hover": {
                    bgcolor: alpha(
                      theme.palette.success.main,
                      isDark ? 0.25 : 0.18
                    ),
                  },
                }}
              >
                {isDark ? <LightIcon /> : <DarkIcon />}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Logout">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                "&:hover": {
                  bgcolor: alpha(theme.palette.error.main, 0.22),
                  color: isDark ? "#fff" : theme.palette.error.contrastText,
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        {open && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              opacity: 0.55,
              fontSize: 11,
              letterSpacing: 0.5,
            }}
          >
            © {new Date().getFullYear()} AgTech ERP
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          ml: { md: open ? `${DRAWER_WIDTH}px` : 0 },
          width: {
            md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          },
          transition: "width 240ms, margin 240ms",
          backgroundImage: isDark
            ? "linear-gradient(90deg,#144d2b,#1c6b3b,#228b22)"
            : "linear-gradient(90deg,#2e7d32,#43a047,#66bb6a)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: 60,
            px: 2,
            gap: 1,
          }}
        >
          {/* Mobile menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleMobileDrawer}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop reopen button when collapsed */}
          {!open && (
            <IconButton
              color="inherit"
              onClick={toggleDrawer}
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.6,
              flexGrow: 1,
              fontSize: { xs: 17, sm: 18 },
            }}
          >
            {headerTitle}
          </Typography>

          <Tooltip title="Refresh statistics">
            <IconButton
              size="small"
              color="inherit"
              onClick={fetchStats}
              disabled={loadingStats}
            >
              <AnalyticsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? DRAWER_WIDTH : 70,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? DRAWER_WIDTH : 70,
            boxSizing: "border-box",
            whiteSpace: "nowrap",
            overflowX: "hidden",
            transition: "width 240ms",
            borderRight: `1px solid ${alpha(
              theme.palette.divider,
              isDark ? 0.4 : 0.7
            )}`,
            background: "transparent",
          },
          display: { xs: "none", md: "block" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 3 },
          mt: "60px",
          minHeight: "100vh",
            background: isDark
            ? "linear-gradient(135deg,#0f1914,#13251c)"
            : "linear-gradient(135deg,#f5faf5,#ecf7ed)",
          transition: "background 300ms",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminSidebar;