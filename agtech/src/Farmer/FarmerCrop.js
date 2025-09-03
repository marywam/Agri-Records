import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  CardActions,
  Divider,
  Stack,
  Chip,
  useTheme,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";

const FarmerCrop = () => {
  const theme = useTheme();
  
  // Better: dynamic media query
  const isMobile = window.matchMedia(`(max-width:${theme.breakpoints.values.md - 1}px)`).matches;

  const [matchesMobile, setMatchesMobile] = useState(isMobile);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    quantity: 0,
    planted_date: "",
    harvested: false,
  });

  const apiUrl = process.env.REACT_APP_API_URL || "";

  // Responsive listener (so it updates on resize without reloading)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${theme.breakpoints.values.md - 1}px)`);
    const handler = (e) => setMatchesMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme.breakpoints.values.md]);

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3200);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCrops = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${apiUrl}/crops/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCrops(response.data);
    } catch (error) {
      console.error("Error fetching crops:", error);
      setMessage("Error fetching crops");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const handleOpenDialog = (crop = null) => {
    if (crop) {
      setEditingCrop(crop);
      setFormData({
        name: crop.name,
        type: crop.type,
        quantity: crop.quantity,
        planted_date: crop.planted_date,
        harvested: crop.harvested,
      });
    } else {
      setEditingCrop(null);
      setFormData({
        name: "",
        type: "",
        quantity: 0,
        planted_date: "",
        harvested: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCrop(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      if (editingCrop) {
        await axios.put(`${apiUrl}/crops/${editingCrop.id}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Crop updated successfully!");
      } else {
        await axios.post(`${apiUrl}/crops/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Crop added successfully!");
      }
      fetchCrops();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving crop:", error);
      setMessage("Error saving crop");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this crop?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${apiUrl}/crops/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Crop deleted successfully!");
      fetchCrops();
    } catch (error) {
      console.error("Error deleting crop:", error);
      setMessage("Error deleting crop");
    }
  };

  const handleToggleHarvested = async (crop) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.put(
        `${apiUrl}/crops/${crop.id}/`,
        { ...crop, harvested: !crop.harvested },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(
        `Crop marked as ${!crop.harvested ? "Harvested" : "Growing"}`
      );
      fetchCrops();
    } catch (error) {
      console.error("Error updating harvested status:", error);
      setMessage("Error updating status");
    }
  };

  /* ---------- Card Component for Mobile ---------- */
  const CropCard = ({ crop }) => {
    const plantedReadable = crop.planted_date
      ? new Date(crop.planted_date).toLocaleDateString()
      : "—";
    return (
      <Card
        variant="outlined"
        sx={{
          mb: 2.5,
          borderRadius: 3,
          position: "relative",
            overflow: "hidden",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(145deg,#182820,#15241d)"
              : "linear-gradient(145deg,#ffffff,#f6faf5)",
          transition: "transform 160ms, box-shadow 160ms",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 14px rgba(0,0,0,0.6)"
                : "0 4px 14px rgba(0,0,0,0.12)",
          },
        }}
      >
        <CardContent sx={{ pb: 1.5 }}>
          <Box
            display="flex"
            alignItems="flex-start"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(90deg,#2e7d32,#43a047,#66bb6a)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {crop.name}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={crop.type || "Unknown"}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip
                label={`Qty: ${crop.quantity}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={crop.harvested ? "Harvested" : "Growing"}
                size="small"
                color={crop.harvested ? "success" : "warning"}
                variant={crop.harvested ? "filled" : "outlined"}
              />
            </Stack>
          </Box>

          <Divider sx={{ my: 1.6 }} />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2.2}
            alignItems="flex-start"
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, letterSpacing: 0.5, opacity: 0.7 }}
              >
                Planted Date
              </Typography>
              <Typography variant="body2">{plantedReadable}</Typography>
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={crop.harvested}
                    onChange={() => handleToggleHarvested(crop)}
                    color="success"
                  />
                }
                label="Harvested"
              />
            </Box>
          </Stack>
        </CardContent>
        <CardActions
          sx={{
            pt: 0,
            px: 2,
            pb: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <Tooltip title="Edit">
            <IconButton
              onClick={() => handleOpenDialog(crop)}
              size="small"
              aria-label="edit crop"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleDelete(crop.id)}
              size="small"
              aria-label="delete crop"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  };

  /* ---------- Desktop Table View ---------- */
  const DesktopTable = () => (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 2px 10px rgba(0,0,0,0.55)"
            : "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Planted Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Harvested</TableCell>
            <TableCell sx={{ fontWeight: 600}}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {crops.map((crop) => (
            <TableRow
              key={crop.id}
              hover
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell>{crop.name}</TableCell>
              <TableCell>{crop.type}</TableCell>
              <TableCell>{crop.quantity}</TableCell>
              <TableCell>
                {crop.planted_date
                  ? new Date(crop.planted_date).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={crop.harvested}
                  onChange={() => handleToggleHarvested(crop)}
                  color="success"
                  size="small"
                />
              </TableCell>
              <TableCell >
                <Tooltip title="Edit">
                  <IconButton
                    onClick={() => handleOpenDialog(crop)}
                    size="small"
                    aria-label="edit crop"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    onClick={() => handleDelete(crop.id)}
                    size="small"
                    aria-label="delete crop"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {crops.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4, opacity: 0.7 }}>
                No crops found. Click "Add Crop" to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {loading && <LinearProgress />}
    </TableContainer>
  );

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        pb: 6,
        px: { xs: 1.5, sm: 2, md: 0 },
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(90deg,#2e7d32,#43a047)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              letterSpacing: 0.6,
            }}
          >
            Crop Management
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.65, mt: 0.4 }}>
            {matchesMobile
              ? "Manage crops in a simple mobile card list."
              : "Review and manage all crops in a structured table."}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: "green",
            "&:hover": { backgroundColor: "#006400" },
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Add Crop
        </Button>
      </Box>

      {message && (
        <Alert
          severity={message.includes("Error") ? "error" : "success"}
          sx={{ borderRadius: 2 }}
        >
          {message}
        </Alert>
      )}

      {loading && crops.length === 0 && (
        <Box sx={{ width: "100%", mt: 1 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Mobile Card View */}
      {matchesMobile && !loading && crops.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(145deg,#1b2b23,#16231d)"
                : "linear-gradient(145deg,#ffffff,#f6faf5)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            No crops yet
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
            Start by adding your first crop to track its progress.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Crop
          </Button>
        </Paper>
      )}

      {matchesMobile ? (
        <Box>
          {crops.map((crop) => (
            <CropCard key={crop.id} crop={crop} />
          ))}
        </Box>
      ) : (
        <DesktopTable />
      )}

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          {editingCrop ? "Edit Crop" : "Add New Crop"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 0.5 }}>
              <TextField
                fullWidth
                label="Crop Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Crop Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                helperText="e.g. Maize, Beans, Tomato"
              />
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
                helperText="Enter amount harvested or expected"
              />
              <TextField
                fullWidth
                label="Planted Date"
                name="planted_date"
                type="date"
                value={formData.planted_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.harvested}
                    onChange={handleChange}
                    name="harvested"
                    color="success"
                  />
                }
                label="Harvested"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog} variant="text">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ fontWeight: 600, borderRadius: 2 }}
            >
              {editingCrop ? "Update Crop" : "Add Crop"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default FarmerCrop;