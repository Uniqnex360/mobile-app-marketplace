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
  Modal,
  Slide,
  Menu,
  IconButton,
  FormControl,
  InputLabel,
  CircularProgress,
  Stack,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FilterList, Refresh, Visibility, ExpandMore, ExpandLess } from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DottedCircleLoading from "../../Loading/DotLoading";
import AddIcon from "@mui/icons-material/Add";
import MannualOrder from "./MannualOrder";
import ChannelOrder from "./ChannelOrder";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BrandSelector from "../../../utils/BrandSelector";

const OrderList = ({ fetchOrdersFromParent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [currentColumn, setCurrentColumn] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [manualOrders, setManualOrders] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [inputValueBrand, setInputValueBrand] = useState("");
  const [brandList, setBrandList] = useState([]);
  const [brandLimit, setBrandLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [orderCount, setOrderCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [customStatus, setCustomStatus] = useState([]);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadStartDate, setDownloadStartDate] = useState(null);
  const [downloadEndDate, setDownloadEndDate] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState("csv");
  const [searchQuery, setSearchQuery] = useState("");
  const [logoMarket, setLogoMarket] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All Channels",
  });
  const [expandedOrder, setExpandedOrder] = useState(null); // For mobile card expand

  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleClearFilter = () => {
    setSelectedBrand([]);
    toast.success("Brands reset successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
    });
  };

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    if (storedCategory) {
      const parsedCategory = JSON.parse(storedCategory);
      setSelectedCategory(parsedCategory);
    }
  }, []);

  const userData = localStorage.getItem("user");
  let userIds = "";
  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }

  const queryParams = new URLSearchParams(window.location.search);
  const initialPage = parseInt(queryParams.get("page")) || 1;
  const initialRowsPerPage = parseInt(queryParams.get("rowsPerPage"), 10) || 25;
  const [page, setPage] = useState(initialPage);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    navigate(`/Home/orders?page=${newPage}&rowsPerPage=${rowsPerPage}`);
  };

  const handleRowsPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    navigate(`/Home/orders?page=${page}&rowsPerPage=${value}`);
    setPage(1);
  };

  useEffect(() => {
    setRowsPerPage(initialRowsPerPage);
  }, [location.search]);

  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IP}getBrandListforfilter/`,
          {
            params: {
              search_query: inputValueBrand,
              user_id: userIds,
              limit: brandLimit,
            },
          }
        );
        const names = response.data.data.brand_list || [];
        setBrandList(names);
        setHasMore(names.length >= brandLimit);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setHasMore(false);
        setBrandList([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, [inputValueBrand, brandLimit, userIds]);

  const fetchOrderData = async (marketId = "all", page, rowsPerPage) => {
    setLoading(true);
    const validRowsPerPage = rowsPerPage && rowsPerPage > 0 ? rowsPerPage : 25;
    const skip = (page - 1) * validRowsPerPage;
    try {
      const marketplaceId = localStorage.getItem("selectedCategory")
        ? JSON.parse(localStorage.getItem("selectedCategory")).id
        : "all";

      const payload = {
        user_id: userIds,
        skip: skip >= 0 ? skip : 0,
        limit: validRowsPerPage,
        marketplace_id: marketplaceId,
        search_query: searchQuery,
        sort_by: sortConfig.key,
        sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
        timezone: "US/Pacific",
      };

      if (selectedStatus && selectedStatus !== "all") {
        payload.order_status = selectedStatus;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_IP}fetchAllorders/`,
        payload
      );

      const responseData = response.data || {};
      setOrders(Array.isArray(responseData.orders) ? responseData.orders : []);
      setLogoMarket(
        Array.isArray(responseData.marketplace_list)
          ? responseData.marketplace_list
          : []
      );
      setOrderCount(responseData.total_count || 0);
      setTotalPages(
        Math.ceil((responseData.total_count || 0) / validRowsPerPage)
      );
      setCustomStatus(responseData.status || "");
      setManualOrders([]);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders. Please try again.");
      setOrders([]);
      setManualOrders([]);
      setLogoMarket([]);
      setOrderCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const prevParams = useRef({
    selectedCategoryId: selectedCategory.id,
    page,
    rowsPerPage,
    sortConfig,
    searchQuery,
    selectedStatus,
  });

  useEffect(() => {
    const shouldFetch =
      selectedCategory.id !== prevParams.current.selectedCategoryId ||
      page !== prevParams.current.page ||
      rowsPerPage !== prevParams.current.rowsPerPage ||
      JSON.stringify(sortConfig) !== JSON.stringify(prevParams.current.sortConfig) ||
      searchQuery !== prevParams.current.searchQuery ||
      selectedStatus !== prevParams.current.selectedStatus;

    if (shouldFetch) {
      fetchOrderData(selectedCategory.id, page, rowsPerPage);
      prevParams.current = {
        selectedCategoryId: selectedCategory.id,
        page,
        rowsPerPage,
        sortConfig,
        searchQuery,
        selectedStatus,
      };
    }
  }, [
    selectedCategory.id,
    page,
    rowsPerPage,
    sortConfig,
    searchQuery,
    selectedStatus,
  ]);

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    if (storedCategory) {
      const category = JSON.parse(storedCategory);
      setSelectedCategory(category);
    }
    fetchOrderData(selectedCategory.id, page, rowsPerPage);
  }, []);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    fetchOrderData(selectedCategory.id, page, rowsPerPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column);
  };

  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setAnchorEl(null);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleProduct = (category) => {
    setSelectedCategory(category);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetChange = () => {
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setSelectedCategory({ id: "all", name: "All Channels" });
    localStorage.setItem(
      "selectedCategory",
      JSON.stringify({ id: "all", name: "All Channels" })
    );
    setPage(1);
    setSelectedStatus("all");
    toast.success("Reset Successfully", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
    });
  };

  const handleDownload = async () => {
    try {
      if (
        selectedBrand.length === 0 &&
        (!downloadStartDate || !downloadEndDate)
      ) {
        toast.error("Please select at least one brand OR a valid date range");
        return;
      }
      if (
        downloadStartDate &&
        downloadEndDate &&
        new Date(downloadEndDate) < new Date(downloadStartDate)
      ) {
        toast.error("End date must be after start date");
        return;
      }

      const requestData = {};
      if (selectedBrand.length > 0) {
        requestData.brands = selectedBrand.map((b) => b.id);
      }
      if (downloadStartDate && downloadEndDate) {
        const formatLocalDate = (date) => {
          if (!date) return null;
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        requestData.start_date = formatLocalDate(downloadStartDate);
        requestData.end_date = formatLocalDate(downloadEndDate);
      }
      requestData.format = downloadFormat;
      requestData.user_id = userIds;

      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_IP}downloadOrders/`,
        requestData,
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `orders_${new Date().toISOString().split("T")[0]}.${downloadFormat}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadModalOpen(false);
      setSelectedBrand([]);
      setDownloadStartDate(null);
      setDownloadEndDate(null);
      setDownloadFormat("csv");
      toast.success("Download started successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔽 Mobile: Render order as expandable card
  const renderMobileOrderCard = (order, index) => {
    const marketplace = logoMarket.find(
      (m) => m.name === order.marketplace_name
    );

    return (
      <Card key={order.id} sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent
          sx={{
            p: 2,
            "&:last-child": { pb: 2 },
            cursor: "pointer",
          }}
          onClick={() => setExpandedOrder(expandedOrder === index ? null : index)}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {order.purchase_order_id || "N/A"}
            </Typography>
            <IconButton size="small">
              {expandedOrder === index ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary">
            <strong>Channel:</strong>{" "}
            {marketplace?.image_url ? (
              <Avatar
                src={marketplace.image_url}
                alt={marketplace.name}
                sx={{ width: 16, height: 16, mr: 0.5, display: "inline-flex", verticalAlign: "middle" }}
              />
            ) : null}
            {order.marketplace_name || "N/A"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            <strong>Status:</strong> {order.order_status || "N/A"}
          </Typography>

          <Collapse in={expandedOrder === index}>
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #eee" }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography variant="body2">
                    {order.order_date
                      ? new Date(order.order_date).toLocaleString(undefined, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "US/Pacific",
                        })
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Currency
                  </Typography>
                  <Typography variant="body2">{order.currency || "N/A"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body2">
                    {order.items_order_quantity || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Order Value
                  </Typography>
                  <Typography variant="body2">
                    $
                    {order.order_total && !isNaN(order.order_total)
                      ? order.order_total.toFixed(2)
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<Visibility />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/Home/orders/details/${order.id}?page=${page}&rowsPerPage=${rowsPerPage}`
                      );
                    }}
                    sx={{ textTransform: "none" }}
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

  // 🔽 Desktop: Render table
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
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Purchase Order ID</TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Channel Name</TableCell>
            <TableCell
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
              onClick={(e) => handleOpenMenu(e, "order_date")}
            >
              Order Date <MoreVertIcon sx={{ fontSize: 14 }} />
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Currency</TableCell>
            <TableCell
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
              onClick={(e) => handleOpenMenu(e, "items_order_quantity")}
            >
              Quantity <MoreVertIcon sx={{ fontSize: 14 }} />
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
              onClick={(e) => handleOpenMenu(e, "order_total")}
            >
              Order Value <MoreVertIcon sx={{ fontSize: 14 }} />
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}
              onClick={(e) => handleOpenMenu(e, "order_status")}
            >
              Status <MoreVertIcon sx={{ fontSize: 14 }} />
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <DottedCircleLoading />
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ color: "red", fontWeight: "bold" }}>
                No Orders To Show
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const marketplace = logoMarket.find(
                (m) => m.name === order.marketplace_name
              );
              return (
                <TableRow
                  key={order.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      `/Home/orders/details/${order.id}?page=${page}&rowsPerPage=${rowsPerPage}`
                    )
                  }
                >
                  <TableCell sx={{ textAlign: "center" }}>{order.purchase_order_id}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {marketplace && marketplace.image_url ? (
                      <Avatar
                        src={marketplace.image_url}
                        alt={marketplace.name}
                        sx={{ width: 20, height: 20, mr: 1, display: "inline-flex", verticalAlign: "middle" }}
                      />
                    ) : null}
                    {order.marketplace_name}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {order.order_date
                      ? new Date(order.order_date).toLocaleString(undefined, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "US/Pacific",
                        })
                      : "N/A"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{order.currency}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {order.items_order_quantity || "N/A"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    $
                    {order.order_total && !isNaN(order.order_total)
                      ? order.order_total.toFixed(2)
                      : "N/A"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{order.order_status || "N/A"}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title="View Order Details" arrow>
                      <Button
                        variant="text"
                        sx={{ color: "#000080", minWidth: 0, p: 0.5 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/Home/orders/details/${order.id}?page=${page}&rowsPerPage=${rowsPerPage}`
                          );
                        }}
                      >
                        <Visibility sx={{ fontSize: 20 }} />
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ flex: 1, width: "100%", p: { xs: 1, sm: 2 } }}>
      {/* 🔝 Top Controls - Responsive Stack */}
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
            <ChannelOrder
              handleProduct={handleProduct}
              clearChannel={selectedCategory}
              sx={{ width: "100%" }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <TextField
              size="small"
              placeholder="Search Purchase Order ID"
              value={searchQuery}
              onChange={handleSearchChange}
              fullWidth
              sx={{ "& input": { fontSize: "14px" } }}
            />
          </Grid>

          {selectedCategory.id === "custom" && (
            <Grid item xs={12} sm="auto">
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
                startIcon={<AddIcon />}
                fullWidth
                sx={{
                  bgcolor: "#000080",
                  color: "white",
                  textTransform: "none",
                  height: 40,
                  "&:hover": { bgcolor: "darkblue" },
                }}
              >
                Create Order
              </Button>
            </Grid>
          )}

          <Grid item xs={12} sm="auto">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDownloadModalOpen(true)}
              fullWidth
              sx={{
                bgcolor: "#000080",
                "&:hover": { bgcolor: "darkblue" },
                textTransform: "none",
              }}
            >
              Download Orders
            </Button>
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
              Total Orders: {orderCount || "0"}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* 📊 Orders List */}
      <Box sx={{ mt: 2 }}>
        {customStatus === "custom" ? (
          <Typography variant="h6" align="center" color="text.secondary">
            Custom Orders Not Implemented Yet
          </Typography>
        ) : isMobile ? (
          // 📱 Mobile: Cards
          loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <DottedCircleLoading />
            </Box>
          ) : orders.length === 0 ? (
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 4 }}>
              No Orders Found
            </Typography>
          ) : (
            orders.map((order, index) => renderMobileOrderCard(order, index))
          )
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

      {/* 📝 Manual Order Modal */}
      <Modal open={open} onClose={handleClose}>
        <Slide direction="left" in={open} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: { xs: "100vw", sm: 900 },
              height: "100vh",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 2,
              overflow: "auto",
            }}
          >
            <MannualOrder handleClose={handleClose} />
          </Box>
        </Slide>
      </Modal>

      {/* 🔽 Sort Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {currentColumn === "order_date" && (
          <>
            <MenuItem onClick={() => handleSelectSort("order_date", "asc")}>Oldest</MenuItem>
            <MenuItem onClick={() => handleSelectSort("order_date", "desc")}>Latest</MenuItem>
          </>
        )}
        {currentColumn === "items_order_quantity" && (
          <>
            <MenuItem onClick={() => handleSelectSort("items_order_quantity", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("items_order_quantity", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "order_total" && (
          <>
            <MenuItem onClick={() => handleSelectSort("order_total", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("order_total", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "order_status" && (
          <>
            <MenuItem onClick={() => handleSelectSort("order_status", "asc")}>Sort A-Z</MenuItem>
            <MenuItem onClick={() => handleSelectSort("order_status", "desc")}>Sort Z-A</MenuItem>
          </>
        )}
      </Menu>

      {/* 📥 Download Modal */}
      <Modal open={downloadModalOpen} onClose={() => setDownloadModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Download Orders
            </Typography>

            {selectedBrand.length > 0 && (
              <Box sx={{ p: 1.5, border: "1px solid #ddd", borderRadius: 2, bgcolor: "#f9f9f9" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Selected Brands ({selectedBrand.length})
                  </Typography>
                  <Button size="small" onClick={() => setSelectedBrand([])}>
                    Clear
                  </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedBrand.map((brand) => (
                    <Chip
                      key={brand.id}
                      label={brand.name}
                      size="small"
                      onDelete={() => setSelectedBrand((prev) => prev.filter((b) => b.id !== brand.id))}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <BrandSelector
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              brandList={brandList}
              inputValueBrand={inputValueBrand}
              setInputValueBrand={setInputValueBrand}
              brandLimit={brandLimit}
              setBrandLimit={setBrandLimit}
              isLoading={isLoading}
              hasMore={hasMore}
              toggleSelection={(option) => {
                const isSelected = selectedBrand.some((b) => b.id === option.id);
                setSelectedBrand((prev) =>
                  isSelected ? prev.filter((b) => b.id !== option.id) : [...prev, option]
                );
              }}
              label="Brands"
              width="100%"
            />

            <Divider>
              <Typography variant="overline">OR</Typography>
            </Divider>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={downloadStartDate}
                onChange={(newValue) => setDownloadStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={downloadEndDate}
              />
              <DatePicker
                label="End Date"
                value={downloadEndDate}
                onChange={(newValue) => setDownloadEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={downloadStartDate}
              />
            </LocalizationProvider>

            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={downloadFormat}
                label="Format"
                onChange={(e) => setDownloadFormat(e.target.value)}
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
                <MenuItem value="txt">Text</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleDownload}
              fullWidth
              disabled={
                (selectedBrand.length === 0 && (!downloadStartDate || !downloadEndDate)) ||
                isLoading
              }
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{ mt: 1 }}
            >
              {isLoading ? "Preparing Download..." : "Download"}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default OrderList;