import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Pagination,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Tooltip as MuiTooltip,
  Tab,
  Tabs,
  Chip,
  Badge,
  Popover,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import MyProductTable from "./MyProductTable"; 
import SettingsIcon from "@mui/icons-material/Settings"; 
import ProductExport from "./ProductExport"; 
import FilterParentSku from "./FilterParentSku";
import DottedCircleLoading from "../../../../Loading/DotLoading";
import SkeletonTableMyProduct from "./MyProductLoading";
import Modal from "@mui/material/Modal"; 
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";

const allColumns = [
  "Products",
  "Category & Subcategory BSR",
  "Stock",
  "Price",
  "Sales Today",
  "Refunds (Units)",
  "Refunds($)",
  "Gross Revenue",
  "Net Profit",
  "Refund Rate",
  "Units Sold",
  "Profit Margin",
  "Amazon Fees",
  
  "COGS",
  "Listings",
  "Fulfilment status",
];
const productPerformanceColumns = [
  "Products",
  "Gross Revenue",
  "Refund Rate",
  "Stock",
  "Sales Today",
  "Units Sold",
  "Refunds (Units)",
  "Refunds($)",
  "Net Profit",
  "Profit Margin",
  "Amazon Fees",
  
  "COGS",
  "Unit Session %",
];
const Keywords = ["Products", "Category & Subcategory BSR"];
const Listing = [
  "Products",
  "Category & Subcategory BSR",
  "Stock",
  
  
];
const Advertising = [
  "Products",
  
  
  
  
  
  
  
  
  
];
const Refund = [
  "Products",
  "Profit Margin",
  "Units Sold",
  "Refunds(Units)",
  "Refunds($)",
  "Refund Rate",
];
const imageSizes = ["Small", "Medium", "Large", "Extra Large"];
const additionalInfo = ["ASIN Details"];

