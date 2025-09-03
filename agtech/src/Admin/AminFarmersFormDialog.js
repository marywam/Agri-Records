import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  InputAdornment,
  Tooltip,
  Collapse,
  LinearProgress,
  Alert,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditIcon from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PlaceIcon from "@mui/icons-material/Place";
import NumbersIcon from "@mui/icons-material/Numbers";
import TodayIcon from "@mui/icons-material/Today";
import WcIcon from "@mui/icons-material/Wc";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

const GENDER_OPTIONS = ["male", "female", "other"];

const steps = ["Account", "Profile", "Security"];

const passwordStrength = (pw) => {
  if (!pw) return { score: 0, label: "Empty" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(pw)) score++;
  const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  return { score, label: labels[score] };
};

const initialTouched = {
  email: false,
  username: false,
  first_name: false,
  last_name: false,
  phone_number: false,
  location: false,
  farm_size: false,
  date_of_birth: false,
  gender: false,
  password: false,
  confirm_password: false,
};

const FarmerFormDialog = ({
  open,
  onClose,
  onSubmit,
  mode = "add", // 'add' | 'edit'
  formData,
  setFormData,
  saving,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isEdit = mode === "edit";

  const [activeStep, setActiveStep] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [touched, setTouched] = useState(initialTouched);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [validationMode, setValidationMode] = useState("live"); // 'live' | 'submit'
  const [inlineAlert, setInlineAlert] = useState("");

  // Reset when mode changes / opening
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setTouched(initialTouched);
      setShowAllErrors(false);
      setInlineAlert("");
    }
  }, [open, mode]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const errors = useMemo(() => {
    const e = {};
    if (!isEdit) {
      if (!formData.email.trim()) e.email = "Email is required";
      else if (!EMAIL_REGEX.test(formData.email.trim()))
        e.email = "Invalid email format";
    }
    if (!formData.username.trim()) e.username = "Username required";
    else if (!USERNAME_REGEX.test(formData.username.trim()))
      e.username = "3-30 chars, letters/numbers . _ - only";

    if (!formData.first_name.trim()) e.first_name = "First name required";
    if (!formData.last_name.trim()) e.last_name = "Last name required";

    if (formData.phone_number) {
      const cleaned = formData.phone_number.replace(/[^\d]/g, "");
      if (cleaned.length < 7 || cleaned.length > 15)
        e.phone_number = "7-15 digits allowed";
    }

    if (formData.farm_size) {
      const val = Number(formData.farm_size);
      if (isNaN(val) || val < 0) e.farm_size = "Must be a positive number";
    }

    if (formData.date_of_birth) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date_of_birth))
        e.date_of_birth = "Format: YYYY-MM-DD";
    }

    if (formData.gender) {
      if (!GENDER_OPTIONS.includes(formData.gender))
        e.gender = "Invalid selection";
    }

    if (!isEdit) {
      if (!formData.password) e.password = "Password required";
      else if (formData.password.length < 8)
        e.password = "At least 8 characters";
      if (!formData.confirm_password) e.confirm_password = "Confirm password";
      else if (formData.password !== formData.confirm_password)
        e.confirm_password = "Passwords do not match";
    }
    return e;
  }, [formData, isEdit]);

  const stepHasErrors = useCallback(
    (stepIndex) => {
      const relevantFields =
        stepIndex === 0
          ? isEdit
            ? ["username", "first_name", "last_name"] // email immutable
            : ["email", "username", "first_name", "last_name"]
          : stepIndex === 1
          ? ["phone_number", "location", "farm_size", "date_of_birth", "gender"]
          : isEdit
          ? [] // no password step for edit
          : ["password", "confirm_password"];
      return relevantFields.some((f) => errors[f]);
    },
    [errors, isEdit]
  );

  const canAdvance = useCallback(() => {
    return !stepHasErrors(activeStep);
  }, [activeStep, stepHasErrors]);

  const allValid = useMemo(
    () => Object.keys(errors).length === 0,
    [errors]
  );

  const pwStrength = useMemo(
    () => (!isEdit ? passwordStrength(formData.password) : { score: 0, label: "" }),
    [formData.password, isEdit]
  );

  const handleNext = () => {
    if (activeStep === steps.length - 1 || (isEdit && activeStep === 1)) return;
    if (!canAdvance()) {
      setShowAllErrors(true);
      setInlineAlert("Please fix the errors before continuing.");
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setInlineAlert("");
    setActiveStep((s) => Math.max(0, s - 1));
  };

  const handleSubmitInternal = (e) => {
    e.preventDefault();
    if (!allValid) {
      setShowAllErrors(true);
      setInlineAlert("Please resolve all validation errors.");
      if (!isEdit) setActiveStep(steps.length - 1); // jump to security if missing password
      return;
    }
    onSubmit();
  };

  const liveError = (field) =>
    (validationMode === "live" && touched[field]) || showAllErrors
      ? errors[field]
      : "";

  const SectionTitle = ({ icon, text, subtitle }) => (
    <Box sx={{ mb: 2.2 }}>
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: "success.light",
            color: "#fff",
            fontSize: 18,
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {text}
        </Typography>
      </Stack>
      {subtitle && (
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ mt: 1.2 }} />
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 4,
          overflow: "hidden",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg,#122018,#182d23)"
              : "linear-gradient(135deg,#ffffff,#f5faf6)",
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmitInternal}
        noValidate
        sx={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pr: 6,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(90deg,#144d2b,#1b6a3b)"
                : "linear-gradient(90deg,#2e7d32,#43a047,#66bb6a)",
            color: "#fff",
          }}
        >
          {isEdit ? <EditIcon /> : <PersonAddAlt1Icon />}
          {isEdit ? "Edit Farmer" : "Add New Farmer"}
          <IconButton
            sx={{ position: "absolute", right: 8, top: 8, color: "#fff" }}
            onClick={onClose}
            disabled={saving}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            p: { xs: 2.5, md: 3 },
            gap: 2,
          }}
        >
          {/* Stepper */}
            <Stepper
            activeStep={isEdit ? Math.min(activeStep, 1) : activeStep}
            alternativeLabel={!fullScreen}
            sx={{
              mb: 2,
              ".MuiStepConnector-line": { display: fullScreen ? "none" : "block" },
            }}
          >
            {steps
              .filter((_, idx) => (isEdit ? idx < 2 : true))
              .map((label, i) => (
                <Step key={label}>
                  <StepLabel
                    error={
                      showAllErrors &&
                      stepHasErrors(i) &&
                      (isEdit ? i < 2 : true)
                    }
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
          </Stepper>

          <Collapse in={!!inlineAlert}>
            <Alert
              severity="warning"
              sx={{ mb: 1.5, borderRadius: 2 }}
              onClose={() => setInlineAlert("")}
              icon={<WarningAmberRoundedIcon />}
            >
              {inlineAlert}
            </Alert>
          </Collapse>

          {/* Step Content */}
          {activeStep === 0 && (
            <Box>
              <SectionTitle
                icon={<InfoOutlinedIcon />}
                text="Account Information"
                subtitle={
                  isEdit
                    ? "Core identifiers (email cannot be changed)."
                    : "Provide primary login & identity details."
                }
              />
              <Grid container spacing={2.2}>
                {!isEdit && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      error={!!liveError("email")}
                      helperText={liveError("email") || "Unique login email"}
                      fullWidth
                      autoFocus
                      size="small"
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={isEdit ? 6 : 6}>
                  <TextField
                    label="Username *"
                    name="username"
                    value={formData.username}
                    onChange={(e) => updateField("username", e.target.value)}
                    error={!!liveError("username")}
                    helperText={
                      liveError("username") || "3-30 chars (letters, numbers, . _ -)"
                    }
                    fullWidth
                    size="small"
                    disabled={isEdit} // optional to lock username
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name *"
                    name="first_name"
                    value={formData.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    error={!!liveError("first_name")}
                    helperText={liveError("first_name") || "Given name"}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name *"
                    name="last_name"
                    value={formData.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    error={!!liveError("last_name")}
                    helperText={liveError("last_name") || "Family name"}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <SectionTitle
                icon={<PlaceIcon />}
                text="Profile & Farm Details"
                subtitle="Additional demographic & farm context"
              />
              <Grid container spacing={2.2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => updateField("phone_number", e.target.value)}
                    error={!!liveError("phone_number")}
                    helperText={liveError("phone_number") || "Digits only"}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphoneIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PlaceIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Farm Size (acres)"
                    name="farm_size"
                    type="number"
                    value={formData.farm_size}
                    onChange={(e) => updateField("farm_size", e.target.value)}
                    error={!!liveError("farm_size")}
                    helperText={liveError("farm_size") || "Leave blank if unknown"}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NumbersIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: "0.01" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      updateField("date_of_birth", e.target.value)
                    }
                    error={!!liveError("date_of_birth")}
                    helperText={liveError("date_of_birth") || "Optional"}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TodayIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={formData.gender || ""}
                    onChange={(e) => updateField("gender", e.target.value)}
                    error={!!liveError("gender")}
                    helperText={liveError("gender") || "Optional"}
                    fullWidth
                    size="small"
                    SelectProps={{ native: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WcIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <option value=""></option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          )}

          {!isEdit && activeStep === 2 && (
            <Box>
              <SectionTitle
                icon={<LockIcon />}
                text="Security"
                subtitle="Set a strong password for the farmer account"
              />
              <Grid container spacing={2.2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Password *"
                    name="password"
                    type={showPw ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    error={!!liveError("password")}
                    helperText={
                      liveError("password") ||
                      "Min 8 chars, mix recommended."
                    }
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPw((s) => !s)}
                          >
                            {showPw ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(pwStrength.score / 4) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 3,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(0,0,0,0.1)",
                        "& .MuiLinearProgress-bar": {
                          background:
                            pwStrength.score >= 3
                              ? "linear-gradient(90deg,#2e7d32,#43a047)"
                              : "linear-gradient(90deg,#f57c00,#ffa000)",
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        display: "block",
                        fontWeight: 600,
                        color:
                          pwStrength.score >= 3
                            ? "success.main"
                            : "warning.main",
                      }}
                    >
                      Strength: {pwStrength.label}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Confirm Password *"
                    name="confirm_password"
                    type={showPw2 ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={(e) =>
                      updateField("confirm_password", e.target.value)
                    }
                    error={!!liveError("confirm_password")}
                    helperText={liveError("confirm_password") || "Repeat password"}
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPw2((s) => !s)}
                          >
                            {showPw2 ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ToggleButtonGroup
                    size="small"
                    value={validationMode}
                    exclusive
                    onChange={(_, v) => v && setValidationMode(v)}
                    sx={{
                      mt: 0.5,
                      background:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)",
                      borderRadius: 3,
                      p: 0.5,
                    }}
                  >
                    <ToggleButton value="live" sx={{ px: 2 }}>
                      Live Validation
                    </ToggleButton>
                    <ToggleButton value="submit" sx={{ px: 2 }}>
                      On Submit
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item xs={12}>
                  <Alert
                    icon={
                      allValid ? (
                        <CheckCircleRoundedIcon fontSize="small" />
                      ) : (
                        <WarningAmberRoundedIcon fontSize="small" />
                      )
                    }
                    severity={allValid ? "success" : "info"}
                    sx={{ borderRadius: 2 }}
                  >
                    {allValid
                      ? "All required fields look good. You can create the account."
                      : "Complete all required fields & fix validation issues before submitting."}
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.02)",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={onClose}
            disabled={saving}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={saving}
              sx={{ textTransform: "none" }}
            >
              Back
            </Button>
          )}

          {((!isEdit && activeStep < steps.length - 1) ||
            (isEdit && activeStep < 1)) && (
            <Button
              onClick={handleNext}
              variant="outlined"
              color={canAdvance() ? "success" : "warning"}
              disabled={saving}
              sx={{
                textTransform: "none",
                borderWidth: 2,
                "&:hover": { borderWidth: 2 },
              }}
            >
              Next
            </Button>
          )}

          {/* Final Action */}
          {((!isEdit && activeStep === steps.length - 1) ||
            (isEdit && activeStep === 1)) && (
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={saving}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                boxShadow: "0 4px 14px -4px rgba(46,125,50,0.6)",
              }}
            >
              {saving
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                ? "Save Changes"
                : "Create Farmer"}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default FarmerFormDialog;