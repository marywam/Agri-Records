import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { AdminAPI } from "../api/adminApi";

const blankEdit = {
  id: null,
  name: "",
  type: "",
  quantity: 0,
  planted_date: "",
  harvested: false,
  farmer: null,
};

const AdminCropsList = () => {
  const [crops, setCrops] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState(blankEdit);
  const [saving, setSaving] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [feedback, setFeedback] = useState("");

  const loadCrops = useCallback(async () => {
    setLoading(true);
    setLoadingError("");
    try {
      const data = await AdminAPI.listCrops();
      setCrops(data);
      setFiltered(data);
    } catch (e) {
      setLoadingError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(crops);
    } else {
      const q = query.toLowerCase();
      setFiltered(
        crops.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.type.toLowerCase().includes(q) ||
            (c.farmer?.username || "")
              .toLowerCase()
              .includes(q)
        )
      );
    }
    setPage(0);
  }, [query, crops]);

  const openEdit = (crop) => {
    setFormData({
      id: crop.id,
      name: crop.name,
      type: crop.type,
      quantity: crop.quantity,
      planted_date: crop.planted_date,
      harvested: crop.harvested,
      farmer: crop.farmer,
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        quantity: Number(formData.quantity) || 0,
        planted_date: formData.planted_date,
        harvested: formData.harvested,
        farmer: formData.farmer, // keep existing relation
      };
      await AdminAPI.updateCrop(formData.id, payload);
      setFeedback("Crop updated.");
      setEditDialogOpen(false);
      loadCrops();
    } catch (e) {
      setFeedback(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await AdminAPI.deleteCrop(deleteCandidate.id);
      setFeedback("Crop deleted.");
      setDeleteCandidate(null);
      loadCrops();
    } catch (e) {
      setFeedback(e.message);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(90deg,#2e7d32,#43a047)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Crop Management
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.65 }}>
            View and manage all crops from every farmer.
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={loadCrops} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {feedback && (
        <Alert
          severity={
            feedback.toLowerCase().includes("fail") ||
            feedback.toLowerCase().includes("error")
              ? "error"
              : "success"
          }
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setFeedback("")}
        >
          {feedback}
        </Alert>
      )}

      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          mb: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          label="Search (name / type / farmer)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
          }}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <Chip
          label={`Total: ${crops.length}`}
          color="success"
          variant="outlined"
          size="small"
        />
      </Paper>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Planted Date</TableCell>
                <TableCell>Harvested</TableCell>
               
                <TableCell>Farmer ID</TableCell>
                <TableCell >Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                Array.from({ length: 7 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton height={20} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!loading &&
                filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((c) => (
                    <TableRow hover key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.type}</TableCell>
                      <TableCell>{c.quantity}</TableCell>
                      <TableCell>
                        {new Date(c.planted_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.harvested ? "Yes" : "No"}
                          size="small"
                          color={c.harvested ? "success" : "warning"}
                          variant={c.harvested ? "filled" : "outlined"}
                        />
                      </TableCell>
                     
                      <TableCell>{c.farmer || "-"}</TableCell>
                      <TableCell >
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(c)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteCandidate(c)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    No crops found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[rowsPerPage]}
          rowsPerPage={rowsPerPage}
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => !saving && setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Crop</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <DialogContent dividers>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ mt: 0.5 }}
            >
              <TextField
                label="Name"
                name="name"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
              <TextField
                label="Type"
                name="type"
                fullWidth
                value={formData.type}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, type: e.target.value }))
                }
                required
              />
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    quantity: e.target.value,
                  }))
                }
                inputProps={{ min: 0 }}
                required
              />
              <TextField
                label="Planted Date"
                name="planted_date"
                type="date"
                fullWidth
                value={formData.planted_date}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    planted_date: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                select
                label="Harvested"
                name="harvested"
                fullWidth
                value={formData.harvested ? "true" : "false"}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    harvested: e.target.value === "true",
                  }))
                }
                SelectProps={{ native: true }}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ fontWeight: 600 }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Crop</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to delete crop{" "}
          <strong>{deleteCandidate?.name}</strong>?
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteCandidate(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{ fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCropsList;