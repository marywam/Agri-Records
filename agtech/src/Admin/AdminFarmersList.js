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
  Divider,
  Grid,
  useMediaQuery,
  Card,
  CardContent,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import WcIcon from "@mui/icons-material/Wc";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useTheme } from "@mui/material/styles";
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
  const [dialogMode, setDialogMode] = useState("add");
  const [formData, setFormData] = useState(blankAdd);
  const [saving, setSaving] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isXSmall = useMediaQuery("(max-width:350px)");

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

  const handleCardClick = (farmer) => {
    setSelectedFarmer(farmer);
    setDrawerOpen(true);
  };

  const pagedData = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ pb: isSmall ? 7 : 2 }}>
      <Box
        sx={{
          mb: 2,
          px: isSmall ? 2 : 0,
          display: "flex",
          flexDirection: isSmall ? "column" : "row",
          gap: 2,
          alignItems: isSmall ? "stretch" : "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant={isSmall ? "h6" : "h5"}
            sx={{
              fontWeight: 800,
              background: "linear-gradient(90deg,#2e7d32,#43a047)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              fontSize: isSmall ? "1.25rem" : "1.5rem",
            }}
          >
            Farmer Management
          </Typography>
          {!isXSmall && (
            <Typography variant="body2" sx={{ opacity: 0.65 }}>
              View, add, edit, and delete farmer accounts.
            </Typography>
          )}
        </Box>

        <Stack 
          direction="row" 
          spacing={1.5}
          sx={{ 
            width: isSmall ? "100%" : "auto",
            justifyContent: isSmall ? "space-between" : "flex-end"
          }}
        >
          <Tooltip title="Refresh list">
            <IconButton 
              size={isSmall ? "medium" : "small"}
              onClick={loadFarmers} 
              disabled={loading}
              sx={{
                bgcolor: "rgba(46, 125, 50, 0.08)",
                "&:hover": { bgcolor: "rgba(46, 125, 50, 0.15)" }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={openAdd}
            sx={{ 
              backgroundColor: "green",
              "&:hover": { bgcolor: "#006400" },
              flex: isSmall ? 1 : "none",
              height: isSmall ? 40 : 'auto'
            }}
          >
            {isSmall ? "Add Farmer" : "Add Farmer"}
          </Button>
        </Stack>
      </Box>

      {feedback && (
        <Alert
          severity={feedback.toLowerCase().includes("error") ? "error" : "success"}
          sx={{ 
            mx: isSmall ? 2 : 0,
            mb: 2, 
            borderRadius: 2 
          }}
          onClose={() => setFeedback("")}
        >
          {feedback}
        </Alert>
      )}

      {loadingError && (
        <Alert
          severity="error"
          sx={{ 
            mx: isSmall ? 2 : 0,
            mb: 2, 
            borderRadius: 2 
          }}
          onClose={() => setLoadingError("")}
        >
          {loadingError}
        </Alert>
      )}

      <Card
        elevation={1}
        sx={{
          mx: isSmall ? 2 : 0,
          mb: 2,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: isSmall ? "12px !important" : 2 }}>
          <Stack
            direction={isSmall ? "column" : "row"}
            spacing={2}
            alignItems={isSmall ? "stretch" : "center"}
          >
            <TextField
              size="small"
              placeholder="Search by name, email, or username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />,
              }}
              sx={{ 
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper"
                }
              }}
              fullWidth={isSmall}
            />
            <Chip
              label={`Total: ${farmers.length}`}
              color="success"
              variant="outlined"
              size="small"
              sx={{ alignSelf: isSmall ? "flex-start" : "center" }}
            />
          </Stack>
        </CardContent>
      </Card>

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
                  pagedData.map((f) => (
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
      )}

      {isSmall && (
        <Box sx={{ px: 2 }}>
          {loading && (
            <Stack spacing={2}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: "16px !important" }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Skeleton width={120} height={24} />
                        <Skeleton width={80} height={24} />
                      </Box>
                      <Skeleton width="100%" height={20} />
                      <Grid container spacing={2}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <Grid item xs={6} key={j}>
                            <Skeleton width="100%" height={40} />
                          </Grid>
                        ))}
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}

          {!loading && filtered.length === 0 && (
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                bgcolor: "rgba(0,0,0,0.02)",
              }}
            >
              <Typography color="text.secondary">
                No farmers found
              </Typography>
            </Card>
          )}

          {!loading && (
            <Stack spacing={2}>
              {pagedData.map((farmer) => (
                <Card
                  key={farmer.id}
                  sx={{
                    borderRadius: 3,
                    "&:active": { transform: "scale(0.995)" },
                    transition: "transform 0.1s",
                  }}
                  onClick={() => handleCardClick(farmer)}
                >
                  <CardContent sx={{ p: "16px !important" }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "green" }}>
                            {farmer.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {farmer.email}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(farmer);
                            }}
                            sx={{
                              bgcolor: "success.soft",
                              color: "success.main",
                              "&:hover": { bgcolor: "success.softHover" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteCandidate(farmer);
                            }}
                            sx={{
                              bgcolor: "error.soft",
                              color: "error.main",
                              "&:hover": { bgcolor: "error.softHover" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Name
                              </Typography>
                              <Typography variant="body2" noWrap>
                                {`${farmer.first_name || ''} ${farmer.last_name || ''}`.trim() || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Phone
                              </Typography>
                              <Typography variant="body2" noWrap>
                                {farmer.phone_number || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Location
                              </Typography>
                              <Typography variant="body2" noWrap>
                                {farmer.location || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AgricultureIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Farm Size
                              </Typography>
                              <Typography variant="body2" noWrap>
                                {farmer.farm_size || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}

          <Paper
            elevation={3}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              borderRadius: "16px 16px 0 0",
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <TablePagination
              component="div"
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              sx={{
                ".MuiTablePagination-toolbar": {
                  minHeight: 48,
                  px: 1,
                },
                ".MuiTablePagination-displayedRows": {
                  fontSize: "0.875rem",
                },
                ".MuiTablePagination-selectLabel": {
                  display: "none",
                },
                ".MuiTablePagination-select": {
                  display: "none",
                },
                ".MuiTablePagination-selectIcon": {
                  display: "none",
                },
              }}
            />
          </Paper>
        </Box>
      )}

      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => {}}
        sx={{
          "& .MuiDrawer-paper": {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "90vh",
          },
        }}
      >
        {selectedFarmer && (
          <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Farmer Details
              </Typography>
              
              <List disablePadding>
                {[
                  { icon: <PersonIcon />, label: "Username", value: selectedFarmer.username },
                  { icon: <EmailIcon />, label: "Email", value: selectedFarmer.email },
                  { icon: <PersonIcon />, label: "Name", value: `${selectedFarmer.first_name || ''} ${selectedFarmer.last_name || ''}`.trim() || "-" },
                  { icon: <PhoneIcon />, label: "Phone", value: selectedFarmer.phone_number || "-" },
                  { icon: <LocationOnIcon />, label: "Location", value: selectedFarmer.location || "-" },
                  { icon: <AgricultureIcon />, label: "Farm Size", value: selectedFarmer.farm_size || "-" },
                  { icon: <WcIcon />, label: "Gender", value: selectedFarmer.gender || "-" },
                  { icon: <CalendarTodayIcon />, label: "Date of Birth", value: selectedFarmer.date_of_birth || "-" },
                ].map((item, index) => (
                  <React.Fragment key={item.label}>
                    <ListItem sx={{ px: 0 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                        {React.cloneElement(item.icon, { 
                          sx: { color: "text.secondary", fontSize: 20 } 
                        })}
                        <ListItemText
                          primary={item.label}
                          secondary={item.value}
                          primaryTypographyProps={{ 
                            variant: "caption",
                            color: "text.secondary"
                          }}
                          secondaryTypographyProps={{ 
                            variant: "body1",
                            color: "text.primary"
                          }}
                        />
                      </Stack>
                    </ListItem>
                    {index < 7 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setDrawerOpen(false);
                    openEdit(selectedFarmer);
                  }}
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setDrawerOpen(false);
                    setDeleteCandidate(selectedFarmer);
                  }}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </SwipeableDrawer>

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