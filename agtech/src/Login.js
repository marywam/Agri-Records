import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Box,
  Link,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Fade,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import heroImage from "../src/assets/Agri.jpeg"; // Ensure path is correct

/**
 * Unified Login Component (Admin + Farmer)
 * - Backend returns: { access, refresh, user: { id, email, username, role } }
 * - role: 'admin' | 'farmer'
 * - Redirects:
 *      admin  -> /admin/dashboard
 *      farmer -> /farmer/dashboard
 * - Stores tokens + user role + basic user info in localStorage
 */

export default function Login() {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (snackbarOpen) setSnackbarOpen(false);
  };

  const openSnack = (msg, sev = "info") => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(sev);
    setSnackbarOpen(true);
  };

  const persistAuth = (data) => {
    // Store tokens
    if (data.access) localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    // Store user info
    if (data.user) {
      localStorage.setItem("user_role", data.user.role);
      localStorage.setItem(
        "user_info",
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          role: data.user.role,
        })
      );
    }
  };

  const routeByRole = (role) => {
    if (role === "admin") return "/admin/dashboard";
    return "/farmer/dashboard";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      openSnack("❌ Please enter both email and password", "error");
      return;
    }

    setSubmitting(true);
    openSnack("⏳ Authenticating...", "info");

    try {
      const response = await axios.post(`${apiUrl}/login/`, formData);

      persistAuth(response.data);

      const role = response.data?.user?.role;
      if (!role) {
        openSnack("⚠️ Login succeeded but role missing. Contact support.", "warning");
        setSubmitting(false);
        return;
      }

      openSnack(`✅ Welcome back ${role === "admin" ? "Admin" : "Farmer"}!`, "success");

      setTimeout(() => {
        navigate(routeByRole(role));
      }, 800);
    } catch (err) {
      console.error("Login Error:", err);
      let msg = "❌ Login failed: Something went wrong";
      if (err.response?.data) {
        // Your backend returns {"error": "Invalid email or password"} on failure
        if (typeof err.response.data === "object") {
          msg =
            err.response.data.error ||
            err.response.data.detail ||
            JSON.stringify(err.response.data);
        } else if (typeof err.response.data === "string") {
          msg = err.response.data;
        }
      }
      openSnack(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
            borderRadius: 5,
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          minHeight: { md: 520 },
        }}
      >
        {/* Left / Hero */}
        <Box
          sx={{
            position: "relative",
            flex: { md: 1 },
            background: `linear-gradient(135deg, rgba(0,100,0,0.55), rgba(34,139,34,0.55)), url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            p: { xs: 4, md: 5 },
            minHeight: { xs: 220, md: "auto" },
          }}
        >
          <Fade in timeout={800}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.15,
                  textShadow: "0 2px 8px rgba(0,0,0,0.35)",
                }}
              >
                Welcome Back 😊
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1.2,
                  maxWidth: 380,
                  opacity: 0.92,
                  fontSize: 15,
                  lineHeight: 1.45,
                }}
              >
                  Continue managing your crops, tracking performance and growing
                  smarter with AgTech ERP. We’re glad you’re here.
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Right / Form */}
        <Box
          sx={{
            flex: { md: 1 },
            p: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
            justifyContent: "center",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(90deg,#2e7d32,#43a047,#66bb6a)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                letterSpacing: 0.5,
                mb: 0.5,
              }}
            >
              Sign In
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Use your registered email and password.
            </Typography>
          </Box>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={2} direction="column">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  size="medium"
                  autoComplete="email"
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  size="medium"
                  autoComplete="current-password"
                  disabled={submitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPw((s) => !s)}
                          edge="end"
                          aria-label="toggle password visibility"
                          disabled={submitting}
                        >
                          {showPw ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  startIcon={<LoginIcon />}
                  sx={{
                    mt: 1,
                    py: 1.2,
                    fontWeight: 600,
                    letterSpacing: 0.4,
                    backgroundColor: "green",
                    "&:hover": { backgroundColor: "#006400" },
                  }}
                >
                  {submitting ? "Signing In..." : "Login"}
                </Button>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                New here?{" "}
                <Link href="/" underline="hover">
                  Create account
                </Link>
              </Typography>
            </Box>
          </Box>

          
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={
          snackbarSeverity === "info" || snackbarSeverity === "warning"
            ? 5000
            : 4000
        }
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}