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
  const [filterVisible, setFilterVisible] = useState(false);
  const [updatedList, setUpdatedList] = useState([]);
  const [UpdatedBrandId, setUpdatedBrandList] = useState([]);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState([]);
  const [setCategoryFilterList, setsetCategoryFilterList] = useState([]);
  const [currentColumn, setCurrentColumn] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [brandFilterList, setBrandFilterList] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [categories, setCategories] = useState(["All", "Category 1", "Category 2"]);

  const initialPage = parseInt(searchParams.get("page"), 10) || 1;
  const [page, setPage] = useState(initialPage);
  const initialRowsPerPage = parseInt(searchParams.get("rowsPerPage"), 10) || 50;

  let lastParamsRef = useRef("");

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    return storedCategory
      ? JSON.parse(storedCategory)
      : { id: "all", name: "All Channels" };
  });

  useEffect(() => {
    setRowsPerPage(initialRowsPerPage);
  }, [location.search]);

  useEffect(() => {
    if (!searchParams.has("page")) {
      searchParams.set("page", "1");
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [location, navigate, searchParams]);

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
    if (location.state && location.state.searchQuery) {
      setSearchTerm(location.state.searchQuery);
      setSearchQuery(location.state.searchQuery);
    }
  }, [location.state]);

  const handleImportClick = () => {
    setImportOpen(true);
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

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleImportClose = () => {
    setImportOpen(false);
  };

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

      const validRowsPerPage = rowsPerPage && rowsPerPage > 0 ? rowsPerPage : 50;
      const skip = (page - 1) * validRowsPerPage;

      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProductList/`,
        {
          user_id: userIds,
          marketplace: selectedCategory?.id === "all" ? "all" : "",
          marketplace_id:
            selectedCategory?.id && selectedCategory.id !== "all"
              ? selectedCategory.id
              : "",
          category_name: updatedList,
          brand_id_list: UpdatedBrandId,
          search_query: searchQuery,
          sort_by: sortConfig.key,
          sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
          skip: skip >= 0 ? skip : 0,
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
          image: product.image_url || soon,
          title: product.product_title || "N/A",
          sku: product.sku || "N/A",
          category: product.category || "N/A",
          marketplacelogo: product.marketplace_image_url || {
            image_url: soon,
            name: "N/A",
          },
          quantity: product.quantity || 0,
          price: product.price ? `$${product.price}` : "$0.00",
        }));

        setProductData(products);
        setProductCount(response.data.data.total_count);
        setTotalPages(Math.ceil(response.data.data.total_count / validRowsPerPage));
      } else {
        console.error("No valid products found in response:", response.data);
        setProductData([]);
        setProductCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = e.target.value;
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
    if (e.target.timeout) {
      clearTimeout(e.target.timeout);
    }
    e.target.timeout = setTimeout(() => {
      setSearchQuery(value);
      setPage(1);
    }, 500);
  };

  const handleAddFilterClick = () => {
    setFilterVisible(!filterVisible);
  };

  const handleResetChange = () => {
    setSearchTerm("");
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setUpdatedBrandList([]);
    setUpdatedList([]);
    setFilterVisible(false);

    localStorage.removeItem("marketplace");
    const resetCategory = { id: "all", name: "All Channels" };
    setSelectedCategory(resetCategory);
    localStorage.setItem("selectedCategory", JSON.stringify(resetCategory));

    setPage(1);

    toast.success("Filters reset successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
    });
  };

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

  // 📱 Mobile: Render product as expandable card
  const renderMobileProductCard = (product, index) => {
    return (
      <Card key={product.productId} sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent
          sx={{ p: 2, "&:last-child": { pb: 2 }, cursor: "pointer" }}
          onClick={() => setExpandedProduct(expandedProduct === index ? null : index)}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {product.sku}
            </Typography>
            <IconButton size="small">
              {expandedProduct === index ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Avatar
              src={product.image}
              alt="Product"
              variant="rounded"
              sx={{ width: 60, height: 60, mr: 2 }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {product.title}
            </Typography>
          </Box>

          <Collapse in={expandedProduct === index}>
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #eee" }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body2">{product.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body2">{product.quantity}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="body2">{product.price}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Channel
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {product.marketplacelogo && product.marketplacelogo.length > 0 ? (
                      product.marketplacelogo.map((imageUrl, imgIndex) => (
                        <Avatar
                          key={imgIndex}
                          src={imageUrl}
                          variant="rounded"
                          sx={{ width: 24, height: 24 }}
                        />
                      ))
                    ) : (
                      <Typography variant="caption">N/A</Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    component={Link}
                    to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    fullWidth
                    sx={{ textTransform: "none" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit Product
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
        border: "1px solid #ddd",
        overflow: "auto",
        "&::-webkit-scrollbar": {
          height: "4px",
          width: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "10px",
        },
      }}
    >
      <Table stickyHeader sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Image
              </Typography>
            </TableCell>
            <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6", minWidth: 60 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                SKU
              </Typography>
            </TableCell>
            <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6", minWidth: 210 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Title
                <IconButton onClick={(e) => handleOpenMenu(e, "product_title")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </Typography>
            </TableCell>
            <TableCell sx={{ textAlign: "center", minWidth: 120, backgroundColor: "#f6f6f6" }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Category
                <IconButton onClick={(e) => handleOpenMenu(e, "category")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </Typography>
            </TableCell>
            <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Channel
              </Typography>
            </TableCell>
            <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6", minWidth: 90 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Quantity
                <IconButton onClick={(e) => handleOpenMenu(e, "quantity")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </Typography>
            </TableCell>
            <TableCell sx={{ textAlign: "center", minWidth: 70, backgroundColor: "#f6f6f6" }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Price
                <IconButton onClick={(e) => handleOpenMenu(e, "price")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </Typography>
            </TableCell>
            <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Action
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productData.map((product) => (
            <TableRow key={product.productId} hover>
              <TableCell sx={{ textAlign: "center" }}>
                <Link
                  to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                  style={{ textDecoration: "none" }}
                >
                  <img
                    src={product.image}
                    alt="Product"
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: "cover",
                      borderRadius: 5,
                    }}
                  />
                </Link>
              </TableCell>
              <TableCell sx={{ textAlign: "center", wordBreak: "break-word" }}>
                <Link
                  to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                  style={{ color: "#121212", textDecoration: "none" }}
                >
                  {product.sku}
                </Link>
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                <Link
                  to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                  style={{ textDecoration: "none", color: "black" }}
                >
                  {product.title}
                </Link>
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>{product.category}</TableCell>
              <TableCell align="center">
                <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1}>
                  {product.marketplacelogo && product.marketplacelogo.length > 0 ? (
                    product.marketplacelogo.map((imageUrl, imgIndex) => (
                      <Box
                        key={imgIndex}
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: "4px",
                          overflow: "hidden",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={`Marketplace ${imgIndex}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="caption">N/A</Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>{product.quantity}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>{product.price}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                <Link
                  to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                  style={{ textDecoration: "none" }}
                >
                  <IconButton color="primary">
                    <EditIcon sx={{ color: "#000080" }} />
                  </IconButton>
                </Link>
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
        <Grid container spacing={2} alignItems="center">
          {/* Mobile: Stack vertically */}
          <Grid item xs={12} sm={6} md={3}>
            <MarketplaceOption
              handleProduct={handleProduct}
              handleCategoryList={handleCategoryList}
              handleBrandList={handleBrandList}
              clearChannel={selectedCategory}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              size="small"
              placeholder="Search Title | SKU | Product Type"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              sx={{ "& input": { fontSize: "14px" } }}
            />
          </Grid>

          <Grid item xs={12} sm="auto">
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1,alignItems:'center'}}>
              <Tooltip title="Filter" arrow>
                <Button
                  variant="contained"
                  onClick={handleAddFilterClick}
                  sx={{
                    bgcolor: "#000080",
                    minWidth: "auto",
                    p: 1,
                    "&:hover": { bgcolor: "darkblue" },
                  }}
                >
                  <FilterListIcon sx={{ fontSize: "20px" }} />
                </Button>
              </Tooltip>

              <Tooltip title="Import" arrow>
                <Button
                  variant="contained"
                  onClick={handleImportClick}
                  sx={{
                    bgcolor: "#000080",
                    minWidth: "auto",
                    p: 1,
                    "&:hover": { bgcolor: "darkblue" },
                  }}
                >
                  <PublishIcon sx={{ fontSize: "20px" }} />
                </Button>
              </Tooltip>

              <Tooltip title="Export" arrow>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#000080",
                    minWidth: "auto",
                    p: 1,
                    "&:hover": { bgcolor: "darkblue" },
                  }}
                >
                  <Download sx={{ fontSize: "20px" }} />
                </Button>
              </Tooltip>

              <Tooltip title="Reset" arrow>
                <Button
                  variant="contained"
                  onClick={handleResetChange}
                  sx={{
                    bgcolor: "#000080",
                    minWidth: "auto",
                    p: 1,
                    "&:hover": { bgcolor: "darkblue" },
                  }}
                >
                  <Refresh sx={{ fontSize: "20px" }} />
                </Button>
              </Tooltip>
            </Stack>
          </Grid>

          <Grid item xs={12} sm="auto">
            <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>
              Total Products: {productCount || "0"}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Filters Sidebar (Desktop only) */}
      {filterVisible && !isMobile && (
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ width: "215px"}}>
            <FiltersUi
              categories={categories}
              setCategoryFilterList={setCategoryFilterList}
              onProductTypeChange={handleBrandChange}
              brandFilterList={brandFilterList}
              onBrandTypeChange={handleFilterBrand}
            />
          </Box>
        </Box>
      )}

      {/* 📦 Product List */}
      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <DottedCircleLoading />
          </Box>
        ) : productData.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 4 }}>
            No Products Found
          </Typography>
        ) : isMobile ? (
          // 📱 Mobile: Cards
          productData.map((product, index) => renderMobileProductCard(product, index))
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
          <Select value={rowsPerPage} onChange={handleRowsPerPageChange} sx={{ minWidth: 100 }}>
            <MenuItem value={50}>50/page</MenuItem>
            <MenuItem value={75}>75/page</MenuItem>
            <MenuItem value={100}>100/page</MenuItem>
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
        {currentColumn === "product_title" && (
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
        {currentColumn === "category" && (
          <>
            <MenuItem onClick={() => handleSelectSort("category", "asc")}>Sort A-Z</MenuItem>
            <MenuItem onClick={() => handleSelectSort("category", "desc")}>Sort Z-A</MenuItem>
          </>
        )}
        {currentColumn === "price" && (
          <>
            <MenuItem onClick={() => handleSelectSort("price", "asc")}>Sort Low to High</MenuItem>
            <MenuItem onClick={() => handleSelectSort("price", "desc")}>Sort High to Low</MenuItem>
          </>
        )}
      </Menu>

      {/* Product Import Dialog */}
      <ProductImport open={importOpen} onClose={handleImportClose} />
    </Box>
  );
};

export default ProductTable;