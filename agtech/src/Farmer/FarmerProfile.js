// FarmerProfile (Editable username & email version + Gender dropdown)
// Notes:
//  - Gender is now a dropdown (select) matching backend choices: male/female/other.
//  - Your backend UserProfileSerializer currently has: read_only_fields = ["email", "role"]
//    If you want email to be editable, remove "email" from read_only_fields in the serializer.
//  - If USERNAME_FIELD=email, changing email may require re-auth or token refresh.
//  - Username & Email validation kept; gender validation unchanged (auto valid because of fixed options).
//
// Dependencies: @mui/material @mui/icons-material axios react

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Avatar,
  IconButton,
  Divider,
  Stack,
  Chip,
  Collapse,
  Tooltip,
  LinearProgress,
  Skeleton,
  InputAdornment,
  FormControl,
  FormHelperText,
  MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";

import RefreshIcon from "@mui/icons-material/Refresh";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PlaceIcon from "@mui/icons-material/Place";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import WcIcon from "@mui/icons-material/Wc";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import MailIcon from "@mui/icons-material/Mail";
import axios from "axios";

const initialProfileShape = {
  first_name: "",
  last_name: "",
  email: "",
  username: "",
  phone_number: "",
  location: "",
  farm_size: "",
  date_of_birth: "",
  gender: "",
};

