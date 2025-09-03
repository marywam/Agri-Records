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
  Chip,
  Stack,
  Skeleton,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { AdminAPI } from "../api/adminApi";
import FarmerFormDialog from "../Admin/AminFarmersFormDialog";

const blankAdd = {
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
};

const AdminFarmersList = () => {
  const [farmers, setFarmers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 8;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' | 'edit'
  const [formData, setFormData] = useState(blankAdd);
  const [saving, setSaving] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [feedback, setFeedback] = useState("");

  const loadFarmers = useCallback(async () => {
    setLoading(true);
    setLoadingError("");
    try {
      const data = await AdminAPI.listFarmers();
      setFarmers(data);
      setFiltered(data);
    } catch (e) {
      setLoadingError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFarmers();
  }, [loadFarmers]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(farmers);
    } else {
      const q = query.toLowerCase();
      setFiltered(
        farmers.filter(
          (f) =>
            f.username.toLowerCase().includes(q) ||
            f.email.toLowerCase().includes(q) ||
            (f.first_name || "").toLowerCase().includes(q) ||
            (f.last_name || "").toLowerCase().includes(q)
        )
      );
    }
    setPage(0);
  }, [query, farmers]);

  const openAdd = () => {
    setDialogMode("add");
    setFormData(blankAdd);
    setDialogOpen(true);
  };

  const openEdit = (farmer) => {
    setDialogMode("edit");
    setFormData(farmer);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (dialogMode === "add") {
        if (formData.password !== formData.confirm_password) {
          throw new Error("Passwords do not match");
        }
        await AdminAPI.createFarmer(formData);
        setFeedback("Farmer created successfully.");
      } else {
        const payload = { ...formData };
        // email & role are read-only; ensure not sending unwanted fields
        delete payload.email;
        delete payload.role;
        delete payload.password;
        delete payload.confirm_password;
        await AdminAPI.updateFarmer(formData.id, payload);
        setFeedback("Farmer updated successfully.");
      }
      setDialogOpen(false);
      loadFarmers();
    } catch (e) {
      setFeedback(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await AdminAPI.deleteFarmer(deleteCandidate.id);
      setFeedback("Farmer deleted.");
      setDeleteCandidate(null);
      loadFarmers();
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
            Farmer Management
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.65 }}>
            View, add, edit, and delete farmer accounts.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadFarmers} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={openAdd}
            sx={{ backgroundColor: "green", "&:hover": { bgcolor: "#006400" } }}
          >
            Add Farmer
          </Button>
        </Stack>
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
          label="Search (name, email, username)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
          }}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <Chip
          label={`Total: ${farmers.length}`}
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
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Farm Size</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
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
                  .map((f) => (
                    <TableRow hover key={f.id}>
                      <TableCell>{f.username}</TableCell>
                      <TableCell>{f.email}</TableCell>
                      <TableCell>
                        {(f.first_name || "") + " " + (f.last_name || "")}
                      </TableCell>
                      <TableCell>{f.phone_number || "-"}</TableCell>
                      <TableCell>{f.location || "-"}</TableCell>
                      <TableCell>{f.farm_size || "-"}</TableCell>
                      <TableCell>{f.gender || "-"}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(f)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteCandidate(f)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 5, opacity: 0.7 }}
                  >
                    No farmers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
        />
      </Paper>

      <FarmerFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSave}
        mode={dialogMode}
        formData={formData}
        setFormData={setFormData}
        saving={saving}
      />

      <Dialog
        open={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Farmer</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to delete farmer{" "}
          <strong>{deleteCandidate?.username}</strong>?
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

export default AdminFarmersList;