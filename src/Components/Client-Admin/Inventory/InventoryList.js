import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Pagination,
  Tooltip,
  Grid,
  Menu,
  IconButton,
  useMediaQuery,
  useTheme,
  Collapse,
  Avatar,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
} from "@mui/material";
import { Refresh, Visibility, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DottedCircleLoading from "../../Loading/DotLoading";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InventoryChannel from "./InventoryCahnnel";
import soon from "../../assets/soon.png";

const InventoryList = ({ fetchOrdersFromParent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const location = useLocation();
  const navigate = useNavigate();
  const [inventoryList, setInventory] = useState([]);
  const [currentColumn, setCurrentColumn] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [orderCount, setOrderCount] = useState(0);
  const [customStatus, setCustomStatus] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoMarket, setLogoMarket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All Channels",
  });
  const [open, setOpen] = useState(false);
  const [expandedInventory, setExpandedInventory] = useState(null); // For mobile card expand

  const queryParams = new URLSearchParams(window.location.search);
  const initialPage = parseInt(queryParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    fetchOrderData(selectedCategory.id, page, rowsPerPage);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    navigate(`/Home/inventory?page=${newPage}&rowsPerPage=${rowsPerPage}`);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    navigate(`/Home/inventory?page=1&rowsPerPage=${newRowsPerPage}`);
  };

  const prevParams = useRef({
    selectedCategoryId: selectedCategory.id,
    page,
    rowsPerPage,
    sortConfig,
    searchQuery,
  });

  const fetchOrderData = async (
    marketId,
    currentPage,
    currentRowsPerPage,
    currentSortConfig,
    currentSearchQuery
  ) => {
    setLoading(true);
    const validRowsPerPage = currentRowsPerPage > 0 ? currentRowsPerPage : 25;
    const skip = (currentPage - 1) * validRowsPerPage;

    try {
      const userData = localStorage.getItem("user");
      let userIds = "";
      if (userData) {
        const data = JSON.parse(userData);
        userIds = data.id;
      }

      const marketplaceIdToUse =
        marketId ||
        (localStorage.getItem("selectedCategory")
          ? JSON.parse(localStorage.getItem("selectedCategory")).id
          : "all");

      const response = await axios.post(
        `${process.env.REACT_APP_IP}fetchInventryList/`,
        {
          user_id: userIds,
          skip: skip >= 0 ? skip : 0,
          limit: validRowsPerPage,
          marketplace_id: marketplaceIdToUse,
          search_query: currentSearchQuery,
          sort_by: currentSortConfig.key,
          sort_by_value: currentSortConfig.direction === "asc" ? 1 : -1,
        }
      );

      if (response.data?.data?.inventry_list) {
        setInventory(response.data.data.inventry_list);
        setCustomStatus(response.data.data.status);
        setOrderCount(response.data.data.total_count);
        setTotalPages(Math.ceil(response.data.data.total_count / validRowsPerPage));
        setLogoMarket(
          Array.isArray(response.data.data.marketplace_list)
            ? response.data.data.marketplace_list
            : []
        );
      } else {
        setInventory([]);
        setOrderCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventory([]);
      setOrderCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    let initialCategory = { id: "all", name: "All Channels" };
    if (storedCategory) {
      initialCategory = JSON.parse(storedCategory);
      setSelectedCategory(initialCategory);
    }

    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }

    fetchOrderData(
      initialCategory.id,
      page,
      rowsPerPage,
      sortConfig,
      location.state?.searchQuery || ""
    );

    prevParams.current = {
      selectedCategoryId: initialCategory.id,
      page,
      rowsPerPage,
      sortConfig,
      searchQuery: location.state?.searchQuery || "",
    };
  }, []);

  useEffect(() => {
    const shouldFetch =
      selectedCategory.id !== prevParams.current.selectedCategoryId ||
      page !== prevParams.current.page ||
      rowsPerPage !== prevParams.current.rowsPerPage ||
      JSON.stringify(sortConfig) !== JSON.stringify(prevParams.current.sortConfig) ||
      searchQuery !== prevParams.current.searchQuery;

    if (shouldFetch) {
      fetchOrderData(selectedCategory.id, page, rowsPerPage, sortConfig, searchQuery);

      prevParams.current = {
        selectedCategoryId: selectedCategory.id,
        page,
        rowsPerPage,
        sortConfig,
        searchQuery,
      };
    }
  }, [selectedCategory.id, page, rowsPerPage, sortConfig, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column);
  };

  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setPage(1);
    setAnchorEl(null);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleProduct = (category) => {
    setSelectedCategory(category);
    setPage(1);
    localStorage.setItem("selectedCategory", JSON.stringify(category));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetChange = () => {
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setPage(1);
    toast.success("Filters reset successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
    });
  };

  // 📱 Mobile: Render inventory as expandable card
  const renderMobileInventoryCard = (item, index) => {
    return (
      <Card key={item.id} sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent
          sx={{ p: 2, "&:last-child": { pb: 2 }, cursor: "pointer" }}
          onClick={() => setExpandedInventory(expandedInventory === index ? null : index)}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {item.sku || "N/A"}
            </Typography>
            <IconButton size="small">
              {expandedInventory === index ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Avatar
              src={item.image_url || soon}
              alt="Product"
              variant="rounded"
              sx={{ width: 50, height: 50, mr: 2 }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {item.product_title}
            </Typography>
          </Box>

          <Collapse in={expandedInventory === index}>
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #eee" }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body2">{item.quantity || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="body2">
                    {item.price ? `$${parseFloat(item.price).toFixed(2)}` : "$0.00"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Channel
                  </Typography>
                  <Typography variant="body2">{item.marketplace_name || "N/A"}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<Visibility />}
                    sx={{ textTransform: "none" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Optional: navigate to detail page
                      // navigate(`/Home/inventory/${item.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  // 💻 Desktop: Render table
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
      <Table stickyHeader sx={{ minWidth: isTablet ? "100%" : "650px" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Image</TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>SKU</TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Product Title</TableCell>
            <TableCell
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
              onClick={(e) => handleOpenMenu(e, "quantity")}
            >
              Quantity <MoreVertIcon sx={{ fontSize: 14 }} />
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
              onClick={(e) => handleOpenMenu(e, "price")}
            >
              Price <MoreVertIcon sx={{ fontSize: 14 }} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventoryList.map((item) => (
            <TableRow
              key={item.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => {
                // Optional: navigate to detail
                // navigate(`/Home/inventory/${item.id}`);
              }}
            >
              <TableCell sx={{ textAlign: "center" }}>
                <img
                  src={item.image_url || soon}
                  alt="Product"
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: 5,
                  }}
                />
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>{item.sku || "N/A"}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>{item.product_title}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>{item.quantity || 0}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {item.price ? `$${parseFloat(item.price).toFixed(2)}` : "$0.00"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ flex: 1, width: "100%", p: { xs: 1, sm: 2 } }}>
      {/* 🔝 Sticky Top Controls */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "white",
          pt: 2,
          pb: 1,
          mb: 2,
          borderBottom: "1px solid #eee",
        }}
      >
        <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
          <Grid item xs={12} sm={4} md={3}>
            <InventoryChannel
              handleProduct={handleProduct}
              sx={{ width: "100%" }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <TextField
              size="small"
              placeholder="Search by Product Title, SKU..."
              value={searchQuery}
              onChange={handleSearchChange}
              fullWidth
              sx={{ "& input": { fontSize: "14px" } }}
            />
          </Grid>

          <Grid item xs={12} sm="auto">
            <Tooltip title="Reset" arrow>
              <Button
                variant="outlined"
                onClick={handleResetChange}
                fullWidth
                sx={{
                  minWidth: "auto",
                  bgcolor: "#000080",
                  color: "white",
                  border: "none",
                  p: 1,
                  "&:hover": { bgcolor: "darkblue" },
                }}
              >
                <Refresh />
              </Button>
            </Tooltip>
          </Grid>

          <Grid item xs={12} sm="auto">
            <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>
              Total Inventory: {orderCount || "0"}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* 📦 Inventory List */}
      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <DottedCircleLoading />
          </Box>
        ) : inventoryList.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 4 }}>
            No Inventory Found
          </Typography>
        ) : isMobile ? (
          // 📱 Mobile: Cards
          inventoryList.map((item, index) => renderMobileInventoryCard(item, index))
        ) : (
          // 💻 Desktop: Table
          renderDesktopTable()
        )}
      </Box>

      {/* 🔽 Pagination */}
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
          page={page}
          onChange={handlePageChange}
          color="primary"
          size={isMobile ? "small" : "medium"}
          showFirstButton
          showLastButton
        />
      </Box>

      {/* 🔽 Sorting Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {currentColumn === "quantity" && (
          <>
            <MenuItem onClick={() => handleSelectSort("quantity", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("quantity", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "price" && (
          <>
            <MenuItem onClick={() => handleSelectSort("price", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("price", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default InventoryList;