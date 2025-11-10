import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  useMediaQuery,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  IconButton,
  Menu,
  Card,
  CardContent,
  Collapse,
  Avatar,
  Grid,
  FormControl,
  Chip,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Refresh from "@mui/icons-material/Refresh";
import Download from "@mui/icons-material/Download";
import PublishIcon from "@mui/icons-material/Publish";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import Visibility from "@mui/icons-material/Visibility";

import DottedCircleLoading from "../../Loading/DotLoading";
import FiltersUi from "./FiltersUi";
import soon from "../../assets/soon.png";
import ProductImport from "../Products/ProductImport";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MarketplaceOption from "./MarketplaceOption";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false); // Unused in this snippet
  const [updatedList, setUpdatedList] = useState([]); // Unused in this snippet's logic
  const [UpdatedBrandId, setUpdatedBrandList] = useState([]); // Unused in this snippet's logic
  const [selectedCategoryNames, setSelectedCategoryNames] = useState([]); // Unused in this snippet
  const [setCategoryFilterList, setsetCategoryFilterList] = useState([]); // Unused in this snippet
  const [currentColumn, setCurrentColumn] = useState(""); // Unused in this snippet
  const [anchorEl, setAnchorEl] = useState(null); // Unused in this snippet
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [brandFilterList, setBrandFilterList] = useState([]); // Unused in this snippet
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null); // Unused in this snippet
  const [categories, setCategories] = useState([ // Unused in this snippet
    "All",
    "Category 1",
    "Category 2",
  ]);

  const initialPage = parseInt(searchParams.get("page"), 10) || 1;
  const [page, setPage] = useState(initialPage);
  // initialRowsPerPage is already set by `rowsPerPage` state, no need for another initial value here
  // const initialRowsPerPage = parseInt(searchParams.get("rowsPerPage"), 10) || 50;

  let lastParamsRef = useRef("");

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    return storedCategory
      ? JSON.parse(storedCategory)
      : { id: "all", name: "All Channels" };
  });

  // Effect to set rowsPerPage from URL params on initial load
  useEffect(() => {
    const paramRowsPerPage = parseInt(searchParams.get("rowsPerPage"), 10);
    if (!isNaN(paramRowsPerPage) && paramRowsPerPage > 0) {
      setRowsPerPage(paramRowsPerPage);
    } else {
      // If no valid param, ensure default is set if not already
      setRowsPerPage(50);
    }
  }, [location.search, searchParams]);


  // Effect to ensure 'page' param exists in URL
  useEffect(() => {
    if (!searchParams.has("page")) {
      searchParams.set("page", "1");
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [location, navigate, searchParams]);


  // Effect to fetch products when dependencies change
  useEffect(() => {
    const currentParams = JSON.stringify({
      updatedList,
      UpdatedBrandId,
      page,
      rowsPerPage,
      sortConfig,
      selectedCategory,
      searchQuery,
    });

    // Only fetch if parameters have actually changed
    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchProducts();
    }
  }, [
    updatedList,
    UpdatedBrandId,
    page,
    rowsPerPage,
    sortConfig,
    selectedCategory,
    searchQuery,
  ]);

  // Effect to handle search query from location state (e.g., from another page's link)
  useEffect(() => {
    if (location.state && location.state.searchQuery) {
      setSearchTerm(location.state.searchQuery);
      setSearchQuery(location.state.searchQuery);
      // Clear location state after use to prevent re-applying on future navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);


  // Handler for opening product import modal
  const handleImportClick = () => {
    setImportOpen(true);
  };

  // Handlers for sorting menu (currently unused in UI snippet)
  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column);
  };
  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setPage(1);
    setAnchorEl(null);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };


  // Handler for closing product import modal
  const handleImportClose = () => {
    setImportOpen(false);
  };

  // Function to fetch product data from API
  const fetchProducts = async () => {
    if (isFetching) return;

    setLoading(true);
    setIsFetching(true);

    try {
      const userData = localStorage.getItem("user");
      let userIds = "";

      if (userData) {
        const data = JSON.parse(userData);
        userIds = data.id;
      }

      // Ensure valid rowsPerPage for API request
      const validRowsPerPage =
        rowsPerPage && rowsPerPage > 0 ? rowsPerPage : 50;
      const skip = (page - 1) * validRowsPerPage;

      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProductList/`, // Make sure REACT_APP_IP is correctly set in your .env
        {
          user_id: userIds,
          marketplace: selectedCategory?.id === "all" ? "all" : "",
          marketplace_id:
            selectedCategory?.id && selectedCategory.id !== "all"
              ? selectedCategory.id
              : "",
          category_name: updatedList, // Will be empty array if no filters selected
          brand_id_list: UpdatedBrandId, // Will be empty array if no filters selected
          search_query: searchQuery,
          sort_by: sortConfig.key,
          sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
          skip: skip >= 0 ? skip : 0, // Ensure skip is not negative
          limit: validRowsPerPage,
        }
      );

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.product_list)
      ) {
        const products = response.data.data.product_list.map((product) => ({
          productId: product.id,
          image: product.image_url || soon, // Use 'soon' placeholder if no image
          title: product.product_title || "N/A",
          sku: product.sku || "N/A",
          category: product.category || "N/A",
          marketplacelogo: product.marketplace_image_url || { // Placeholder for marketplace logo
            image_url: soon,
            name: "N/A",
          },
          quantity: product.quantity || 0,
          price: product.price ? `$${product.price}` : "$0.00",
        }));

        setProductData(products);
        setProductCount(response.data.data.total_count);
        setTotalPages(
          Math.ceil(response.data.data.total_count / validRowsPerPage)
        );
      } else {
        console.error("No valid products found in response:", response.data);
        setProductData([]);
        setProductCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
      setProductData([]);
      setProductCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Handler for changing rows per page
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = Number(e.target.value);
    setRowsPerPage(newRowsPerPage);
    // Reset to page 1 when changing rows per page
    navigate(`/Home/products?page=1&rowsPerPage=${newRowsPerPage}`);
    setPage(1);
  };

  // Handler for changing page
  const handlePageChange = (newPage) => {
    navigate(`/Home/products?page=${newPage}&rowsPerPage=${rowsPerPage}`);
    setPage(newPage);
  };

  // Handler for search input with debounce
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
      setPage(1); // Reset to page 1 on new search
    }, 500); // Debounce for 500ms
  };


  const handleAddFilterClick = () => {
    setFilterVisible(!filterVisible);
  };

  // Handler for resetting all filters and search
  const handleResetChange = () => {
    setSearchTerm("");
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setUpdatedBrandList([]); // Clears brand filters
    setUpdatedList([]); // Clears category filters
    setFilterVisible(false); // Closes filter UI if open

    localStorage.removeItem("marketplace");
    const resetCategory = { id: "all", name: "All Channels" };
    setSelectedCategory(resetCategory);
    localStorage.setItem("selectedCategory", JSON.stringify(resetCategory));

    setPage(1); // Reset to first page

    toast.success("Filters reset successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
    });
  };

  // Handlers for filter selections (currently unused by actual filter UI)
  const handleProduct = (category) => {
    localStorage.setItem("marketplace", JSON.stringify(category));
    setSelectedCategory(category);
    setPage(1);
  };
  const handleCategoryList = (catList) => {
    setsetCategoryFilterList(catList);
  };
  const handleBrandList = (brandList) => {
    setBrandFilterList(brandList);
  };
  const handleBrandChange = (val) => {
    const productList = val?.updatedList;
    if (!Array.isArray(productList)) {
      console.error("Error: Expected an array but received", productList);
      return;
    }
    const productTypeNames = productList.map((item) => item.name);
    setUpdatedList(productTypeNames);
    setPage(1);
  };
  const handleFilterBrand = (val) => {
    const productList = val?.updatedList;
    if (!Array.isArray(productList)) {
      console.error("Error: Expected an array but received", productList);
      return;
    }
    const productTypeId = productList.map((item) => item.id);
    setUpdatedBrandList(productTypeId);
    setPage(1);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        padding: "12px",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {/* TOP CONTROL BAR: Import, Export, Reset buttons (left) and Total Products count (right) */}
        

        {/* Search Input */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search Title | SKU | Product Type"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ marginBottom: "12px" }} // Added MUI styling for consistency
        />

        {/* All Channels Selector (only one select here now) */}
        {/* The rowsPerPage select has been moved to the bottom */}
       
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            justifyContent: "space-between", // Adjusted to space-between
            alignItems: "center",
            marginBottom: "12px", // Space below this row
            flexWrap: 'wrap', // Allow wrapping on smaller screens if necessary
          }}
        >
           <Select
          value={selectedCategory.id}
          onChange={(e) => {
            const newCat = { id: e.target.value, name: e.target.value };
            setSelectedCategory(newCat);
            localStorage.setItem("selectedCategory", JSON.stringify(newCat));
          }}
          displayEmpty
          inputProps={{ 'aria-label': 'Select channel' }}
          size="small" // Make it small like the TextField
          sx={{ flex: 1, minWidth: "120px" }}
        >
          <MenuItem value="all">All Channels</MenuItem>
          <MenuItem value="amazon">Amazon</MenuItem>
          <MenuItem value="ebay">eBay</MenuItem>
        </Select>
          <Stack direction="row" spacing={1}> {/* Stack for icon buttons */}
            <Tooltip title="Import Products">
              <Button
                variant="outlined"
                onClick={handleImportClick}
                size="small"
                sx={{
                  minWidth: '36px', // Fixed width for square button
                  width: '36px',
                  height: '36px',
                  padding: '0', // Remove internal padding to make icon fill
                  borderRadius: '6px', // Match image
                  borderColor: '#ddd', // Light border
                  color: 'rgba(0, 0, 0, 0.6)', // Dark icon color
                  backgroundColor: 'white', // Explicit white background
                  '&:hover': {
                    backgroundColor: '#f5f5f5', // Subtle hover effect
                    borderColor: '#bbb',
                  },
                  display: 'flex', // Ensure icon is centered
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PublishIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="Export Products">
              <Button
                variant="outlined"
                // Add your export handler here
                size="small"
                sx={{
                  minWidth: '36px',
                  width: '36px',
                  height: '36px',
                  padding: '0',
                  borderRadius: '6px',
                  borderColor: '#ddd',
                  color: 'rgba(0, 0, 0, 0.6)',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#bbb',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Download fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="Reset Filters">
              <Button
                variant="outlined"
                onClick={handleResetChange}
                size="small"
                sx={{
                  minWidth: '36px',
                  width: '36px',
                  height: '36px',
                  padding: '0',
                  borderRadius: '6px',
                  borderColor: '#ddd',
                  color: 'rgba(0, 0, 0, 0.6)',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#bbb',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Refresh fontSize="small" />
              </Button>
            </Tooltip>
          </Stack>
          <Typography
            variant="body2"
            sx={{ color: "#666", fontWeight: "500" }}
          >
            Total Products: {productCount}
          </Typography>
        </Box>
      </div>

      <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#999" }}
          >
            <DottedCircleLoading />
            <Typography variant="body1">Loading Products...</Typography>
          </div>
        ) : productData.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#999" }}
          >
            No Products Found
          </div>
        ) : (
          <div>
            <div
              style={{
                overflowX: "auto",
                marginBottom: "16px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Table
                sx={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "600px", // Ensure table is wide enough for columns
                  fontSize: "13px",
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#f5f5f5",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      Product
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      Category
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      Price
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productData.map((product) => (
                    <TableRow
                      key={product.productId}
                      sx={{
                        borderBottom: "1px solid #eee",
                        "&:hover": { backgroundColor: "#f9f9f9" },
                      }}
                    >
                      <TableCell
                        sx={{
                          padding: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <img
                          src={product.image || soon}
                          alt={product.title}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "4px",
                            objectFit: "cover",
                          }}
                        />
                        <Box sx={{ fontSize: "12px", flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "600",
                              color: "#000",
                              marginBottom: "2px",
                            }}
                          >
                            {product.sku}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#666",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "100px",
                              display: 'block'
                            }}
                          >
                            {product.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          padding: "12px",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        {product.category}
                      </TableCell>
                      <TableCell
                        sx={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                        }}
                      >
                        {product.quantity}
                      </TableCell>
                      <TableCell
                        sx={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#00a651",
                        }}
                      >
                        {product.price}
                      </TableCell>
                      <TableCell sx={{ padding: "12px", textAlign: "center" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            minWidth: '36px',
                            width: '36px',
                            height: '36px',
                            padding: '0',
                            borderRadius: '4px',
                            borderColor: '#ddd',
                            color: 'rgba(0, 0, 0, 0.6)',
                            backgroundColor: 'transparent',
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                              borderColor: '#bbb',
                            },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Bottom Controls: Rows per page (left) and Pagination (right) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between", // Adjusted to space-between
                alignItems: "center",
                gap: "8px",
                backgroundColor: "white",
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                flexWrap: 'wrap', // Allow wrapping on small screens
              }}
            >
              {/* Rows per page selector (left side) */}
              <Select
                value={rowsPerPage}
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                displayEmpty
                inputProps={{ 'aria-label': 'Rows per page' }}
                size="small"
                sx={{ minWidth: "100px" }}
              >
                <MenuItem value={25}>25/page</MenuItem>
                <MenuItem value={50}>50/page</MenuItem>
                <MenuItem value={75}>75/page</MenuItem>
                <MenuItem value={100}>100/page</MenuItem>
              </Select>

              {/* Pagination controls (right side) */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outlined"
                  size="small"
                >
                  ← Previous
                </Button>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  color="#333"
                >
                  Page {page} of {totalPages}
                </Typography>
                <Button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  variant="outlined"
                  size="small"
                >
                  Next →
                </Button>
              </Stack>
            </div>
          </div>
        )}
      </div>

      {/* Product Import Modal */}
      <ProductImport open={importOpen} onClose={handleImportClose} />
    </div>
  );
};

export default ProductTable;