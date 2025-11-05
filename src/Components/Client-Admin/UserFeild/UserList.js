import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  InputAdornment,
  Pagination,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  Collapse,
  Avatar,
  Stack,
  Divider,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import UserAdd from "../UserFeild/UserAdd";
import { Link, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

function UserList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null); // For mobile card expand
  const navigate=useNavigate()
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedClient(null);
    fetchClientData();
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async (key = "", direction = "desc") => {
    setLoading(true);
    setError(null);
    try {
      const userData = localStorage.getItem("user");
      let userIds = "";
      if (userData) {
        const data = JSON.parse(userData);
        userIds = data.id;
      }
      const sortValue = direction === "asc" ? 1 : direction === "desc" ? -1 : 1;
      const response = await axios.post(
        `${process.env.REACT_APP_IP}listUsers/`,
        {
          user_id: userIds,
          sort_by: key,
          sort_by_value: sortValue,
        }
      );
      setClientData(response.data.data.users || []);
    } catch (err) {
      setError("Failed to load client data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value.replace(/^\s+/g, "");
    setSearchTerm(value);
    setPage(0);
  };

  const filteredClientData = (clientData || []).filter(
    (client) =>
      (client.first_name && client.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.last_name && client.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.role_name && client.role_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedClientData = filteredClientData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredClientData.length / rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 📱 Mobile: Render user as expandable card
  const renderMobileUserCard = (client, index) => (
    <Card key={client.id} sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent
        sx={{
          p: 2,
          '&:last-child': { pb: 2 },
          cursor: 'pointer',
        }}
        onClick={() => setExpandedUser(expandedUser === index ? null : index)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {client.first_name || "N/A"} {client.last_name || ""}
          </Typography>
          <IconButton size="small">
            {expandedUser === index ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {client.email || "N/A"}
        </Typography>

        <Collapse in={expandedUser === index}>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body2">{client.role_name || "N/A"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body2" sx={{
                  color: client.is_active ? 'green' : 'red',
                  fontWeight: 'bold',
                }}>
                  {client.is_active ? 'Active' : 'Inactive'}
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    sx={{ textTransform: 'none' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClient(client);
                      setOpenDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    component={Link}
                    to={`/Home/users/userdetails/${client.id}?page=${page}`}
                    sx={{ textTransform: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );

  // 💻 Desktop/Tablet: Render table
  const renderDesktopTable = () => (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: "70vh",
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: "4px",
          height: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "10px",
        },
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead sx={{ backgroundColor: "#f6f6f6" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Username</TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Role</TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedClientData.length > 0 ? (
            paginatedClientData.map((client) => (
              <TableRow
                key={client.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/Home/users/userdetails/${client.id}?page=${page}`)}
              >
                <TableCell sx={{ textAlign: "center" }}>
                  {client.first_name || "N/A"} {client.last_name || ""}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>{client.email || "N/A"}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{client.role_name || "N/A"}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: client.is_active ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {client.is_active ? "Active" : "Inactive"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClient(client);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ flex: 1, width: "100%", p: { xs: 1, sm: 2, md: 3 }, mt: { xs: "10%", sm: "3%" } }}>
      {/* 🔝 Header Section - Responsive */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              variant="outlined"
              value={searchTerm}
              size="small"
              onChange={handleSearchChange}
              placeholder="Search by Username, Email, Role..."
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: "20px" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "14px",
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm="auto">
            <Button
              sx={{
                textTransform: "capitalize",
                color: "#fff",
                background: "#000080",
                "&:hover": {
                  backgroundColor: "darkblue",
                },
                width: "100%",
              }}
              variant="contained"
              onClick={() => {
                setSelectedClient(null);
                setOpenDialog(true);
              }}
            >
              Add New User
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 🔽 User List */}
      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : isMobile ? (
          // 📱 Mobile: Cards
          paginatedClientData.length === 0 ? (
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 4 }}>
              No users found.
            </Typography>
          ) : (
            paginatedClientData.map((client, index) => renderMobileUserCard(client, index))
          )
        ) : (
          // 💻 Desktop: Table
          renderDesktopTable()
        )}
      </Box>

      {/* 🔽 Pagination - Responsive */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 2,
          mt: 3,
          p: 1,
        }}
      >
        <FormControl size="small">
          <Select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            sx={{ minWidth: 100 }}
          >
            <MenuItem value={25}>25/page</MenuItem>
            <MenuItem value={50}>50/page</MenuItem>
            <MenuItem value={75}>75/page</MenuItem>
          </Select>
        </FormControl>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={(event, value) => setPage(value - 1)}
          color="primary"
          size={isMobile ? "small" : "medium"}
          showFirstButton
          showLastButton
        />
      </Box>

      {/* 📝 Add/Edit User Dialog - Responsive */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: "95%", sm: "600px" },
            maxWidth: "100%",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          {selectedClient ? "Edit User" : "Add New User"}
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <Box sx={{ p: 2 }}>
          <UserAdd
            clientData={selectedClient}
            onClose={handleDialogClose}
            reloadUser={fetchClientData}
          />
        </Box>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleDialogClose} color="primary" variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserList;