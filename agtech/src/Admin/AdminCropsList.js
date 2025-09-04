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
  Divider,
  Grid,
  useMediaQuery
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";
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

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

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
            (c.farmer?.username || "").toLowerCase().includes(q)
        )
      );
    }
    setPage(0);
  }, [query, crops]);

  const pagedData = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
        farmer: formData.farmer,
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

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
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

      {/* Large screens: original table retained */}
      {!isSmall && (
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
                  <TableCell>FarmerID</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading &&
                  Array.from({ length: 7 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton height={20} />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Skeleton height={20} />
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading &&
                  pagedData.map((c) => (
                    <TableRow hover key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.type}</TableCell>
                      <TableCell>{c.quantity}</TableCell>
                      <TableCell>{formatDate(c.planted_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={c.harvested ? "Yes" : "No"}
                          size="small"
                          color={c.harvested ? "success" : "warning"}
                          variant={c.harvested ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell>
                        {c.farmer?.username || c.farmer?.id || c.farmer || "-"}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(c)}>
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
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
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
      )}

      {/* Small screens: card layout */}
      {isSmall && (
        <Box>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Paper
                key={i}
                elevation={1}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 3,
                }}
              >
                <Skeleton variant="text" width="55%" />
                <Skeleton variant="text" width="35%" />
                <Skeleton variant="rectangular" height={16} sx={{ my: 1 }} />
                <Skeleton variant="text" width="70%" />
              </Paper>
            ))}

          {!loading && filtered.length === 0 && (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                opacity: 0.75,
                mb: 2,
              }}
            >
              <Typography>No crops found.</Typography>
            </Paper>
          )}

          {!loading &&
            pagedData.map((c) => (
              <Paper
                key={c.id}
                elevation={2}
                sx={{
                  mb: 2,
                  p: 2.2,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.2,
                  background: "linear-gradient(135deg,#ffffff 0%,#f6f9f6 100%)",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "green" }}
                    >
                      {c.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {c.type}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(c)}
                        sx={{
                          bgcolor: "rgba(0,128,0,0.08)",
                          "&:hover": { bgcolor: "rgba(0,128,0,0.15)" },
                        }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteCandidate(c)}
                        sx={{
                          bgcolor: "rgba(244,67,54,0.12)",
                          "&:hover": { bgcolor: "rgba(244,67,54,0.2)" },
                        }}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <Grid container spacing={2.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      Quantity
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {c.quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      Planted
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(c.planted_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    <Typography variant="caption" sx={{ opacity: 0.6 }}>
      Harvested
    </Typography>
    <Chip
      label={c.harvested ? "Yes" : "No"}
      size="small"
      color={c.harvested ? "success" : "warning"}
      variant={c.harvested ? "filled" : "outlined"}
    />
  </Box>
</Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      FarmerID
                    </Typography>
                    <Typography variant="body2">
                      {c.farmer?.username || c.farmer?.id || c.farmer || "-"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}

          <Paper
            elevation={0}
            sx={{
              mt: 1,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <TablePagination
              component="div"
              rowsPerPageOptions={[rowsPerPage]}
              rowsPerPage={rowsPerPage}
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              sx={{
                ".MuiTablePagination-toolbar": { px: 0.5 },
              }}
            />
          </Paper>
        </Box>
      )}

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
            <Button onClick={() => setEditDialogOpen(false)} disabled={saving} sx={{
    color: '#008000',                    // normal state
    fontWeight: 600,
    '&:hover': { backgroundColor: 'rgba(0,128,0,0.08)' },
    '&:disabled': {
      color: 'rgba(0,128,0,0.4)',        // faded green when disabled
    },
  }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                fontWeight: 600,
                backgroundColor: "green",
                color: "#fff",
                "&:hover": { backgroundColor: "#006400" },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(0,128,0,0.4)",
                  color: "#fff",
                },
              }}
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