const emailRegex = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const usernameRegex = /^[a-zA-Z0-9._\-]{3,30}$/;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const FarmerProfile = () => {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const token = useMemo(() => localStorage.getItem("access_token"), []);
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [profile, setProfile] = useState(initialProfileShape);
  const [originalProfile, setOriginalProfile] = useState(initialProfileShape);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState("");

  const canonical = (obj) =>
    JSON.stringify(
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
          k,
          typeof v === "string" ? v.trim() : v,
        ])
      )
    );

  const dirty = useMemo(
    () => canonical(profile) !== canonical(originalProfile),
    [profile, originalProfile]
  );

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${apiUrl}/profile/`, {
        headers: authHeaders,
      });
      setProfile(res.data);
      setOriginalProfile(res.data);
      if (res.data.avatar_url) setAvatarPreview(res.data.avatar_url);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authHeaders]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!profile.username.trim()) {
      errs.username = "Username is required.";
    } else if (!usernameRegex.test(profile.username.trim())) {
      errs.username = "3-30 chars, letters/numbers/._- only.";
    }
    if (!profile.email.trim()) {
      errs.email = "Email is required.";
    } else if (!emailRegex.test(profile.email.trim())) {
      errs.email = "Invalid email format.";
    }
    if (profile.phone_number) {
      const phoneClean = profile.phone_number.replace(/[\s\-()+]/g, "");
      if (!/^[0-9]{7,15}$/.test(phoneClean))
        errs.phone_number = "Phone must be 7-15 digits.";
    }
    if (profile.farm_size) {
      const val = parseFloat(profile.farm_size);
      if (isNaN(val) || val < 0) errs.farm_size = "Farm size must be >= 0.";
    }
    if (
      profile.date_of_birth &&
      !/^\d{4}-\d{2}-\d{2}$/.test(profile.date_of_birth)
    ) {
      errs.date_of_birth = "Date must be YYYY-MM-DD.";
    }
    if (
      profile.gender &&
      !["male", "female", "other"].includes(profile.gender.toLowerCase())
    ) {
      errs.gender = 'Gender must be "male", "female" or "other".';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const normalizedProfile = () => {
    const out = { ...profile };
    Object.keys(out).forEach((k) => {
      if (typeof out[k] === "string") out[k] = out[k].trim();
    });
    return out;
  };

  const handleSubmit = async () => {
    if (!validateProfile()) return;
    setSaving(true);
    setMessage("");
    setErrorMsg("");
    try {
      const payload = normalizedProfile();
      await axios.put(`${apiUrl}/profile/`, payload, {
        headers: authHeaders,
      });
      setMessage("Profile updated successfully!");
      setOriginalProfile(payload);
      setProfile(payload);
      setEditMode(false);
    } catch (e) {
      console.error(e);
      if (e.response?.data && typeof e.response.data === "object") {
        const data = e.response.data;
        const newFieldErrors = {};
        let nonField = "";
        Object.entries(data).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            if (key in profile) newFieldErrors[key] = val.join(" ");
            else nonField += val.join(" ") + " ";
          } else if (typeof val === "string") {
            if (key in profile) newFieldErrors[key] = val;
            else nonField += val + " ";
          }
        });
        if (Object.keys(newFieldErrors).length)
          setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
        if (nonField.trim()) setErrorMsg(nonField.trim());
        else if (!nonField.trim() && !Object.keys(newFieldErrors).length)
          setErrorMsg("Error updating profile. Please try again.");
      } else {
        setErrorMsg(
          e?.response?.data?.detail ||
            "Error updating profile. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setFieldErrors({});
    setEditMode(false);
    setMessage("");
    setErrorMsg("");
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    setMessage("");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await axios.post(`${apiUrl}/profile/avatar/`, formData, {
        headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
      });
      setMessage("Avatar updated.");
    } catch (err) {
      console.warn("Avatar endpoint may not exist:", err);
      setErrorMsg("Failed to upload avatar (endpoint missing?)");
      setAvatarPreview(profile.avatar_url || "");
    } finally {
      setAvatarUploading(false);
    }
  };

  const summaryChips = [
    {
      icon: <PhoneIphoneIcon fontSize="inherit" />,
      label: profile.phone_number || "No phone",
    },
    {
      icon: <PlaceIcon fontSize="inherit" />,
      label: profile.location || "No location",
    },
    {
      icon: <AgricultureIcon fontSize="inherit" />,
      label: profile.farm_size ? `${profile.farm_size} acres` : "No farm size",
    },
    {
      icon: <WcIcon fontSize="inherit" />,
      label: profile.gender || "No gender",
    },
    {
      icon: <CalendarMonthIcon fontSize="inherit" />,
      label: profile.date_of_birth || "No DOB",
    },
  ];

  const requiredAsterisk = (label) => (
    <span>
      {label} <span style={{ color: "#d32f2f" }}>*</span>
    </span>
  );

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        pb: 6,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 12% 10%, rgba(76,175,80,0.15), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={3}
          alignItems={{ xs: "center", sm: "flex-start" }}
        >
          <Box position="relative">
           {/* Avatar WITHOUT upload */}
          <Avatar
            alt={profile.username || ""}
            src={profile.avatar_url || undefined}
            sx={{
              width: 108,
              height: 108,
              fontSize: 40,
              bgcolor: "success.main",
            }}
          >
            {!profile.avatar_url &&
              (profile.first_name?.[0] ||
                profile.username?.[0] ||
                "F")}
          </Avatar>
           
          </Box>

          <Box flex={1} minWidth={0}>
            <Stack
              direction="row"
              alignItems={{ xs: "center", sm: "flex-start" }}
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    background:
                      "linear-gradient(90deg,#2e7d32,#43a047,#66bb6a)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    lineHeight: 1.15,
                  }}
                >
                  {loading ? (
                    <Skeleton width={180} />
                  ) : profile.username ? (
                    `👋 Hello ${profile.username}`
                  ) : (
                    "Hello Farmer"
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.7, mt: 0.4, maxWidth: 480 }}
                >
                  {loading ? (
                    <Skeleton width={260} />
                  ) : (
                    "Manage your personal details and farm information."
                  )}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                {!editMode && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={fetchProfile}
                  >
                    Refresh
                  </Button>
                )}
                {editMode ? (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<SaveIcon />}
                      onClick={handleSubmit}
                      disabled={!dirty || saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    disabled={loading}
                  >
                    Edit Profile
                  </Button>
                )}
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              sx={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      width={110}
                      height={30}
                    />
                  ))
                : summaryChips.map((c, i) => (
                    <Chip
                      key={i}
                      icon={c.icon}
                      label={c.label}
                      size="small"
                      variant="outlined"
                    />
                  ))}
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box>
        <Collapse in={!!message}>
          <Alert
            severity="success"
            onClose={() => setMessage("")}
            sx={{ mb: 1, borderRadius: 2 }}
          >
            {message}
          </Alert>
        </Collapse>
        <Collapse in={!!errorMsg}>
          <Alert
            severity="error"
            onClose={() => setErrorMsg("")}
            sx={{ mb: 1, borderRadius: 2 }}
          >
            {errorMsg}
          </Alert>
        </Collapse>
      </Box>

      <Alert
        icon={false}
        severity="info"
        sx={{
          py: 1,
          fontSize: 13,
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.02)",
        }}
      >
        Keeping farm details accurate helps improve analytics on your dashboard.
      </Alert>

      {/* Form Sections */}
      <Grid container spacing={3}>
        {/* Personal Info */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PersonIcon fontSize="small" /> Personal Information
            </Typography>
            {loading ? (
              <Box>
                <Skeleton height={56} />
                <Skeleton height={56} />
                <Skeleton height={56} />
                <Skeleton height={56} />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="first_name"
                    value={profile.first_name || ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="last_name"
                    value={profile.last_name || ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!fieldErrors.username}>
                    <TextField
                      label={requiredAsterisk("Username")}
                      name="username"
                      value={profile.username || ""}
                      onChange={handleChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {!!fieldErrors.username && (
                      <FormHelperText>{fieldErrors.username}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!fieldErrors.email}>
                    <TextField
                      label={requiredAsterisk("Email")}
                      name="email"
                      type="email"
                      value={profile.email || ""}
                      onChange={handleChange}
                      disabled={!editMode /* remove if backend allows update */}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {!!fieldErrors.email && (
                      <FormHelperText>{fieldErrors.email}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!fieldErrors.phone_number}>
                    <TextField
                      label="Phone Number"
                      name="phone_number"
                      value={profile.phone_number || ""}
                      onChange={handleChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIphoneIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {!!fieldErrors.phone_number && (
                      <FormHelperText>{fieldErrors.phone_number}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!fieldErrors.date_of_birth}>
                    <TextField
                      label="Date of Birth"
                      name="date_of_birth"
                      type="date"
                      value={profile.date_of_birth || ""}
                      onChange={handleChange}
                      disabled={!editMode}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {!!fieldErrors.date_of_birth && (
                      <FormHelperText>
                        {fieldErrors.date_of_birth}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Gender Dropdown */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!fieldErrors.gender}>
                    <TextField
                      select
                      label="Gender"
                      name="gender"
                      value={profile.gender || ""}
                      onChange={handleChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WcIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    {!!fieldErrors.gender && (
                      <FormHelperText>{fieldErrors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Farm Details */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AgricultureIcon fontSize="small" /> Farm Details
            </Typography>
            {loading ? (
              <Box>
                <Skeleton height={56} />
                <Skeleton height={56} />
                <Skeleton height={56} />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={7}>
                  <TextField
                    label="Location"
                    name="location"
                    value={profile.location || ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PlaceIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth error={!!fieldErrors.farm_size}>
                    <TextField
                      label="Farm Size (acres)"
                      name="farm_size"
                      type="number"
                      value={profile.farm_size || ""}
                      onChange={handleChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AgricultureIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {!!fieldErrors.farm_size && (
                      <FormHelperText>{fieldErrors.farm_size}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FarmerProfile;