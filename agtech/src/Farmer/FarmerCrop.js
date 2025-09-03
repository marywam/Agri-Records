import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import axios from "axios";

const FarmerCrop = () => {
  const [crops, setCrops] = useState([]);
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

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${apiUrl}/crops/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCrops(response.data);
    } catch (error) {
      console.error("Error fetching crops:", error);
    }
  };

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
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
      setMessage(`Crop marked as ${!crop.harvested ? "Harvested" : "Growing"}`);
      fetchCrops();
    } catch (error) {
      console.error("Error updating harvested status:", error);
      setMessage("Error updating status");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Crop Management
      </Typography>

      {message && (
        <Alert severity={message.includes("Error") ? "error" : "success"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: "green",
                  "&:hover": { backgroundColor: "#006400" },
          }}

        >
          Add Crop
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Planted Date</TableCell>
              <TableCell>Harvested</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {crops.map((crop) => (
              <TableRow key={crop.id}>
                <TableCell>{crop.name}</TableCell>
                <TableCell>{crop.type}</TableCell>
                <TableCell>{crop.quantity}</TableCell>
                <TableCell>{new Date(crop.planted_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={crop.harvested}
                    onChange={() => handleToggleHarvested(crop)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(crop)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(crop.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCrop ? "Edit Crop" : "Add New Crop"}</DialogTitle>
        <form onSubmit={handleSubmit}>
        <DialogContent>
  <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
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
  helperText="Enter the type of crop (e.g., cereal, fruit, vegetable)"
/>


    <TextField
      fullWidth
      label="Quantity"
      name="quantity"
      type="number"
      value={formData.quantity}
      onChange={handleChange}
      required
      helperText="Enter quantity (e.g., in Kg or bags)"
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
          color="primary"
        />
      }
      label="Harvested"
    />
  </Box>
</DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCrop ? "Update" : "Add"} Crop
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default FarmerCrop;
