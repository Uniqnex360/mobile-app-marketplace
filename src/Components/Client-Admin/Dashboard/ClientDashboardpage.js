import React, { useState, useEffect, useRef, useCallback, useMemo, startTransition } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Tooltip,
  Select,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  Collapse,
  Autocomplete,
  Chip,
} from "@mui/material";
import axios from "axios";
import ImageIcon from "@mui/icons-material/Image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import IconButton from "@mui/material/IconButton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Refresh } from "@mui/icons-material";
import TotalOrdersGraph from "./TotalSalesGraph";
import LastOrders from "./LastOrder/LastOrders";
import TopProducts from "../Dashboard/TopProducts/TopProducts";
import InsightCategory from "./Helium10/InsightCategory";
import PeriodComparission from "./PeriodCompare/PeriodComparission";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import TestCard from "./Helium10/TestCard";
import MetricCard from "./CardComparission/MetricCard";
import AllMarketplace from "./AllMarketplace/AllMarketplace";
import ProfitAndLoss from "./ProfitAndLoss/ProfitAndLoss";
import MyProductList from "./MyProducts/ProductsLoading/MyProductList";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CompareChart from "./Revenue/DataChangeRevenue";
import BrandSelector from "../../../utils/BrandSelector";
import { fetchMarketplaceList } from "../../../utils/marketplace";
import { useMarketplace } from "../../../utils/MarketplaceProvider";
import ProductPerformanceContainer from "../../../utils/SalesTrends";
import { useEnhancedCategories } from "../../../utils/UseEnhancedCategories";
import CountrySelector from "../../../utils/countrySelector";
import { useNavigate } from "react-router-dom";
import DashboardFilters from "./DashboardFilters";
function ClientDashboardpage() {
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All Channels",
  });
  const {
    categories,
    loading: marketplaceLoading,
    selectedCountry,
    setSelectedCountry,
  } = useMarketplace();
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [filter, setFilter] = useState("all");
  const [filterFinal, setFilterFinal] = useState({
    id: "all",
    name: "All Channels",
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const userData = localStorage.getItem("user");
  const [tab, setTab] = React.useState(0);
  const [activeFilters, setActiveFilters] = useState([]);
  const [startDateHelium, setStartDateHelium] = useState(
    dayjs().subtract(7, "day")
  );
  const [endDateHelium, setEndDateHelium] = useState(dayjs());
  localStorage.removeItem("selectedCategory");
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [manufacturerList, setManufacturerList] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);
  const [selectedManufacturerFilter, setSelectedManufacturerFilter] = useState(
    []
  );
  const [skuList, setSkuList] = useState([]);
  const [selectedSku, setSelectedSku] = useState([]);
  const [asinList, setAsinList] = useState([]);
  const [selectedAsin, setSelectedAsin] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState([]);
  const [brandLimit, setBrandLimit] = useState(1);
  const [skuLimit, setSkuLimit] = useState(1);
  const [befePreset, setBefePreset] = useState("Today");
  const [inputValueManufactuer, setInputValueManufactuer] = useState("");
  const [inputValueSku, setInputValueSku] = useState("");
  const [inputValueBrand, setInputValueBrand] = useState("");
  const [inputValueAsin, setInputValueAsin] = useState("");
  const [selectedFulfillment, setselectFulfillment] = useState("");
  const brand_id = selectedBrand.map((item) => item.id);
  const [mergedProducts, setMergedProducts] = useState([]);
  const [mergedProductsFilter, setMergedProductsFilter] = useState([]);
  const [resetCounter, setResetCounter] = useState(0);
  let productuniqueById = [];
  const navigate = useNavigate  ();
  const [isTyping, setIsTyping] = useState(false);
  const lastFilterParamsRef = useRef("");
  const lastInputRef = useRef("");
  const lastCategoryIdRef = useRef(null);
  const lastParamsRef = useRef("");
  let userIds = "";
  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
  const presets = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "Last 7 days",
    "Last 14 days",
    "Last 30 days",
    "Last 60 days",
    "Last 90 days",
    "This Month",
    "Last Month",
    "This Quarter",
    "Last Quarter",
    "This Year",
    "Last Year",
  ];
  const getPresetDisplayLabel = (preset) => {
    if (preset === "Today") {
      return "September 1";
    }
    return preset;
  };
  const datePickerSx = useMemo(() => ({
    width: "100%",
    "& .MuiInputBase-root": {
      height: 40,
    },
    "& .MuiInputLabel-root": { 
      fontSize: "16px" 
    },
  }), []);
  const setSelectedBrandImmediate=(brands)=>{
    setSelectedBrand(brands)
    setSelectedBrandFilter(brands.map(b=>b.id))
  }
  const handleStartDateChangeOptimized = useCallback((newValue) => {
    setStartDate(newValue);
    if (endDate && newValue && newValue.isAfter(endDate)) {
      setEndDate(null);
    }
  }, [endDate]);
  const handleEndDateChangeOptimized = useCallback((newValue) => {
    setEndDate(newValue);
  }, []);
  useEffect(() => {
    if (!startDate || !endDate) return;
    const timer = setTimeout(() => {
      startTransition(() => {
        const formattedStart = startDate.format('YYYY-MM-DD');
        const formattedEnd = endDate.format('YYYY-MM-DD');
        setAppliedStartDate(formattedStart);
        setAppliedEndDate(formattedEnd);
        setAppliedStartDateHelium(startDate);
        setAppliedEndDateHelium(endDate);
        setAppliedPreset('');
        setActiveFilters(prev => {
          const filtered = prev.filter(f => f.type !== 'date' && f.type !== 'preset');
          const dateLabel = `${startDate.format("MMM D, YYYY")} - ${endDate.format("MMM D, YYYY")}`;
          return [...filtered, { type: 'date', value: 'customDate', label: dateLabel }];
        });
        setIsFiltering(true);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [startDate, endDate]);
  const continents = ["US", "UK"];
  const [value, setValue] = useState([dayjs().subtract(6, "day"), dayjs()]);
  const [selectedPreset, setSelectedPreset] = useState("Today");
  const [hasMore, setHasMore] = React.useState(true);
  const handleChange = (newValue) => {
    setValue(newValue);
  };
  const handleCountySelect = (country) => {
    setSelectedCountry(country);
    updateActiveFilters("country", country, country, true);
  };
  const handlePresetSelectHelium = (preset) => {
    setSelectedPreset(preset);
    updateActiveFilters("date", "customDate", "", false);
    updateActiveFilters("preset", preset, preset, true);
    if (befePreset && befePreset !== preset) {
      updateActiveFilters("preset", befePreset, befePreset, false);
    }
    localStorage.removeItem("selectedStartDate");
    localStorage.removeItem("selectedEndDate");
    const today = dayjs();
    let start, end;
    switch (preset) {
      case "Today":
        start = today;
        end = today;
        break;
      case "Yesterday":
        start = today.subtract(1, "day");
        end = today.subtract(1, "day");
        break;
      case "This Week":
        start = today.startOf("week");
        end = today.endOf("week");
        break;
      case "Last Week":
        start = today.subtract(1, "week").startOf("week");
        end = today.subtract(1, "week").endOf("week");
        break;
      case "Last 7 days":
        start = today.subtract(6, "day");
        end = today;
        break;
      case "Last 14 days":
        start = today.subtract(13, "day");
        end = today;
        break;
      case "Last 30 days":
        start = today.subtract(29, "day");
        end = today;
        break;
      case "Last 60 days":
        start = today.subtract(59, "day");
        end = today;
        break;
      case "Last 90 days":
        start = today.subtract(89, "day");
        end = today;
        break;
      case "This Month":
        start = today.startOf("month");
        end = today.endOf("month");
        break;
      case "Last Month":
        start = today.subtract(1, "month").startOf("month");
        end = today.subtract(1, "month").endOf("month");
        break;
      case "This Quarter":
        start = today.startOf("quarter");
        end = today.endOf("quarter");
        break;
      case "Last Quarter":
        start = today.subtract(1, "quarter").startOf("quarter");
        end = today.subtract(1, "quarter").endOf("quarter");
        break;
      case "This Year":
        start = today.startOf("year");
        end = today.endOf("year");
        break;
      case "Last Year":
        start = today.subtract(1, "year").startOf("year");
        end = today.subtract(1, "year").endOf("year");
        break;
      case "":
        return;
      default:
        return;
    }
    setStartDateHelium(start);
    setEndDateHelium(end);
  };
  useEffect(() => {
    if (startDate || endDate) {
      setBefePreset("");
      setSelectedPreset("");
    }
  }, [startDate, endDate]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedManufacturerFilter(selectedManufacturer);
      setMergedProductsFilter(mergedProducts);
      setSelectedBrandFilter(brand_id);
      setIsFiltering(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedManufacturer, mergedProducts, brand_id]);
  useEffect(() => {
    if (befePreset || selectedPreset) {
      setStartDate(null);
      setEndDate(null);
    }
  }, [befePreset, selectedPreset]);
  const enhancedCategories = useEnhancedCategories(categories);
  useEffect(() => {
    if (!marketplaceLoading && enhancedCategories.length > 0) {
      setSelectedCategory({ id: "all", name: "All Channels" });
    }
  }, [enhancedCategories, marketplaceLoading]);
  const handleRemoveFilter = (filter) => {
    updateActiveFilters(filter.type, filter.value, filter.label, false);
    switch (filter.type) {
      case "brand":
        setSelectedBrand((prev) => prev.filter((b) => b.id !== filter.value));
        break;
      case "sku":
        setSelectedSku((prev) => prev.filter((s) => s.id !== filter.value));
        break;
      case "manufacturer":
        setSelectedManufacturer((prev) =>
          prev.filter((m) => m.id !== filter.value)
        );
        break;
      case "asin":
        setSelectedAsin((prev) => prev.filter((a) => a.id !== filter.value));
        break;
      case "channel":
        if (filter.value === selectedCategory.id) {
          setSelectedCategory({ id: "all", name: "All Channels" });
        }
        break;
      case "country":
        setSelectedCountry("");
        break;
      case "preset":
        setSelectedPreset("Today");
        setBefePreset("Today");
        break;
      case "date":
        setStartDate(null);
        setEndDate(null);
        setAppliedEndDate(null);
        setAppliedStartDate(null);
        break;
      default:
        break;
    }
  };
  const updateActiveFilters = (type, value, label, isAdd = true) => {
    setActiveFilters((prevFilters) => {
      if (isAdd) {
        const exists = prevFilters.some(
          (filter) => filter.value === value && filter.type === type
        );
        if (!exists) {
          return [...prevFilters, { type, value, label }];
        }
        return prevFilters;
      } else {
        return prevFilters.filter(
          (filter) => !(filter.value === value && filter.type === type)
        );
      }
    });
  };
  const fetchAsinList = async (search = "") => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getproductIdlist/`,
        {
          country: selectedCountry,
          marketplace_id: selectedCategory?.id,
          search_query: search,
          user_id: userIds,
          brand_id,
          sku_ids: selectedSku.map((s) => s.id),
          manufacturer_name: selectedManufacturer,
        }
      );
      const items = response.data.data || [];
      setAsinList(items);
    } catch (error) {
      console.error("Error fetching ASIN list:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const trimmedInput = inputValueAsin.trim();
    const currentFilterParams = JSON.stringify({
      category_id: selectedCategory?.id,
      brand: selectedBrand,
      manufacturer: selectedManufacturer,
      sku: selectedSku,
    });
    let debounceTimer;
    if (trimmedInput !== lastInputRef.current) {
      debounceTimer = setTimeout(() => {
        lastInputRef.current = trimmedInput;
        fetchAsinList(trimmedInput);
      }, 300);
    }
    if (
      (selectedCategory?.id || selectedBrand || selectedManufacturer) &&
      currentFilterParams !== lastFilterParamsRef.current
    ) {
      lastFilterParamsRef.current = currentFilterParams;
      fetchAsinList("");
    }
    return () => clearTimeout(debounceTimer);
  }, [
    selectedCategory,
    selectedBrand,
    selectedManufacturer,
    inputValueAsin,
    selectedSku,
    selectedAsin,
  ]);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBrandList(inputValueBrand.trim() || "");
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [
    brandLimit,
    selectedCategory?.id,
    userIds,
    selectedAsin,
    selectedSku,
    inputValueBrand,
  ]);
  const fetchBrandList = async (search = "") => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}getBrandListforfilter/`,
        {
          params: {
            country: selectedCountry,
            marketplace_id: selectedCategory?.id,
            search_query: search,
            user_id: userIds,
            asin_ids: selectedAsin.map((a) => a.id),
            sku_ids: selectedSku.map((s) => s.id),
            limit: brandLimit,
          },
        }
      );
      const names = response.data.data.brand_list || [];
      setBrandList(names);
      setHasMore(names.length >= brandLimit);
    } catch (error) {
      console.error("Error fetching brand list:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchSkuList = async (searchText = "") => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getSKUlist/`,
        {
          country: selectedCountry,
          marketplace_id: selectedCategory?.id,
          search_query: searchText,
          user_id: userIds,
          brand_id,
          asin_ids: selectedAsin.map((a) => a.id),
          manufacturer_name: selectedManufacturer,
        }
      );
      const names = response.data.data || [];
      setSkuList(names);
    } catch (error) {
      console.error("Error fetching SKU list:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const currentParams = JSON.stringify({
      category_id: selectedCategory?.id,
      brand: selectedBrand,
      manufacturer: selectedManufacturer,
      sku: selectedSku,
      asin: selectedAsin,
    });
    if (
      (selectedCategory?.id ||
        selectedBrand ||
        selectedManufacturer ||
        selectedAsin) &&
      currentParams !== lastParamsRef.current
    ) {
      lastParamsRef.current = currentParams;
      fetchSkuList("");
    }
  }, [
    selectedCategory,
    selectedBrand,
    selectedManufacturer,
    userIds,
    selectedAsin,
  ]);
  useEffect(() => {
    if (!inputValueSku.trim()) return;
    const delayDebounce = setTimeout(() => {
      fetchSkuList(inputValueSku);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [inputValueSku]);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setExpandedCategories({});
  };
  const toggleExpandCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };
  const handleCategorySelect = (category) => {
    if (category.id === selectedCategory.id) return;
    if (selectedCategory.id !== "all") {
      updateActiveFilters(
        "channel",
        selectedCategory.id,
        selectedCategory.name,
        false
      );
    }
    setSelectedCategory(category);
    setFilterFinal(category); 
    setIsFiltering(true); 
    if (category.id !== "all") {
      updateActiveFilters("channel", category.id, category.name, true);
    }
    handleMenuClose();
  };
  const [appliedStartDateHelium, setAppliedStartDateHelium] = useState(
    dayjs().subtract(7, "day")
  );
  const [appliedEndDateHelium, setAppliedEndDateHelium] = useState(dayjs());
  const [appliedPreset, setAppliedPreset] = useState("Today");
  const handleFulfillmentSelect = (category, fulfillment) => {
    const { label, value } = fulfillment;
    setselectFulfillment(value);
    setSelectedCategory({ ...category, fulfillment: label });
    setFilterFinal({ ...category, fulfillment: label });
    setIsFiltering(true);
    handleMenuClose();
  };
  const toggleSelection = (option) => {
    const isSelected = selectedBrand.some((b) => b.id === option.id);
    if (isSelected) {
      setSelectedBrand(selectedBrand.filter((b) => b.id !== option.id));
      updateActiveFilters("brand", option.id, option.name, false);
    } else {
      setSelectedBrand([...selectedBrand, option]);
      updateActiveFilters("brand", option.id, option.name, true);
    }
  };
  const handleRemoveSKU = (id) => {
    setSelectedSku((prev) => {
      const updated = prev.filter((sku) => sku.id !== id);
      updateMergedProducts(selectedAsin, updated);
      return updated;
    });
  };
  const toggleSelectionSKU = (sku) => {
    const isSelected = selectedSku.some((s) => s.id === sku.id);
    if (isSelected) {
      setSelectedSku((prev) => {
        const updated = prev.filter((s) => s.id !== sku.id);
        updateMergedProducts(selectedAsin, updated);
        return updated;
      });
      updateActiveFilters("sku", sku.id, sku.sku, false);
    } else {
      setSelectedSku((prev) => {
        const updated = [...prev, sku];
        updateMergedProducts(selectedAsin, updated);
        return updated;
      });
      updateActiveFilters("sku", sku.id, sku.sku, true);
    }
  };
  const handleRemoveAsin = (id) => {
    setSelectedAsin((prev) => {
      const updated = prev.filter((asin) => asin.id !== id);
      updateMergedProducts(updated, selectedSku);
      return updated;
    });
  };
  const toggleSelectionAsin = (asin) => {
    const isSelected = selectedAsin.some((a) => a.id === asin.id);
    if (isSelected) {
      setSelectedAsin((prev) => {
        const updated = prev.filter((a) => a.id !== asin.id);
        updateMergedProducts(updated, selectedSku);
        return updated;
      });
      updateActiveFilters("asin", asin.id, asin.Asin, false);
    } else {
      setSelectedAsin((prev) => {
        const updated = [...prev, asin];
        updateMergedProducts(updated, selectedSku);
        return updated;
      });
      updateActiveFilters("asin", asin.id, asin.Asin, true);
    }
  };
  const handleToggleManufacturer = (manufacturer) => {
    const isSelected = selectedManufacturer.includes(manufacturer);
    if (isSelected) {
      setSelectedManufacturer((prev) =>
        prev.filter((item) => item !== manufacturer)
      );
      updateActiveFilters("manufacturer", manufacturer, manufacturer, false);
    } else {
      setSelectedManufacturer((prev) => [...prev, manufacturer]);
      updateActiveFilters("manufacturer", manufacturer, manufacturer, true);
    }
  };
    const [showFilters, setShowFilters] = useState(false);

  const updateMergedProducts = (asinList, skuList) => {
    const merged = [...skuList, ...asinList];
    const uniqueById = Array.from(
      new Map(merged.map((item) => [item.id, item])).values()
    );
    productuniqueById = uniqueById.map((item) => item.id);
    setMergedProducts(productuniqueById);
  };
  useEffect(() => {
  }, [mergedProducts, selectedFulfillment]);
  const handleCategoryChange = (event) => {
    const selectedName = event.target.value;
    const selectedCategoryObject = categories.find(
      (category) => category.name === selectedName
    );
    if (selectedCategoryObject) {
      setSelectedCategory(selectedCategoryObject);
    }
  };
  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
    if (endDate && newValue > endDate) {
      setEndDate(null);
    }
  };
  const handleEndDateChange = (newValue) => {
    setEndDate(newValue);
  };
  const handleClearFilter = () => {
    setSelectedCategory({ id: "all", name: "All Channels" });
    setFilterFinal({ id: "all", name: "All Channels" });
    setFilter("all");
    setResetCounter((prev) => prev + 1);
    setAppliedPreset("Today");
    setSelectedBrand([]);
    setSelectedManufacturer([]);
    setSelectedSku([]);
    setSelectedAsin([]);
    setMergedProducts([]);
    setMergedProductsFilter([]);
    setActiveFilters([]);
    setSelectedBrandFilter([]);
    setSelectedManufacturerFilter([]);
    setStartDate(null);
    setEndDate(null);
    setAppliedStartDate(null);
    setAppliedEndDate(null);
    setInputValueBrand("");
    setInputValueManufactuer("");
    setInputValueSku("");
    setInputValueAsin("");
    setStartDateHelium(dayjs().subtract(7, "day"));
    setEndDateHelium(dayjs());
    setAppliedStartDateHelium(dayjs().subtract(7, "day"));
    setAppliedEndDateHelium(dayjs());
    setSelectedPreset("Today");
    setBefePreset("Today");
    setIsFiltering(false);
    toast.success("Filters reset successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };
  return (
    <Box sx={{  mt: "56px" }}>
      <Grid
        container
        spacing={2}
        className="stickyGrid"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "white",
          paddingBottom: activeFilters.length > 0 ? 0 : 2,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Grid item xs={12}>
        <Box
  sx={{
    width: "100%",
    backgroundColor: "#fff",
    py: 1,
    px: 2,
    position: "sticky",     // scrolls correctly under Navbar
    top: 56,                // just below Notificationbar
    zIndex: 100,            // below AppBar (1201) but above content
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  }}
>
  <Grid container spacing={2} className="dashboard-filter">
     <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FilterAltIcon />}
          onClick={() => setShowFilters(true)}
          sx={{
            borderColor: "#000080",
            color: "#000080",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Filters
        </Button>
      </Box>
  </Grid>
  {activeFilters.length > 0 && (
    <Box
      sx={{
        display: "flex",
        width:'88%',
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        p: 1.5,
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        mx: 2,
        mt: 2,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
        Active Filters:
      </Typography>
      {activeFilters.map((filter, index) => (
        <Chip
          key={`${filter.type}-${filter.value}-${index}`}
          label={`${filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}: ${filter.label}`}
          onDelete={() => handleRemoveFilter(filter)}
          size="small"
          sx={{
            fontWeight: 500,
          }}
        />
      ))}
      <Button
        variant="text"
        size="small"
        onClick={handleClearFilter}
        sx={{
          ml: "auto",
          textTransform: "none",
        }}
      >
        Clear All
      </Button>
    </Box>
  )}
</Box>
        </Grid>
        <Grid
  item
  xs={12}
  sx={{
    mt: 2,
    pt: "0 !important",
    pl: "16px !important",
    pr: "16px !important",
  }}
>
</Grid>
{showFilters && (
  <DashboardFilters
    onClose={() => setShowFilters(false)}
    selectedCountry={selectedCountry}
    setSelectedCountry={setSelectedCountry}
    selectedBrand={selectedBrand}
    setSelectedBrand={setSelectedBrand}
    brandList={brandList}
    inputValueBrand={inputValueBrand}
    setInputValueBrand={setInputValueBrand}
    brandLimit={brandLimit}
    setBrandLimit={setBrandLimit}
    hasMore={hasMore}
    isLoading={isLoading}
    toggleSelection={toggleSelection}
    selectedSku={selectedSku}
    setSelectedSku={setSelectedSku}
    skuList={skuList}
    inputValueSku={inputValueSku}
    setInputValueSku={setInputValueSku}
    toggleSelectionSKU={toggleSelectionSKU}
    selectedAsin={selectedAsin}
    setSelectedAsin={setSelectedAsin}
    asinList={asinList}
    inputValueAsin={inputValueAsin}
    setInputValueAsin={setInputValueAsin}
    toggleSelectionAsin={toggleSelectionAsin}
    presets={presets}
    selectedPreset={selectedPreset}
    handlePresetSelectHelium={handlePresetSelectHelium}
    befePreset={befePreset}
    setBefePreset={setBefePreset}
    setAppliedPreset={setAppliedPreset}
    startDate={startDate}
    endDate={endDate}
    handleStartDateChangeOptimized={handleStartDateChangeOptimized}
    handleEndDateChangeOptimized={handleEndDateChangeOptimized}
    handleClearFilter={handleClearFilter}
    activeFilters={activeFilters}
    handleRemoveFilter={handleRemoveFilter}
  />
)}
        <Grid item xs={12} sm={12} sx={{ marginTop: "0%" }}>
          <TestCard
            country={selectedCountry}
            marketPlaceId={
              selectedCategory == "all" ? selectedCategory : filterFinal
            }
            startDate={appliedStartDateHelium}
            endDate={appliedEndDateHelium}
            widgetData={appliedPreset}
            brand_id={selectedBrandFilter}
            product_id={mergedProductsFilter}
            manufacturer_name={selectedManufacturerFilter}
            fulfillment_channel={selectedFulfillment}
            DateStartDate={appliedStartDate}
            DateEndDate={appliedEndDate}
          />
        </Grid>
         <Grid item xs={12} sm={12} sx={{ width: "99%" }}>
            <AllMarketplace
              country={selectedCountry}
              widgetData={appliedPreset}
              marketPlaceId={
                selectedCategory === "all" ? selectedCategory : filterFinal
              }
              brand_id={selectedBrandFilter}
              product_id={mergedProductsFilter}
              manufacturer_name={selectedManufacturerFilter}
              fulfillment_channel={selectedFulfillment}
              DateStartDate={appliedStartDate}
              DateEndDate={appliedEndDate}
            />
          </Grid>
          <Grid item xs={12} sm={12} sx={{ width: "99%" }}>
            <ProfitAndLoss
              country={selectedCountry}
              widgetData={appliedPreset}
              marketPlaceId={
                selectedCategory == "all" ? selectedCategory : filterFinal
              }
              brand_id={selectedBrandFilter}
              fulfillment_channel={selectedFulfillment}
              manufacturer_name={selectedManufacturerFilter}
              product_id={mergedProductsFilter}
              DateStartDate={appliedStartDate}
              DateEndDate={appliedEndDate}
            />
          </Grid>
        <Grid item xs={12} sm={12}>
          <PeriodComparission
            country={selectedCountry}
            marketPlaceId={
              selectedCategory === "all" ? selectedCategory : filterFinal
            }
            brand_id={selectedBrandFilter}
            product_id={mergedProductsFilter}
            manufacturer_name={selectedManufacturerFilter}
            fulfillment_channel={selectedFulfillment}
          />
        </Grid>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            sm={12}
            sx={{ padding: "13px", marginLeft: "15px" }}
          >
            <Box
              sx={{
                border: "1px solid #ddd",
                boxShadow: "none",
                borderRadius: "12px",
                p: 1.2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor: "#dce3ec",
                  borderRadius: "30px",
                  p: "2px",
                  mb: 1.5,
                }}
              >
                <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                variant="fullWidth"
                sx={{
                  minHeight: 0,
                  width: "100%",
                  "& .MuiTabs-indicator": { display: "none" },
                }}
              >
                {[
                  {
                    label: "Revenue",
                    icon: <BarChartOutlined sx={{ fontSize: { xs: 16, sm: 20 } }} />,
                  },
                  {
                    label: "Top Products",
                    icon: <EmojiEventsOutlined sx={{ fontSize: { xs: 16, sm: 20 } }} />,
                  },
                  {
                    label: "Total Sales",
                    icon: <AttachMoneyOutlined sx={{ fontSize: { xs: 16, sm: 20 } }} />,
                  },
                  {
                    label: "Latest Orders",
                    icon: <ShoppingCartOutlined sx={{ fontSize: { xs: 16, sm: 20 } }} />,
                  },
                ].map((item, index) => (
                  <Tab
                    key={item.label}
                    icon={item.icon}
                    iconPosition="start"
                    label={
                      <Typography
                        sx={{
                          fontSize: { xs: "11px", sm: "12px", md: "14px" },
                          fontFamily:
                            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                          fontWeight: tab === index ? 600 : "normal",
                          display: { xs: "none", sm: "block" },
                        }}
                      >
                        {item.label}
                      </Typography>
                    }
                    sx={{
                      textTransform: "none",
                      minHeight: { xs: 24, sm: 26 },
                      minWidth: { xs: "auto", sm: "unset" },
                      px: { xs: 0.5, sm: 0.8, md: 1.2 },
                      mx: { xs: 0.2, sm: 0.3, md: 0.4 },
                      fontSize: { xs: "11px", sm: "12px", md: "14px" },
                      borderRadius: { xs: "12px", sm: "14px", md: "16px" },
                      color: "#2b2f3c",
                      backgroundColor: tab === index ? "#fff" : "transparent",
                      "&.Mui-selected": { color: "#000" },
                      "&:hover": {
                        backgroundColor: tab === index ? "#fff" : "rgb(166, 183, 201)",
                      },
                      "&:active": { backgroundColor: "rgb(103, 132, 162)" },
                      "& .MuiTab-iconWrapper": {
                        marginRight: { xs: 0, sm: "6px" },
                        marginBottom: { xs: 0, sm: "0 !important" },
                      },
                    }}
                  />
                ))}
              </Tabs>
              </Box>
              <Box>
                {tab === 0 && (
                  <CompareChart
                    country={selectedCountry}
                    startDate={appliedStartDateHelium}
                    endDate={appliedEndDateHelium}
                    widgetData={appliedPreset}
                    marketPlaceId={
                      selectedCategory == "all" ? selectedCategory : filterFinal
                    }
                    brand_id={selectedBrandFilter}
                    product_id={mergedProductsFilter}
                    manufacturer_name={selectedManufacturerFilter}
                    fulfillment_channel={selectedFulfillment}
                    DateStartDate={appliedStartDate}
                    DateEndDate={appliedEndDate}
                  />
                )}
                {tab === 1 && (
                  <TopProducts
                  country={selectedCountry}
                    startDate={appliedStartDateHelium}
                    endDate={appliedEndDateHelium}
                    widgetData={appliedPreset}
                    marketPlaceId={
                      selectedCategory == "all" ? selectedCategory : filterFinal
                    }
                    brand_id={selectedBrandFilter}
                    product_id={mergedProductsFilter}
                    manufacturer_name={selectedManufacturerFilter}
                    fulfillment_channel={selectedFulfillment}
                    DateStartDate={appliedStartDate}
                    DateEndDate={appliedEndDate}
                  />
                )}
                {tab === 2 && (
                  <TotalOrdersGraph
                    country={selectedCountry}
                    key={setResetCounter}
                    widgetData={appliedPreset}
                    marketPlaceId={
                      selectedCategory === "all"
                        ? selectedCategory
                        : filterFinal
                    }
                    DateStartDate={appliedStartDate}
                    DateEndDate={appliedEndDate}
                    brand_id={selectedBrandFilter}
                    product_id={mergedProductsFilter}
                    manufacturer_name={selectedManufacturerFilter}
                    fulfillment_channel={selectedFulfillment}
                  />
                )}
                {tab === 3 && (
                  <LastOrders
                  country={selectedCountry}
                    marketPlaceId={
                      selectedCategory === "all"
                        ? selectedCategory
                        : filterFinal
                    }
                    brand_id={selectedBrandFilter}
                    product_id={mergedProductsFilter}
                    manufacturer_name={selectedManufacturerFilter}
                    fulfillment_channel={selectedFulfillment}
                  />
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12}>
          <MetricCard
            country={selectedCountry}
            startDate={appliedStartDateHelium}
            endDate={appliedEndDateHelium}
            widgetData={appliedPreset}
            marketPlaceId={
              selectedCategory === "all" ? selectedCategory : filterFinal
            }
            brand_id={selectedBrandFilter}
            product_id={mergedProductsFilter}
            manufacturer_name={selectedManufacturerFilter}
            fulfillment_channel={selectedFulfillment}
            DateStartDate={appliedStartDate}
            DateEndDate={appliedEndDate}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <ProductPerformanceContainer
            country={selectedCountry}
            userId={userIds}
            marketPlaceId={
              selectedCategory === "all" ? selectedCategory : filterFinal
            }
            brand_id={selectedBrandFilter}
            product_id={mergedProductsFilter}
            manufacturer_name={selectedManufacturerFilter}
            fulfillment_channel={selectedFulfillment}
            DateStartDate={appliedStartDate}
            DateEndDate={appliedEndDate}
          />
          <Grid
            item
            xs={12}
            sm={12}
            sx={{ width: "100%", borderRadius: "2px" }}
          >
            <Box
              sx={{
                padding: "16px",
              }}
            >
              <InsightCategory />
            </Box>
          </Grid>
          <Grid item xs={12} sm={12}>
            <MyProductList
            country={selectedCountry}
              widgetData={appliedPreset}
              marketPlaceId={
                selectedCategory == "all" ? selectedCategory : filterFinal
              }
              brand_id={selectedBrandFilter}
              product_id={mergedProductsFilter}
              manufacturer_name={selectedManufacturerFilter}
              fulfillment_channel={selectedFulfillment}
              DateStartDate={appliedStartDate}
              DateEndDate={appliedEndDate}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
export default ClientDashboardpage;