const NumberIndicator = ({ value, change }) => (
  <Box>
    <Typography
      sx={{
        fontSize: "14px",
        color: "#1A2027",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
    {change !== undefined && (
      <Box
        display="flex"
        alignItems="center"
        sx={{ color: change >= 0 ? "#1A9E77" : "#E34750", fontSize: "12px" }}
      >
        {change >= 0 ? <ArrowDropUp /> : <ArrowDropDown />}
        {Math.abs(change)}
      </Box>
    )}
  </Box>
);

const MyProductList = ({
  country,
  widgetData,
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImageSize, setSelectedImageSize] = useState("Medium");
  const [selectedColumns, setSelectedColumns] = useState([
    ...allColumns,
    ...additionalInfo,
  ]);
  const [selectAll, setSelectAll] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.id || "";
  const [visibleColumns, setVisibleColumns] = useState(allColumns); 
  const [activeColumnCategoryTab, setActiveColumnCategoryTab] = useState(0); 
  const [tab, setTab] = React.useState(0); 
  const [expandedRows, setExpandedRows] = useState({}); 
  const queryParams = new URLSearchParams(window.location.search);
  localStorage.removeItem("selectedCategory"); 
  const [searchQuery, setSearchQuery] = useState("");
  const initialPage = parseInt(queryParams.get("page"), 10) || 1;
  const [loadingTime, setLoadingTime] = useState(0);
  const loadingIntervalRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, []);
  
  const startLoadingTimer = () => {
    setLoadingTime(0);
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
    }
    loadingIntervalRef.current = setInterval(() => {
      setLoadingTime((prev) => prev + 1);
    }, 1000);
  };
  
  const stopLoadingTimer = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  };
  
  const [page, setPage] = useState(initialPage); 
  const [showSearch, setShowSearch] = useState(false); 
  let lastParamsRef = useRef(""); 
  const controllerRef = useRef(null);
  const [sortValues, setSortValues] = useState({
    sortBy: null,
    sortByValue: null,
  }); 
  const [TabType, setTabType] = useState(); 
  const [filterParent, setFilterParent] = useState(); 
  const [filterSku, setFilterSku] = useState(); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterParentFilter, setfilterParentFilter] = useState("");
  const [asinFilter, setAsinFilter] = useState("");
  
  const [parentAsin, setParentAsin] = useState("");
  const [skuAsin, setSkuAsin] = useState("");
  const [isCustomizedPage, setIsCustomizedPage] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const initialRowsPerPage = parseInt(queryParams.get("rowsPerPage"), 10) || 50; 
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage); 
  
  const handlePopoverClose = () => {
    setAnchorEl(null);
    setIsFilterOpen(false); 
  };
  
  useEffect(() => {
    const currentParentTrimmed = (parentAsin || "").trim();
    const currentSkuTrimmed = (skuAsin || "").trim();
    const appliedParentTrimmed = (filterParent || "").trim();
    const appliedSkuTrimmed = (filterSku || "").trim();
    if (TabType === "sku") {
      setHasChanges(
        currentParentTrimmed !== appliedParentTrimmed ||
          currentSkuTrimmed !== appliedSkuTrimmed
      );
    } else {
      setHasChanges(currentParentTrimmed !== appliedParentTrimmed);
    }
  }, [parentAsin, skuAsin, TabType, filterParent, filterSku]);
  
  const handleClear = () => {
    setParentAsin(""); 
    setSkuAsin(""); 
  };
  
  const closeCustomModal = () => {
    setIsCustomizedPage(false);
  };
  
  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns([
        ...getColumnSet(activeColumnCategoryTab, tab === 0),
        ...additionalInfo,
      ]);
    }
    setSelectAll(!selectAll);
  };
  
  const handleCheckboxChange = (column) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };
  
  const handleFilterClick = (event) => {
    setParentAsin(filterParent);
    setSkuAsin(filterSku);
    setAnchorEl(event.currentTarget);
    setIsFilterOpen(true);
    setPage(1);
    setRowsPerPage(10);
  };
  
  const handleCustomizedPage = (event, value) => {
    setIsCustomizedPage(true);
  };
  
  const handleApplyFilter = (newFilterValues = {}, closePopover = true) => {
    const finalParentAsin =
      newFilterValues.parentAsin !== undefined
        ? newFilterValues.parentAsin
        : parentAsin;
    const finalSkuAsin =
      newFilterValues.skuAsin !== undefined ? newFilterValues.skuAsin : skuAsin;
    
    setFilterParent(finalParentAsin.trim());
    setFilterSku(finalSkuAsin.trim());
    
    localStorage.setItem("filterParent", finalParentAsin.trim());
    localStorage.setItem("filterSku", finalSkuAsin.trim());
    
    if (closePopover) {
      handlePopoverClose();
    }
    console.log("Applied Filters:", {
      parentAsin: finalParentAsin.trim(),
      skuAsin: finalSkuAsin.trim(),
    });
  };
  
  const getFilterCount = () => {
    let count = 0;
    if (filterParent?.trim()) count++;
    if (filterSku?.trim()) count++;
    return count;
  };
  
  const handleClearFilter = () => {
    setFilterParent("");
    setFilterSku("");
    setParentAsin("");
    setSkuAsin("");
    localStorage.removeItem("filterParent");
    localStorage.removeItem("filterSku");
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      setPage(1);
      setRowsPerPage(10);
    }
  };
  
  const handleColumnCategoryClick = (index) => {
    setActiveColumnCategoryTab(index);
    console.log("Column category changed to:", index);
  };
  
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
    navigate(`/Home?page=${page}&&rowsPerPage=${e.target.value}`);
    setPage(1); 
  };
  
  const getColumnSet = (columnCategoryIndex, isParentTab) => {
    let columns;
    switch (columnCategoryIndex) {
      case 0: 
        columns = [...allColumns];
        break;
      case 1: 
        columns = [...productPerformanceColumns];
        break;
      case 2: 
        columns = [...Keywords];
        break;
      case 3: 
        columns = [...Listing];
        break;
      case 4: 
        columns = [...Advertising];
        break;
      case 5: 
        columns = [...Refund];
        break;
      default:
        columns = [...allColumns];
    }
    let finalColumns = [...columns];
    
    if (isParentTab) {
      if (finalColumns.includes("Price")) {
        finalColumns = finalColumns.filter((col) => col !== "Price");
      }
      
      if (allColumns.includes("Price") && !finalColumns.includes("Price")) {
        const stockIndex = finalColumns.indexOf("Stock");
        if (stockIndex !== -1) {
          finalColumns.splice(stockIndex + 1, 0, "Price");
        } else {
          finalColumns.push("Price");
        }
      }
    } else {
      if (!finalColumns.includes("Price")) {
        const stockIndex = finalColumns.indexOf("Stock");
        if (stockIndex !== -1) {
          finalColumns.splice(stockIndex + 1, 0, "Price");
        } else {
          finalColumns.push("Price");
        }
      }
    }
    
    if (isParentTab) {
      finalColumns = finalColumns.filter((col) => col !== "Price");
    }
    
    if (columnCategoryIndex === 0 || columnCategoryIndex === 3) {
      if (isParentTab) {
        if (!finalColumns.includes("current price Range")) {
          finalColumns.push("current price Range");
        }
        finalColumns = finalColumns.filter(
          (col) => !["ListingScore", "Fulfilment status"].includes(col)
        );
      } else {
        if (!finalColumns.includes("Listings")) {
          finalColumns.push("Listings");
        }
        if (!finalColumns.includes("Fulfilment status")) {
          finalColumns.push("Fulfilment status");
        }
        finalColumns = finalColumns.filter(
          (col) => col !== "current price Range"
        );
      }
    } else {
      finalColumns = finalColumns.filter(
        (col) =>
          ![
            "ListingScore",
            "Fulfilment status",
            "current price Range",
          ].includes(col)
      );
    }
    return finalColumns;
  };
  
  const handleSortChange = (sortInfo) => {
    console.log("Sort info received in parent:", sortInfo);
    setSortValues(sortInfo);
  };
  
  const handleChangeParentSkuTab = (event, newValue) => {
    setTab(newValue);
    setPage(1); 
    setRowsPerPage(10);
    if (newValue === 0) {
      console.log("anywhere ", newValue);
      setFilterSku("");
    }
    
    setActiveColumnCategoryTab(0);
  };

  useEffect(() => {
    const columns = getColumnSet(activeColumnCategoryTab, tab === 0);
    setVisibleColumns(columns);
    setSelectedColumns(columns);
  }, [activeColumnCategoryTab, tab, filterParent, filterSku]);
  
  useEffect(() => {
    setVisibleColumns(selectedColumns);
  }, [selectedColumns]);
  
  useEffect(() => {
    const currentParams = JSON.stringify({
      marketPlaceId,
      widgetData,
      rowsPerPage,
      searchQuery,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
      DateStartDate,
      DateEndDate,
      tab,
      activeColumnCategoryTab,
      sortValues,
      filterParent,
      country,
      filterSku,
    });
    
    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchMyProducts(1); 
    }
  }, [
    marketPlaceId,
    widgetData,
    rowsPerPage,
    searchQuery,
    brand_id,
    JSON.stringify(product_id),
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
    tab,
    activeColumnCategoryTab,
    sortValues,
    filterParent,
    filterSku,
    country
  ]);
  
  const fetchMyProducts = async (currentPage) => {
    setLoading(true);
    startLoadingTimer();
    try {
      const calculatedPageForBackend = (currentPage - 1) * rowsPerPage + 1;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      
      controllerRef.current = new AbortController();
      const response = await axios.post(
        `${process.env.REACT_APP_IP}get_products_with_pagination/`,
        {
          country:country,
          parent: tab === 0, 
          preset: widgetData,
          marketplace_id: marketPlaceId.id,
          user_id: userId,
          search_query: searchQuery,
          page: calculatedPageForBackend, 
          page_size: rowsPerPage,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          sort_by: sortValues.sortBy,
          sort_by_value: sortValues.sortByValue,
          parent_search: filterParent ? filterParent : "",
          sku_search: filterSku ? filterSku : "",
          signal: controllerRef.current.signal,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      );
      const responseData = response.data;
      if (responseData && responseData.products) {
        const normalizedProducts = responseData.products.map((product) => {
          setTabType(response.data.tab_type); 
          return {
            ...product,
            
            grossRevenue:
              product.grossRevenue !== undefined ? product.grossRevenue : "N/A",
            grossRevenueforPeriod:
              product.grossRevenueforPeriod !== undefined
                ? product.grossRevenueforPeriod
                : "N/A",
            netProfit:
              product.netProfit !== undefined ? product.netProfit : "N/A",
            netProfitforPeriod:
              product.netProfitforPeriod !== undefined
                ? product.netProfitforPeriod
                : "N/A",
            subcategoriesBsr:
              product.category !== undefined ? product.category : "N/A",
            reviewRating:
              product.reviewRating !== undefined ? product.reviewRating : "N/A",
            priceDraft: product.price !== undefined ? product.price : "N/A",
            refunds: product.refunds !== undefined ? product.refunds : "N/A",
            refundsforPeriod:
              product.refundsforPeriod !== undefined
                ? product.refundsforPeriod
                : "N/A",
            refundsAmount:
              product.refundsAmount !== undefined
                ? product.refundsAmount
                : "N/A",
            refundsAmountforPeriod:
              product.refundsAmountforPeriod !== undefined
                ? product.refundsAmountforPeriod
                : "N/A",
            pageViews:
              product.pageViews !== undefined ? product.pageViews : "N/A",
            pageViewsPercentage:
              product.pageViewsPercentage !== undefined
                ? product.pageViewsPercentage
                : "N/A",
            trafficSessions:
              product.trafficSessions !== undefined
                ? product.trafficSessions
                : "N/A",
            conversionRate:
              product.conversionRate !== undefined
                ? product.conversionRate
                : "N/A",
            margin: product.margin !== undefined ? product.margin : "N/A",
            marginforPeriod:
              product.marginforPeriod !== undefined
                ? product.marginforPeriod
                : "N/A",
            totalAmazonFees:
              product.totalchannelFees !== undefined
                ? product.totalchannelFees
                : "N/A",
            roi: product.roi !== undefined ? product.roi : "N/A",
            cogs: product.cogs !== undefined ? product.cogs : "N/A",
            buyBoxWinnerId:
              product.buyBoxWinnerId !== undefined
                ? product.buyBoxWinnerId
                : "N/A",
            salesForToday:
              product.salesForToday !== undefined
                ? product.salesForToday
                : "N/A",
            salesForTodayPeriod:
              product.salesForTodayPeriod !== undefined
                ? product.salesForTodayPeriod
                : "N/A",
            unitsSoldForPeriod:
              product.unitsSoldForPeriod !== undefined
                ? product.unitsSoldForPeriod
                : "N/A",
            unitsSoldForToday:
              product.unitsSoldForToday !== undefined
                ? product.unitsSoldForToday
                : "N/A",
            inventoryStatus:
              product.inventoryStatus !== undefined
                ? product.inventoryStatus
                : "N/A",
            tags: product.tags !== undefined ? product.tags : [],
            refundRate:
              product.refundRate !== undefined ? product.refundRate : "0",
            imageUrl: product.imageUrl,
            title: product.title,
            asin: product?.product_id,
            sku: product?.parent_sku,
            stock: product.stock,
            price: product.price,
            price_start: product.price_start,
            price_end: product.price_end,
            totalStock: product.totalStock,
            skuInfo: product.skus
              ? product.skus.map((sku) => ({
                  label: sku.sku,
                  warning: sku.isLowStock,
                }))
              : [],
            listings: product.listings,
            listingScore: product.listingScore,
            fulfillmentChannel: product.fulfillmentChannel,
            fulfillmentStatus: product.fulfillmentStatus,
            currentPriceRange: product.currentPriceRange,
          };
        });
        setProducts(normalizedProducts);
        setTotalProducts(responseData.total_products);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
      stopLoadingTimer();
    }
  };

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: "1px solid #ccc",
        width: isMobile ? "100%" : "98%",
        padding: isSmallMobile ? "2px" : "4px",
        overflowX: "auto",
        minHeight: "400px",
      }}
    >
      <Box
        display="flex"
        sx={{ 
          borderBottom: "1px solid #ddd", 
          padding: isSmallMobile ? "2px" : "4px",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 1 : 0
        }}
        alignItems={isMobile ? "flex-start" : "center"}
        mb={2}
      >
        <Box display="flex" alignItems="center" sx={{ width: isMobile ? "100%" : "auto" }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              fontWeight: 600,
              fontSize: isMobile ? "18px" : "20px",
              color: "#1A2027",
              whiteSpace: "nowrap",
            }}
          >
            My Products
          </Typography>
          <Box
            sx={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              backgroundColor: "#dce3ec",
              borderRadius: "20px",
              px: "4px",
              py: "2px",
              marginLeft: "10px",
              width: "fit-content",
              mb: 1.5,
            }}
          >
            <Tabs
              value={tab}
              onChange={handleChangeParentSkuTab}
              variant="standard"
              sx={{
                height: "28px",
                minHeight: "26px",
                "& .MuiTabs-flexContainer": {
                  minHeight: "26px",
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              {["Parent", "SKU"].map((label, index) => (
                <Tab
                  key={label}
                  label={
                    <Typography
                      fontSize={isMobile ? "12px" : "14px"}
                      sx={{
                        height: "20px",
                        fontFamily:
                          "'Nunito Sans', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                      }}
                      fontWeight={tab === index ? 600 : 400}
                    >
                      {label}
                    </Typography>
                  }
                  sx={{
                    marginTop: "2px",
                    minHeight: "22px",
                    height: "22px",
                    minWidth: isMobile ? "40px" : "50px",
                    px: 1,
                    mx: 0.3,
                    textTransform: "none",
                    borderRadius: "14px",
                    fontSize: "12px",
                    color: "#2b2f3c",
                    backgroundColor: tab === index ? "#ffffff" : "transparent",
                    "&.Mui-selected": {
                      color: "#000",
                    },
                    "&:hover": {
                      backgroundColor: tab === index ? "#ffffff" : "#cbd8e6",
                    },
                    "&:active": {
                      backgroundColor: "#b4c9df",
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>
        </Box>

        {/* Search and Filter Section - Mobile optimized */}
        <Box 
          display="flex" 
          alignItems="center" 
          gap={1}
          sx={{ 
            width: isMobile ? "100%" : "auto",
            justifyContent: isMobile ? "space-between" : "flex-start",
            mt: isMobile ? 1 : 0
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: isMobile ? "14px" : "16px",
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              color: "#485E75",
              whiteSpace: "nowrap",
            }}
          >
            {totalProducts} {TabType === "sku" ? "SKUs" : "Parent ASINs"}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {/* Filter Button */}
            <Badge
              badgeContent={getFilterCount()}
              color="primary"
              invisible={getFilterCount() === 0}
            >
              <Button
                variant="outlined"
                startIcon={<FilterAltIcon />}
                onClick={handleFilterClick}
                sx={{
                  backgroundColor: "rgba(10,111,232,0.1)",
                  color: "rgb(10, 111, 232)",
                  fontWeight: 700,
                  borderRadius: "12px",
                  padding: "4px 12px",
                  textTransform: "capitalize",
                  fontSize: isMobile ? "12px" : "14px",
                  minWidth: "auto",
                }}
              >
                {isSmallMobile ? "" : "Filter"}
              </Button>
            </Badge>

            {/* Search */}
            <Box sx={{ marginLeft: "5px" }}>
              {!showSearch ? (
                <IconButton onClick={() => setShowSearch(true)} sx={{ p: 0.5 }}>
                  <SearchIcon sx={{ color: "#485E75", fontSize: isMobile ? "20px" : "24px" }} />
                </IconButton>
              ) : (
                <TextField
                  value={searchQuery}
                  onChange={handleSearchChange}
                  variant="outlined"
                  size="small"
                  placeholder="Search..."
                  autoFocus
                  sx={{
                    width: isMobile ? 150 : 190,
                    "& .MuiInputBase-root": {
                      height: 32, 
                      fontSize: "13px",
                    },
                    "& input": {
                      padding: "6px 8px", 
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton
                          onClick={() => setShowSearch(false)}
                          size="small"
                          sx={{ p: 0.5 }}
                        >
                          <SearchIcon
                            sx={{ color: "#485E75", fontSize: "18px" }}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Column Tabs - Mobile optimized with horizontal scroll */}
      <Box 
        sx={{ 
          overflowX: "auto",
          whiteSpace: "nowrap",
          mb: 2,
          "&::-webkit-scrollbar": {
            height: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: "2px",
          },
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          gap={0.5}
          sx={{ 
            pb: 1,
            minWidth: isMobile ? "600px" : "auto"
          }}
        >
          <Button
            variant={activeColumnCategoryTab === 0 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textTransform: "none",
              fontSize: isMobile ? "11px" : "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 0 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 0 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 0 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
              minWidth: isMobile ? "80px" : "auto",
            }}
            onClick={() => handleColumnCategoryClick(0)}
          >
            All Columns
          </Button>
          <Button
            variant={activeColumnCategoryTab === 1 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textTransform: "none",
              fontSize: isMobile ? "11px" : "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 1 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 1 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 1 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
              minWidth: isMobile ? "120px" : "auto",
            }}
            onClick={() => handleColumnCategoryClick(1)}
          >
            Product Performance
          </Button>
          <Button
            variant={activeColumnCategoryTab === 2 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textTransform: "none",
              fontSize: isMobile ? "11px" : "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 2 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 2 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 2 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
              minWidth: isMobile ? "70px" : "auto",
            }}
            onClick={() => handleColumnCategoryClick(2)}
          >
            Keywords
          </Button>
          <Button
            variant={activeColumnCategoryTab === 3 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textTransform: "none",
              fontSize: isMobile ? "11px" : "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 3 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 3 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 3 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
              minWidth: isMobile ? "60px" : "auto",
            }}
            onClick={() => handleColumnCategoryClick(3)}
          >
            Listing
          </Button>
          <Button
            variant={activeColumnCategoryTab === 4 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textTransform: "none",
              fontSize: isMobile ? "11px" : "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 4 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 4 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 4 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
              minWidth: isMobile ? "80px" : "auto",
            }}
            onClick={() => handleColumnCategoryClick(4)}
          >
            Advertising
          </Button>
          <Button
            variant={activeColumnCategoryTab === 5 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textTransform: "none",
              fontSize: isMobile ? "11px" : "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 5 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 5 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 5 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
              minWidth: isMobile ? "70px" : "auto",
            }}
            onClick={() => handleColumnCategoryClick(5)}
          >
            Refunds
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textTransform: "none",
              fontSize: isMobile ? "11px" : "12px",
              color: "#485E75",
              borderRadius: "8px",
              minWidth: isMobile ? "auto" : "auto",
            }}
            onClick={() => {
              handleCustomizedPage();
            }}
          >
            {isSmallMobile ? "" : "Customize"}
          </Button>
          
          {!showSearch && (
            <Box>
              <ProductExport products={products} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Filter Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          '& .MuiPopover-paper': {
            width: isMobile ? "90vw" : "400px",
            maxWidth: "400px",
          }
        }}
      >
        <Box p={2} display="flex" flexDirection="column" gap={1}>
          <TextField
            label="Parent SKU"
            size="small"
            fullWidth
            value={parentAsin}
            onChange={(e) => setParentAsin(e.target.value)}
          />
          {TabType === "sku" && (
            <TextField
              label="Child SKU"
              size="small"
              fullWidth
              value={skuAsin}
              onChange={(e) => setSkuAsin(e.target.value)}
            />
          )}
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClear}
              sx={{
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "capitalize",
                color: hasChanges
                  ? "rgb(10, 111, 232)"
                  : "rgba(0, 0, 0, 0.26)",
                borderColor: hasChanges
                  ? "rgb(10, 111, 232)"
                  : "rgba(0, 0, 0, 0.12)",
                "&:hover": {
                  borderColor: hasChanges
                    ? "rgb(2, 83, 182)"
                    : "rgba(0, 0, 0, 0.12)",
                  color: hasChanges
                    ? "rgb(2, 83, 182)"
                    : "rgba(0, 0, 0, 0.26)",
                },
              }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                handleApplyFilter({ parentAsin, skuAsin }, true)
              }
              disabled={!hasChanges}
              sx={{
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontSize: "14px",
                textTransform: "capitalize",
                color: "white",
                backgroundColor: hasChanges
                  ? "rgb(10, 111, 232)"
                  : "rgba(0, 0, 0, 0.12)",
                "&:hover": {
                  backgroundColor: hasChanges
                    ? "rgb(2, 83, 182)"
                    : "rgba(0, 0, 0, 0.12)",
                  color: "white",
                },
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Filter Chips and Export */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        sx={{ 
          paddingBottom: "5px", 
          gap: 1,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center"
        }}
      >
        {/* Left - Filter Chips */}
        <Box 
          display="flex" 
          gap={1} 
          flexWrap="wrap" 
          sx={{ 
            marginTop: "7px",
            maxWidth: isMobile ? "100%" : "70%",
            overflowX: isMobile ? "auto" : "visible"
          }}
        >
          {filterParent && (
            <Chip
              label={`Parent SKU: ${filterParent}`}
              onDelete={() =>
                handleApplyFilter({ parentAsin: "", skuAsin: filterSku }, false)
              }
              deleteIcon={<CloseIcon sx={{ color: "#fff" }} />}
              size="small"
              sx={{
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontSize: "12px",
                backgroundColor: "#000",
                color: "#fff",
                ".MuiChip-deleteIcon": { color: "#fff" },
              }}
            />
          )}
          {filterSku && (
            <Chip
              label={`Child SKU: ${filterSku}`}
              onDelete={() =>
                handleApplyFilter(
                  { parentAsin: filterParent, skuAsin: "" },
                  false
                )
              }
              deleteIcon={<CloseIcon sx={{ color: "#fff" }} />}
              size="small"
              sx={{
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontSize: "12px",
                backgroundColor: "#000",
                color: "#fff",
                ".MuiChip-deleteIcon": { color: "#fff" },
              }}
            />
          )}
          {(filterParent || filterSku) && (
            <Button
              size="small"
              onClick={handleClearFilter}
              sx={{
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                textTransform: "none",
                fontSize: "14px",
                color: "rgb(10, 111, 232)",
                borderRadius: "8px",
                fontWeight: 700,
                "&:hover": {
                  color: "rgb(15, 93, 188)",
                },
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
        
        {/* Right - Export Button */}
        {showSearch && (
          <Box sx={{ 
            mt: isMobile ? 1 : 0,
            alignSelf: isMobile ? "flex-end" : "auto"
          }}>
            <ProductExport products={products} />
          </Box>
        )}
      </Box>

      {/* Table Container with Horizontal Scroll */}
      <Box 
        sx={{ 
          minHeight: 200, 
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: "4px",
          },
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              width: "100%",
              minWidth: isMobile ? "800px" : "100%",
              gap: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "4px",
              p: 3,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Loading spinner */}
            <Box sx={{ mb: 2 }}>
              <DottedCircleLoading size={40} />
            </Box>
            {/* Main loading message */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: "#1A2027",
                mb: 1,
                fontSize: isMobile ? "16px" : "20px",
                textAlign: "center"
              }}  
            >
              Fetching Data, Please wait a moment...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ minWidth: isMobile ? "800px" : "100%" }}>
            <MyProductTable
              products={products}
              visibleColumns={visibleColumns}
              onSort={handleSortChange}
              isParentType={TabType}
              imageSize={selectedImageSize}
              country={country}
            />
          </Box>
        )}
      </Box>

      {/* Pagination - Mobile optimized */}
      <Box
        display="flex"
        alignItems="center"
        mt={2}
        sx={{ 
          borderTop: "1px solid #eee", 
          pt: 1,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0
        }}
      >
        {/* Centered Pagination */}
        <Box sx={{ 
          flexGrow: 1, 
          display: "flex", 
          justifyContent: "center",
          order: isMobile ? 2 : 1
        }}>
          <Pagination
            count={Math.ceil(totalProducts / rowsPerPage)}
            page={page}
            onChange={(event, newPage) => {
              setPage(newPage);
              navigate(`/Home?page=${newPage}&&rowsPerPage=${rowsPerPage}`);
              fetchMyProducts(newPage);
            }}
            size="small"
            color="primary"
            siblingCount={isMobile ? 0 : 1}
            boundaryCount={isMobile ? 1 : 1}
          />
        </Box>
        
        {/* Right-aligned Rows Per Page Select */}
        <Select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          size="small"
          sx={{ 
            minWidth: isMobile ? "100%" : 100, 
            ml: isMobile ? 0 : "auto",
            order: isMobile ? 1 : 2
          }}
        >
          <MenuItem value={10}>10 / page</MenuItem>
          <MenuItem value={25}>25 / page</MenuItem>
          <MenuItem value={50}>50 / page</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default MyProductList;