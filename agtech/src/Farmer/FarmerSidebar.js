import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Agriculture as CropIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Agri.jpeg";

const drawerWidth = 240;

const FarmerSidebar = ({
  children,
  mode, // optional external mode ('light'|'dark')
  onToggleMode, // optional external toggle function
  enableThemeToggle = true, // can disable if handled elsewhere
}) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // If not controlled externally, maintain internal mode
  const [internalMode, setInternalMode] = useState("light");
  const activeMode = mode || internalMode;

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleInternalToggle = () =>
    setInternalMode((p) => (p === "light" ? "dark" : "light"));

  const toggleMode = () => {
    if (onToggleMode) onToggleMode();
    else handleInternalToggle();
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarToggle = () => setOpen(!open);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
    handleMenuClose(); // Close the profile menu if open
  };

  const handleLogoutConfirm = () => {
    setOpenLogoutDialog(false);
    setOpenSnackbar(true);

    // Wait a moment before actually logging out to show the snackbar
    setTimeout(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    }, 1500);
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/farmer/dashboard" },
    { text: "Crop Management", icon: <CropIcon />, path: "/farmer/crops" },
    { text: "Profile", icon: <PersonIcon />, path: "/farmer/profile" },
  ];

  const drawerContent = (isMobile = false) => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, #004d00, #006400, #228B22)",
            color: "white",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="AgriFarm Logo"
            sx={{
              height: 30,
              width: 30,
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />
          <IconButton
            onClick={isMobile ? handleDrawerToggle : handleSidebarToggle}
            sx={{ color: "white" }}
            size="small"
          >
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "rgba(255,255,255,0.18)",
                      color: "white",
                      "& .MuiListItemIcon-root": { color: "white" },
                      "& .MuiListItemText-root": {
                        borderRight: "2px solid white",
                        pr: 1,
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "white",
                      "& .MuiListItemIcon-root": { color: "white" },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: selected ? "white" : "inherit",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: selected ? 600 : 400,
                          letterSpacing: 0.2,
                        }}
                      >
                        {item.text}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ mt: "auto", p: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />
        {enableThemeToggle && (
          <ListItemButton
            onClick={toggleMode}
            sx={{
              mb: 0.5,
              borderRadius: 1.5,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "white",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              {activeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText
              primary={`Switch to ${
                activeMode === "dark" ? "Light" : "Dark"
              } Mode`}
            />
          </ListItemButton>
        )}

        <ListItemButton
          onClick={handleLogoutClick}
          sx={{
            borderRadius: 1.5,
            "&:hover": { backgroundColor: "error.light", color: "white" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: open ? `calc(100% - ${drawerWidth}px)` : "100%" },
          ml: { sm: open ? `${drawerWidth}px` : 0 },
          background: "linear-gradient(180deg, #004d00, #006400, #228B22)",
        }}
      >
        <Toolbar sx={{ minHeight: 60 }}>
          {!open && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ mr: 2, display: { xs: "none", sm: "inline-flex" } }}
              size="small"
            >
              <MenuIcon />
            </IconButton>
          )}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1.5, display: { xs: "inline-flex", sm: "none" } }}
            size="small"
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Box
              component="img"
              src={logo}
              alt="AgriFarm Logo"
              sx={{
                height: 36,
                width: 36,
                borderRadius: "50%",
                objectFit: "cover",
                mr: 1,
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ letterSpacing: 0.5, fontWeight: 600 }}
            >
              AgTech ERP
            </Typography>
          </Box>

          {enableThemeToggle && (
            <Tooltip
              title={`Switch to ${
                activeMode === "dark" ? "Light" : "Dark"
              } Mode`}
            >
              <IconButton
                color="inherit"
                onClick={toggleMode}
                sx={{ mr: 1 }}
                size="small"
              >
                {activeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          )}

          <IconButton
            color="inherit"
            size="small"
            aria-label="user profile"
            onClick={handleProfileMenuOpen}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: "black",
                border: "2px solid #ccc",
              }}
            >
              <PersonIcon sx={{ color: "white" }} />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              elevation: 4,
              sx: {
                mt: 1.2,
                overflow: "visible",
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 18,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/farmer/profile");
                handleMenuClose();
              }}
            >
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer Navigation */}
      <Box
        component="nav"
        sx={{ width: { sm: open ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              background: "linear-gradient(180deg, #004d00, #006400, #228B22)",
              color: "white",
            },
          }}
        >
          {drawerContent(true)}
        </Drawer>

        {/* Desktop Drawer */}
        {open && (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                background:
                  "linear-gradient(180deg, #004d00, #006400, #228B22)",
                color: "white",
              },
            }}
            open
          >
            {drawerContent()}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: open ? `calc(100% - ${drawerWidth}px)` : "100%" },
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} sx={{color: "green",
                  "&:hover": { color: "#006400" },}}>
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm}  autoFocus  sx={{color: "green",
                  "&:hover": { color: "#006400" },}}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Snackbar Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{ width: "100%" }}
        >
          Logging out...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FarmerSidebar;
