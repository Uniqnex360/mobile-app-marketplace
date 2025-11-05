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
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { Refresh, Download } from "@mui/icons-material";
import PublishIcon from "@mui/icons-material/Publish";
import DottedCircleLoading from "../../Loading/DotLoading";
import FiltersUi from "./FiltersUi";
import soon from "../../assets/soon.png";
import ProductImport from "../Products/ProductImport";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MarketplaceOption from "./MarketplaceOption";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductTable = () => {
  const location = useNavigate();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const locationObj = useLocation();

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [updatedList, setUpdatedList] = useState([]);
  const [UpdatedBrandId, setUpdatedBrandList] = useState([]);
  const [currentColumn, setCurrentColumn] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [brandFilterList, setBrandFilterList] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [productData, setProductData] = useState([]); // ✅ Always an array
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const initialPage = parseInt(searchParams.get("page"), 10) || 1;
  const [page, setPage] = useState(initialPage);
  const initialRowsPerPage = parseInt(searchParams.get("rowsPerPage"), 10) || 50;

  const lastParamsRef = useRef("");

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const stored = localStorage.getItem("selectedCategory");
    return stored ? JSON.parse(stored) : { id: "all", name: "All Channels" };
  });

  // Safe array utility
  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

  // Safe object utility
  const safeObject = (obj) => (obj && typeof obj === "object" ? obj : {});

  // Safe string utility
  const safeString = (str) => (typeof str === "string" ? str : "");

  useEffect(() => {
    setRowsPerPage(initialRowsPerPage);
  }, [locationObj.search]);

  useEffect(() => {
    if (!searchParams.has("page")) {
      searchParams.set("page", "1");
      navigate(`${locationObj.pathname}?${searchParams.toString()}`, { replace: true });
    }
  }, [locationObj, navigate, searchParams]);

  // Main effect to fetch products
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

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchProducts();
    }
  }, [updatedList, UpdatedBrandId, page, rowsPerPage, sortConfig, selectedCategory, searchQuery]);

  useEffect(() => {
    if (locationObj.state?.searchQuery) {
      setSearchTerm(locationObj.state.searchQuery);
      setSearchQuery(locationObj.state.searchQuery);
    }
  }, [locationObj.state]);

  const handleImportClick = () => setImportOpen(true);
  const handleImportClose = () => setImportOpen(false);

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

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    navigate(`/Home/products?page=1&rowsPerPage=${newRowsPerPage}`);
    setPage(1);
  };

  const handlePageChange = (e, value) => {
    navigate(`/Home/products?page=${value}&rowsPerPage=${rowsPerPage}`);
    setPage(value);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (e.target.timeout) clearTimeout(e.target.timeout);
    e.target.timeout = setTimeout(() => {
      setSearchQuery(value);
      setPage(1);
    }, 500);
  };

  const handleAddFilterClick = () => setFilterVisible(!filterVisible);

  const handleResetChange = () => {
    setSearchTerm("");
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setUpdatedList([]);
    setUpdatedBrandList([]);
    setFilterVisible(false);
    setSelectedCategory({ id: "all", name: "All Channels" });
    localStorage.setItem("selectedCategory", JSON.stringify({ id: "all", name: "All Channels" }));
    setPage(1);
    toast.success("Filters reset successfully!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleProduct = (category) => {
    localStorage.setItem("selectedCategory", JSON.stringify(category));
    setSelectedCategory(category);
    setPage(1);
  };

  const handleBrandChange = (val) => {
    const productList = safeArray(val?.updatedList);
    setUpdatedList(productList.map(item => safeString(item.name)));
    setPage(1);
  };

  const handleFilterBrand = (val) => {
    const productList = safeArray(val?.updatedList);
    setUpdatedBrandList(productList.map(item => item.id || ""));
    setPage(1);
  };

  // 🔐 SAFE: Fixed fetchProducts() with data normalization
  const fetchProducts = async () => {
    if (isFetching) return;
    setLoading(true);
    setIsFetching(true);

    try {
      // Get user ID safely
      const userData = localStorage.getItem("user");
      const userIds = userData ? (JSON.parse(userData)?.id || "") : "";

      const validRowsPerPage = rowsPerPage > 0 ? rowsPerPage : 50;
      const skip = (page - 1) * validRowsPerPage;

      // 🔐 SAFE: Validate payload
      const payload = {
        user_id: userIds,
        marketplace: selectedCategory?.id === "all" ? "all" : "",
        marketplace_id: selectedCategory?.id && selectedCategory.id !== "all" ? selectedCategory.id : "",
        category_name: safeArray(updatedList),
        brand_id_list: safeArray(UpdatedBrandId),
        search_query: safeString(searchQuery),
        sort_by: sortConfig.key,
        sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
        skip,
        limit: validRowsPerPage,
      };

      // 🔐 SAFE: Validate API response
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProductList/`,
        payload
      );

      // 🔐 SAFE: Normalize response data
      if (
        !response?.data?.data?.product_list ||
        !Array.isArray(response.data.data.product_list)
      ) {
        setProductData([]);
        setProductCount(0);
        setTotalPages(1);
        setLoading(false);
        setIsFetching(false);
        return;
      }

      // 🔐 SAFE: Normalize product data (critical fix for the error)
      const normalizedProducts = response.data.data.product_list.map(product => ({
        productId: product.id || "",
        image: product.image_url || soon,
        title: safeString(product.product_title),
        sku: safeString(product.sku),
        category: safeString(product.category),
        // 🔐 CRITICAL FIX: Normalize to array
        marketplacelogo: safeArray(product.marketplace_image_url),
        quantity: typeof product.quantity === "number" ? product.quantity : 0,
        price: typeof product.price === "number"
          ? `$${product.price.toFixed(2)}`
          : "$0.00",
      }));

      setProductData(normalizedProducts);
      setProductCount(response.data.data.total_count || 0);
      setTotalPages(Math.ceil((response.data.data.total_count || 0) / validRowsPerPage));
    } catch (error) {
      console.error("API Error:", error);
      setProductData([]);
      setProductCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // 🔐 SAFE: Fixed render (safeArray checks)
  return (
    <Box sx={{ width: "100%", mt: "40px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, position: "sticky", top: 0, bgcolor: "white", zIndex: 100 }}>
        <MarketplaceOption
          handleProduct={handleProduct}
          handleBrandChange={handleBrandChange}
          handleFilterBrand={handleFilterBrand}
          clearChannel={selectedCategory}
          sx={{ flex: 1 }}
        />

        <TextField
          placeholder="Search Title | SKU | Product Type"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          sx={{ flex: 2 }}
        />

        <Tooltip title="Filter">
          <IconButton onClick={handleAddFilterClick}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Import">
          <IconButton onClick={handleImportClick}>
            <PublishIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export">
          <IconButton>
            <Download />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset">
          <IconButton onClick={handleResetChange}>
            <Refresh />
          </IconButton>
        </Tooltip>

        <Typography variant="body2" sx={{ alignSelf: "center" }}>
          Total: {productCount}
        </Typography>
      </Box>

      {/* Filter Drawer */}
      {filterVisible && (
        <Box sx={{ width: 280, position: "absolute", left: 0, zIndex: 101, bgcolor: "white", p: 2, boxShadow: 2 }}>
          <FiltersUi
            onProductTypeChange={handleBrandChange}
            onBrandTypeChange={handleFilterBrand}
            brandFilterList={brandFilterList}
          />
        </Box>
      )}

      {/* Main Table */}
      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <DottedCircleLoading />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  productData.map((product) => (
                    <TableRow key={product.productId} hover>
                      <TableCell>
                        <Link to={`/Home/products/details/${product.productId}?page=${page}&rowsPerPage=${rowsPerPage}`}>
                          <img
                            src={product.image}
                            alt="Product"
                            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                          />
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Link to={`/Home/products/details/${product.productId}?page=${page}&rowsPerPage=${rowsPerPage}`}>
                          {product.sku}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Link to={`/Home/products/details/${product.productId}?page=${page}&rowsPerPage=${rowsPerPage}`}>
                          {product.title}
                        </Link>
                      </TableCell>

                      <TableCell>{product.category}</TableCell>

                      {/* 🔐 SAFE: Fixed Channel Column */}
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {product.marketplacelogo.length > 0 ? (
                            safeArray(product.marketplacelogo).map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt="Channel"
                                style={{ width: 20, height: 20, objectFit: "contain" }}
                              />
                            ))
                          ) : (
                            <Typography variant="caption">N/A</Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>{product.quantity}</TableCell>

                      <TableCell>{product.price}</TableCell>

                      <TableCell>
                        <Link to={`/Home/products/details/${product.productId}?page=${page}&rowsPerPage=${rowsPerPage}`}>
                          <EditIcon sx={{ color: "#000080" }} />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          size="small"
        >
          <MenuItem value={50}>50/page</MenuItem>
          <MenuItem value={75}>75/page</MenuItem>
          <MenuItem value={100}>100/page</MenuItem>
        </Select>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Sorting Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {currentColumn === "title" && (
          <>
            <MenuItem onClick={() => handleSelectSort("product_title", "asc")}>Sort A-Z</MenuItem>
            <MenuItem onClick={() => handleSelectSort("product_title", "desc")}>Sort Z-A</MenuItem>
          </>
        )}
        {currentColumn === "quantity" && (
          <>
            <MenuItem onClick={() => handleSelectSort("quantity", "asc")}>Sort Low to High</MenuItem>
            <MenuItem onClick={() => handleSelectSort("quantity", "desc")}>Sort High to Low</MenuItem>
          </>
        )}
        {currentColumn === "price" && (
          <>
            <MenuItem onClick={() => handleSelectSort("price", "asc")}>Sort Low to High</MenuItem>
            <MenuItem onClick={() => handleSelectSort("price", "desc")}>Sort High to Low</MenuItem>
          </>
        )}
      </Menu>

      {/* Import Dialog */}
      <ProductImport open={importOpen} onClose={handleImportClose} />
    </Box>
  );
};

export default ProductTable;