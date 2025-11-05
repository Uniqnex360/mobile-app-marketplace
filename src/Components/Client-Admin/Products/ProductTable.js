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
  Drawer,
  Dialog,
  AppBar,
  Toolbar,
  Chip,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  SwipeableDrawer,
  useTheme,
  useScrollTrigger,
  Slide
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { Refresh, Download, Close, Menu as MenuIcon } from "@mui/icons-material";
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

// Hide app bar on scroll for mobile
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const ProductTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const searchParams = new URLSearchParams(location.search);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [updatedList, setUpdatedList] = useState([]);
  const [UpdatedBrandId, setUpdatedBrandList] = useState([]);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState([]);
  const [setCategoryFilterList, setsetCategoryFilterList] = useState([]);
  const [currentColumn, setCurrentColumn] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [brandFilterList, setBrandFilterList] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 20 : 50);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);

  const initialPage = parseInt(searchParams.get("page"), 10) || 1;
  const [page, setPage] = useState(initialPage);
  const initialRowsPerPage = parseInt(searchParams.get("rowsPerPage"), 10) || (isMobile ? 20 : 50);

  // Ref to store last API call parameters to prevent unnecessary fetches
  let lastParamsRef = useRef("");

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    return storedCategory
      ? JSON.parse(storedCategory)
      : { id: "all", name: "All Channels" };
  });

  // Effect to set initial rowsPerPage from URL on component mount
  useEffect(() => {
    setRowsPerPage(initialRowsPerPage);
  }, [location.search]);

  // Effect to ensure 'page' query parameter exists in URL
  useEffect(() => {
    if (!searchParams.has("page")) {
      searchParams.set("page", "1");
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [location, navigate, searchParams]);

  // Main effect to fetch products based on dependencies
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
  }, [
    updatedList,
    UpdatedBrandId,
    page,
    rowsPerPage,
    sortConfig,
    selectedCategory,
    searchQuery,
  ]);

  // Effect to set search term from location state (for navigation)
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

      const validRowsPerPage = rowsPerPage && rowsPerPage > 0 ? rowsPerPage : (isMobile ? 20 : 50);
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

  const handleChangePage = (event, newPage) => {
    navigate(`/Home/products?page=${newPage}&&rowsPerPage=${rowsPerPage}`);
    setPage(newPage);
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
    if (isMobile) {
      setMobileFilterOpen(true);
    } else {
      setFilterVisible(!filterVisible);
    }
  };

  const handleResetChange = () => {
    setSearchTerm("");
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setUpdatedBrandList([]);
    setUpdatedList([]);
    setFilterVisible(false);
    setMobileFilterOpen(false);

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
      pauseOnHover: true,
      draggable: true,
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
 const [categories, setCategories] = useState([
    "All",
    "Category 1",
    "Category 2",
  ]);
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

  const handleProductClick = (product) => {
    if (isMobile) {
      setSelectedProduct(product);
      setProductDetailOpen(true);
    } else {
      navigate(`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`);
    }
  };

  // Mobile Product Card Component
  const MobileProductCard = ({ product }) => (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        }
      }}
      onClick={() => handleProductClick(product)}
    >
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <img
              src={product.image}
              alt="Product"
              style={{
                width: '100%',
                height: 60,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {product.title}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              SKU: {product.sku}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Chip 
                label={product.category} 
                size="small" 
                variant="outlined"
                sx={{ maxWidth: 100 }}
              />
              <Typography variant="body2" fontWeight="bold">
                {product.price}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, alignItems: 'center' }}>
              <Typography variant="caption">
                Qty: {product.quantity}
              </Typography>
              <IconButton size="small" color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Mobile Product Detail Dialog
  const MobileProductDetail = () => (
    <Dialog
      fullScreen
      open={productDetailOpen}
      onClose={() => setProductDetailOpen(false)}
    >
      <AppBar position="sticky" color="default">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setProductDetailOpen(false)}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
            Product Details
          </Typography>
          <Button 
            autoFocus 
            color="inherit"
            component={Link}
            to={`/Home/products/details/${selectedProduct?.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
          >
            Edit
          </Button>
        </Toolbar>
      </AppBar>
      {selectedProduct && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img
              src={selectedProduct.image}
              alt="Product"
              style={{
                width: 200,
                height: 200,
                objectFit: 'cover',
                borderRadius: 12,
                margin: '0 auto',
              }}
            />
          </Box>
          
          <List>
            <ListItem>
              <ListItemText 
                primary="Title" 
                secondary={selectedProduct.title}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemText 
                primary="SKU" 
                secondary={selectedProduct.sku}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemText 
                primary="Category" 
                secondary={selectedProduct.category}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemText 
                primary="Quantity" 
                secondary={selectedProduct.quantity}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemText 
                primary="Price" 
                secondary={selectedProduct.price}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
          </List>
        </Box>
      )}
    </Dialog>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Mobile App Bar */}
      <HideOnScroll>
        <AppBar 
          position="sticky" 
          color="default" 
          elevation={1}
          sx={{ backgroundColor: 'white' }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Products ({productCount})
            </Typography>
            {!isMobile && (
              <Typography variant="body2" color="textSecondary">
                Total: {productCount}
              </Typography>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: isMobile ? 1 : 2 }}>
        {/* Search and Filter Bar */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: 2, 
          mb: 2,
          alignItems: isMobile ? "stretch" : "center"
        }}>
          {/* Marketplace Selector */}
          <Box sx={{ 
            width: isMobile ? "100%" : "auto",
            minWidth: isMobile ? "auto" : 200
          }}>
            <MarketplaceOption
              handleProduct={handleProduct}
              handleCategoryList={handleCategoryList}
              handleBrandList={handleBrandList}
              clearChannel={selectedCategory}
            />
          </Box>

          {/* Search Field */}
          <TextField
            size="small"
            placeholder="Search Title | SKU | Product Type"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              flex: 1,
              minWidth: isMobile ? "auto" : 300,
            }}
            fullWidth={isMobile}
          />

          {/* Action Buttons */}
          <Box sx={{ 
            display: "flex", 
            gap: 1,
            justifyContent: isMobile ? "space-between" : "flex-start"
          }}>
            <Tooltip title="Filter" arrow>
              <IconButton
                onClick={handleAddFilterClick}
                sx={{
                  backgroundColor: "#000080",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "darkblue",
                  },
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Import" arrow>
              <IconButton
                onClick={handleImportClick}
                sx={{
                  backgroundColor: "#000080",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "darkblue",
                  },
                }}
              >
                <PublishIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export" arrow>
              <IconButton
                sx={{
                  backgroundColor: "#000080",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "darkblue",
                  },
                }}
              >
                <Download />
              </IconButton>
            </Tooltip>

            <Tooltip title="Reset" arrow>
              <IconButton
                onClick={handleResetChange}
                sx={{
                  backgroundColor: "#000080",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "darkblue",
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ display: "flex", flex: 1, gap: 2 }}>
          {/* Filters Sidebar - Desktop */}
          {filterVisible && !isMobile && (
            <Box sx={{ width: 250, flexShrink: 0 }}>
              <FiltersUi
                categories={categories}
                setCategoryFilterList={setCategoryFilterList}
                onProductTypeChange={handleBrandChange}
                brandFilterList={brandFilterList}
                onBrandTypeChange={handleFilterBrand}
              />
            </Box>
          )}

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {loading && productData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <DottedCircleLoading />
              </Box>
            ) : isMobile ? (
              // Mobile View - Card List
              <Box>
                {productData.length > 0 ? (
                  productData.map((product) => (
                    <MobileProductCard key={product.productId} product={product} />
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No products found
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              // Desktop View - Table
              <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                <Table stickyHeader sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
                        <Typography variant="subtitle2" fontWeight="bold">Image</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
                        <Typography variant="subtitle2" fontWeight="bold">SKU</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Title
                          <IconButton onClick={(e) => handleOpenMenu(e, "product_title")}>
                            <MoreVertIcon sx={{ fontSize: "14px" }} />
                          </IconButton>
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Category
                          <IconButton onClick={(e) => handleOpenMenu(e, "category")}>
                            <MoreVertIcon sx={{ fontSize: "14px" }} />
                          </IconButton>
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
                        <Typography variant="subtitle2" fontWeight="bold">Channel</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Quantity
                          <IconButton onClick={(e) => handleOpenMenu(e, "quantity")}>
                            <MoreVertIcon sx={{ fontSize: "14px" }} />
                          </IconButton>
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Price
                          <IconButton onClick={(e) => handleOpenMenu(e, "price")}>
                            <MoreVertIcon sx={{ fontSize: "14px" }} />
                          </IconButton>
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
                        <Typography variant="subtitle2" fontWeight="bold">Action</Typography>
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
                        <TableCell sx={{ textAlign: "center" }}>
                          <Link
                            to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                            style={{ color: "#121212", textDecoration: "none" }}
                          >
                            {product.sku || "N/A"}
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
                        <TableCell sx={{ textAlign: "center" }}>
                          {product.category || "N/A"}
                        </TableCell>
                        <TableCell align="center" sx={{ width: "100px", padding: "8px" }}>
                          <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" gap={1}>
                            {product.marketplacelogo && product.marketplacelogo.length > 0 ? (
                              product.marketplacelogo.map((imageUrl, imgIndex) => (
                                <Box
                                  key={imgIndex}
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                    backgroundColor: "#fff",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Marketplace Logo ${imgIndex}`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                </Box>
                              ))
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                N/A
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {product.quantity || 0}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {product.price || "$0.00"}
                        </TableCell>
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
            )}

            {/* Pagination */}
            {productData.length > 0 && (
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                mt: 2,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 2 : 0
              }}>
                <Select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={20}>20/page</MenuItem>
                  <MenuItem value={50}>50/page</MenuItem>
                  <MenuItem value={75}>75/page</MenuItem>
                  <MenuItem value={100}>100/page</MenuItem>
                </Select>

                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  siblingCount={isMobile ? 0 : 1}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Mobile Filter Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        onOpen={() => setMobileFilterOpen(true)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setMobileFilterOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <FiltersUi
            categories={categories}
            setCategoryFilterList={setCategoryFilterList}
            onProductTypeChange={handleBrandChange}
            brandFilterList={brandFilterList}
            onBrandTypeChange={handleFilterBrand}
          />
        </Box>
      </SwipeableDrawer>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Menu
          </Typography>
          {/* Add mobile menu items here */}
        </Box>
      </Drawer>

      {/* Sorting Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {currentColumn === "product_title" && (
          <>
            <MenuItem onClick={() => handleSelectSort("product_title", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("product_title", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}
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
        {currentColumn === "category" && (
          <>
            <MenuItem onClick={() => handleSelectSort("category", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("category", "desc")}>
              Sort Z-A
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

      {/* Mobile Product Detail Dialog */}
      <MobileProductDetail />

      {/* Product Import Dialog */}
      <ProductImport open={importOpen} onClose={handleImportClose} />
    </Box>
  );
};

export default ProductTable;