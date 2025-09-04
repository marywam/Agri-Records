import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  Link,
} from "@mui/material";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";


export default function FarmerRegister() {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // can be 'success' or 'error'

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    location: "",
    farm_size: "",
    date_of_birth: "",
    gender: "",
    password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    // Validation for Step 0 (Personal Info)
    if (step === 0) {
      const requiredFieldsStep0 = [
        "username",
        "first_name",
        "last_name",
        "email",
        "gender",
        "date_of_birth",
      ];
  
      const emptyFields = requiredFieldsStep0.filter(
        (field) => !formData[field] || formData[field].trim() === ""
      );
  
      if (emptyFields.length > 0) {
        setSnackbarMessage("❌ Please fill in all required fields before proceeding");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
        return; // prevent moving to next step
      }
    }
  
    // Clear message and move to next step
    setMessage("");
    setStep((prev) => prev + 1);
  };
  
  const handleBack = () => setStep((prev) => prev - 1);

  const handleRegister = async (e) => {
    e.preventDefault();
  
    // Combine all required fields from both steps
    const requiredFields = [
      "username",
      "first_name",
      "last_name",
      "email",
      "gender",
      "date_of_birth",
      "phone_number",
      "location",
      "farm_size",
      "password",
      "confirm_password",
    ];
  
    // Check for empty fields
    const emptyFields = requiredFields.filter(
      (field) => !formData[field] || formData[field].toString().trim() === ""
    );
  
    if (emptyFields.length > 0) {
      setSnackbarMessage("❌ Please fill in all fields before registering");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return; // Stop submission
    }
  
    // Password match check
    if (formData.password !== formData.confirm_password) {
      setSnackbarMessage("❌ Passwords do not match");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    // All validations passed, submit the form
     // Show loading snackbar
  setSnackbarMessage("Submitting...");
  setSnackbarSeverity("info");
  setSnackbarOpen(true);
  
    try {
      const accessToken = localStorage.getItem("access_token");
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  
      await axios.post(`${apiUrl}/register/`, formData, { headers });
  
      setSnackbarMessage("✅ Farmer registered successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
  
      // Reset form and step
      setFormData({
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        location: "",
        farm_size: "",
        date_of_birth: "",
        gender: "",
        password: "",
        confirm_password: "",
      });

       // Redirect to login page after 2 seconds
       setTimeout(() => {
        navigate("/");
      }, 2000);
      setStep(0);
    } catch (err) {
      console.error("❌ Full error object:", err);
    
    if (err.response) {
      // Server responded with an error status
      console.error("Status:", err.response.status);
      console.error("Headers:", err.response.headers);
      console.error("Data:", err.response.data);
      
      // Extract error message from response
      let errorMessage = "Registration failed";
      if (err.response.data) {
        if (typeof err.response.data === 'object') {
          // Handle Django REST framework validation errors
          errorMessage = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
        } else {
          errorMessage = err.response.data;
        }
      }
      
      setSnackbarMessage(`❌ ${errorMessage}`);
    } else if (err.request) {
      // Request was made but no response received
      console.error("Request details:", err.request);
      setSnackbarMessage("❌ No response from server. Check if the backend is running.");
    } else {
      // Something else happened
      console.error("Error message:", err.message);
      setSnackbarMessage(`❌ Error: ${err.message}`);
    }
    
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } finally {
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
        minHeight: "100vh", // full viewport height
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          width: "100%",
          maxWidth: 600, // optional, keeps it from getting too wide
          boxShadow: 6,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Farmer Registration
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={step} alternativeLabel  sx={{
    mb: 3,
    "& .MuiStepLabel-root .Mui-active": {
      color: "green", // Active step label color
    },
    "& .MuiStepLabel-root .Mui-completed": {
      color: "green", // Completed step label color
    },
    "& .MuiStepConnector-root .Mui-active": {
      "& .MuiStepConnector-line": {
        borderColor: "green", // Active connector line
      },
    },
    "& .MuiStepConnector-root .Mui-completed": {
      "& .MuiStepConnector-line": {
        borderColor: "green", // Completed connector line
      },
    },
  }} >
          <Step>
            <StepLabel>Personal Info</StepLabel>
          </Step>
          <Step>
            <StepLabel>Farm Details</StepLabel>
          </Step>
        </Stepper>

        <Box component="form" onSubmit={handleRegister}>
          {step === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  size="medium"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  size="medium"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  size="medium"
                />
              </Grid>

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
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  sx={{ minWidth: 219 }} // ensures the field stays at least this wide
                  InputLabelProps={{ shrink: true }} // keeps the label in place
                  size="medium"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  name="date_of_birth"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  size="medium"
                  sx={{
                    "& .MuiInputBase-input": {
                      width: "100%", // Ensure the input takes full width
                      minWidth: "190px", // Set a minimum width
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sx={{ textAlign: "center",  mt:"20px",
                }}>
                <Typography variant="body2">
                  Already have an account?{" "}
                  <Link href="/" underline="hover">
                    Login
                  </Link>
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{ 
                    mt:"20px",
                    ml: "80px", // This pushes the button to the right
                   
                    backgroundColor: "#006400",
                    "&:hover": {
                      backgroundColor: "green", // darker green on hover
                    },
                  }}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          )}

          {step === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Farm Size (in acres)"
                  name="farm_size"
                  value={formData.farm_size}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm Password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, width: "100%" }}>
  <Button
    variant="outlined"
    color="green"
    onClick={handleBack}
    sx={{
      minWidth: 120,
      color: "green",            // text color
      borderColor: "green",      // border color
      "&:hover": {
        color: "rgba(0,128,0,0.6)", // faded green text on hover
        borderColor: "green",       // keep border the same
        backgroundColor: "transparent", // ensure background doesn't change
      },
    }}
  >
    Back
  </Button>

  <Button
  
    onClick={handleRegister}
    variant="contained"
    sx={{
      minWidth: 120,
      backgroundColor: "green",
      "&:hover": { backgroundColor: "#006400" },
    }}
  >
    Register
  </Button>
</Box>



            </Grid>
          )}
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
  autoHideDuration={snackbarSeverity === "info" ? null : 4000} // 4 seconds
  onClose={() => {
    // Only allow closing if it's not a loading message
    if (snackbarSeverity !== "info") {
      setSnackbarOpen(false);
    }
  }}

  anchorOrigin={{ vertical: "top", horizontal: "center" }}
>
  <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
    {snackbarMessage}
  </Alert>
</Snackbar>

      </Paper>
    </Container>
  );
}
