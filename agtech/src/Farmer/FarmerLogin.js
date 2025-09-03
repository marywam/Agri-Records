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
} from "@mui/material";
import axios from "axios";

export default function FarmerLogin() {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // success or error
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
        setSnackbarOpen(false);
        setSnackbarMessage("❌ Please enter both email and password");
        setSnackbarSeverity("error");
        setTimeout(() => setSnackbarOpen(true), 100); // short delay to force re-open
        return;
    }

    // Show loading snackbar
  setSnackbarMessage("logging...");
  setSnackbarSeverity("info");
  setSnackbarOpen(true);
    try {
      const response = await axios.post(`${apiUrl}/login/`, formData);

      // Assuming backend returns access token
      const { access_token } = response.data;
      localStorage.setItem("access_token", access_token);

      setSnackbarMessage("✅ Login successful!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setMessage("");

      // Optional: redirect to dashboard
      window.location.href = "/farmer/dashboard";
    } catch (err) {
      console.error("Login Error:", err);

      if (err.response) {
        setSnackbarMessage(
          `❌ Login failed: ${
            err.response.data.detail || "Invalid credentials"
          }`
        );
      } else {
        setSnackbarMessage("❌ Login failed: Something went wrong");
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setMessage("");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          width: "100%",
          maxWidth: 500,
          boxShadow: 6,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom sx={{mb: 4}}>
          Farmer Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} direction="column" alignItems="stretch">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                size="medium"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                size="medium"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: "green",
                  "&:hover": { backgroundColor: "#006400" },
                }}
              >
                Login
              </Button>
            </Grid>
          </Grid>

          {/* Place "Don't have an account?" below the form fields */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2">
              Don't have an account?{" "}
              <Link href="/" underline="hover">
                Register
              </Link>
            </Typography>
          </Box>
        </Box>

        {message && (
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}
