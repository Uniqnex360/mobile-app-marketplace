import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import "./Helium.css";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  ArrowDownward,
  ArrowUpward,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/en";
import axios from "axios";
import ChooseMetrics from "./ChooseMetrics";
import DottedCircleLoading from "../../../Loading/DotLoading";
import SkeletonLoadingUI from "./SummaryCardLoading";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getCurrencySymbol } from "../../../../utils/currencySymbol";
dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("en");
const TIMEZONE = "US/Pacific";
const MetricItem = ({
  title,
  value,
  change,
  isNegative,
  tooltip,
  currencySymbol,
  percentSymbol,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const absValue = Math.abs(value ?? 0);
  const absChange = Math.abs(change ?? 0);
  const displayValue = `${(value ?? 0) < 0 ? "-" : ""}${currencySymbol
    ? `${currencySymbol}${Math.abs(value ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
    : percentSymbol
      ? `${Math.abs(value ?? 0)}%`
      : new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.abs(value ?? 0))
  }`;
  const displayChange =
  change !== undefined
    ? `${change < 0 ? "-" : ""}${currencySymbol
      ? `${currencySymbol}${Math.abs(change ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
      : percentSymbol
        ? `${Math.abs(change ?? 0)}%`
        : new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Math.abs(change ?? 0))
    }`
    : "";
  return (
    <Card
      sx={{
        borderRadius: 2,
        minWidth: { xs: 150, sm: 180, md: 200 },
        height: { xs: 55, sm: 60 },
        opacity: loading ? 0.6 : 1,
      }}
    >
      <CardContent sx={{ py: { xs: 0.3, sm: 0.5 }, px: { xs: 1, sm: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontSize: { xs: 12, sm: 14 },
              color: "text.secondary",
            }}
          >
            {title}
          </Typography>
        </Box>
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          mt={0.5}
          sx={{ paddingRight: "4px", gap: { xs: 0.5, sm: 1 } }}
        >
          <Tooltip title={tooltip || ""}>
            <Typography
              variant="subtitle2"
              sx={{ fontSize: { xs: "16px", sm: "18px", md: "20px" } }}
              fontWeight="bold"
            >
              {loading ? "..." : displayValue}
            </Typography>
          </Tooltip>
          {change !== undefined && (
            <Typography
              sx={{
                fontSize: { xs: 10, sm: 11 },
                color: isNegative ? "error.main" : "success.main",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {loading ? "..." : displayChange}
              {!loading &&
                (isNegative ? (
                  <ArrowDownward sx={{ fontSize: "inherit" }} />
                ) : (
                  <ArrowUpward sx={{ fontSize: "inherit" }} />
                ))}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
const TestCard = ({
  marketPlaceId,
  country,
  brand_id,
  widgetData,
  product_id,
  DateStartDate,
  DateEndDate,
  manufacturer_name,
  fulfillment_channel,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const API_TODAY = dayjs("02/09/2025", "DD/MM/YYYY").tz(TIMEZONE);
  const stableBrandId = JSON.stringify(brand_id);
const stableProductId = JSON.stringify(product_id);
const stableManufacturer = JSON.stringify(manufacturer_name);
  const [currentDates, setCurrentDates] = useState({
    selectedDate: API_TODAY,
    displayDate: API_TODAY,
  });
  const formatNumber = (value) => (value ?? 0).toLocaleString("en-US");
  const [currentPreset, setCurrentPreset] = useState(widgetData);
  const [dataState, setDataState] = useState({
    metrics: {},
    previous: {},
    difference: {},
    bindGraph: [],
  });
  const [tooltipData, setTooltipData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.id || "";
  const graphContainerRef = useRef(null);
  const svgRef = useRef(null);
  const [svgOffset, setSvgOffset] = useState({ left: 0, top: 0 });
  const [open, setOpen] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState([
    "gross_revenue_without_tax",
    "gross_revenue_with_tax",
    "total_orders",
    "total_units",
    "refund",
    "total_cogs",
    "net_profit",
    "margin",
    "business_value",
  ]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    fetchMetrics(currentDates.selectedDate, currentDates.displayDate);
  };
  const handleMetricToggle = (metric) => {
    setVisibleMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };
  const handleReset = () => setVisibleMetrics([]);
  const handleApply = () => console.log("Applied Metrics:", visibleMetrics);
  useEffect(() => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setSvgOffset({ left: rect.left, top: rect.top });
    }
  }, []);
  useEffect(() => {
    fetchMetrics(currentDates.selectedDate, currentDates.displayDate);
  }, [
    currentDates.selectedDate,
    currentDates.displayDate,
    currentPreset,
    stableBrandId,
    country,
    stableProductId,
    stableManufacturer,
    fulfillment_channel,
    marketPlaceId?.id,
  ]);
  const latestRequestRef = useRef(0);
  const fetchMetrics = async (selectedDate, displayDate) => {
    setDataLoading(true);
    const requestId = ++latestRequestRef.current;
    try {
      const payload = {
        target_date: "01/09/2025",
        user_id: userId,
        country: country,
        preset: currentPreset,
        marketplace_id: marketPlaceId.id,
        brand_id: brand_id,
        product_id: product_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        timezone: TIMEZONE,
      };
      if (DateStartDate && dayjs(DateStartDate).isValid()) {
        payload.start_date = dayjs(DateStartDate).format("DD/MM/YYYY");
      }
      if (DateEndDate && dayjs(DateEndDate).isValid()) {
        payload.end_date = dayjs(DateEndDate).format("DD/MM/YYYY");
      }
      const response = await axios.post(
        `${process.env.REACT_APP_IP}get_metrics_by_date_range/`,
        payload
      );
      if (requestId === latestRequestRef.current) {
        const data = response.data.data;
        setDataState({
          metrics: data.targeted || {},
          previous: data.previous || {},
          difference: data.difference || {},
          bindGraph: Object.entries(data.graph_data || {})
            .map(([rawDate, values]) => ({
              date: rawDate,
              fullDate: rawDate,
              dateObj: dayjs(rawDate, "MMMM DD, YYYY"),
              gross_revenue_without_tax: values.gross_revenue_without_tax,
              gross_revenue_with_tax: values.gross_revenue_with_tax,
            }))
            .sort((a, b) => a.dateObj - b.dateObj),
        });
        const selectedMetricKeys = Object.keys(data.targeted || {});
        setVisibleMetrics(selectedMetricKeys);
      }
    } catch (error) {
      if (requestId === latestRequestRef.current) {
        console.error("Error fetching metrics:", error);
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setDataLoading(false);
      }
    }
  };
  const getDisplayDateText = (
    widgetData,
    DateStartDate,
    DateEndDate,
    displayDate,
    selectedDate
  ) => {
    const today = API_TODAY;
    if (DateStartDate && DateEndDate) {
      return `${dayjs(DateStartDate).format("MMMM D, YYYY")} - ${dayjs(
        DateEndDate
      ).format("MMMM D, YYYY")}`;
    }
    switch (widgetData) {
      case "Today":
      case "Yesterday":
        return selectedDate.format(isMobile ? "MMM DD" : "ddd, MMM DD");
      default:
        if (
          displayDate &&
          selectedDate &&
          !displayDate.isSame(selectedDate, "day")
        ) {
          return `${displayDate.format("MMM DD")} - ${selectedDate.format(
            "MMM DD"
          )}`;
        }
        return selectedDate.format(isMobile ? "MMM DD" : "ddd, MMM DD");
    }
  };
  const getSubtitleText = (
    widgetData,
    DateStartDate,
    DateEndDate,
    displayDate,
    selectedDate
  ) => {
    const today = API_TODAY;
    if (DateStartDate && DateEndDate) return "Custom Date Range";
    if (widgetData === "Today" || widgetData === "Yesterday") {
      return selectedDate.isSame(today, "day") ? (
        "Today"
      ) : (
        <span
          style={{
            color: "#0A6FE8",
            fontWeight: "bold",
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: isMobile ? 12 : 14,
            cursor: "pointer",
            textDecoration: "none",
          }}
          onClick={handleBackToToday}
        >
          Back to Today
        </span>
      );
    }
    return widgetData;
  };
  useEffect(() => {
    const today = API_TODAY;
    let newDisplayDate, newSelectedDate;
    if (DateStartDate && DateEndDate) {
      newDisplayDate = dayjs(DateStartDate);
      newSelectedDate = dayjs(DateEndDate);
    } else {
      switch (widgetData) {
        case "Today":
          newDisplayDate = today;
          newSelectedDate = today;
          break;
        case "Yesterday":
          newDisplayDate = today.subtract(1, "day");
          newSelectedDate = today.subtract(1, "day");
          break;
        case "This Week":
          newDisplayDate = today.startOf("week");
          newSelectedDate = today.endOf("week");
          break;
        case "Last Week":
          newDisplayDate = today.clone().subtract(1, "week").startOf("week");
          newSelectedDate = today.clone().subtract(1, "week").endOf("week");
          break;
        case "Last 7 days":
          newDisplayDate = today.subtract(6, "day");
          newSelectedDate = today;
          break;
        case "Last 14 days":
          newDisplayDate = today.subtract(13, "day");
          newSelectedDate = today;
          break;
        case "Last 30 days":
          newDisplayDate = today.subtract(29, "day");
          newSelectedDate = today;
          break;
        case "Last 60 days":
          newDisplayDate = today.subtract(59, "day");
          newSelectedDate = today;
          break;
        case "Last 90 days":
          newDisplayDate = today.subtract(89, "day");
          newSelectedDate = today;
          break;
        case "This Month":
          newDisplayDate = today.startOf("month");
          newSelectedDate = today.endOf("month");
          break;
        case "Last Month":
          newDisplayDate = today.subtract(1, "month").startOf("month");
          newSelectedDate = today.subtract(1, "month").endOf("month");
          break;
        case "This Quarter":
          newDisplayDate = today.startOf("quarter");
          newSelectedDate = today.endOf("quarter");
          break;
        case "Last Quarter":
          newDisplayDate = today.subtract(1, "quarter").startOf("quarter");
          newSelectedDate = today.subtract(1, "quarter").endOf("quarter");
          break;
        case "This Year":
          newDisplayDate = today.startOf("year");
          newSelectedDate = today.endOf("year");
          break;
        case "Last Year":
          newDisplayDate = today.subtract(1, "year").startOf("year");
          newSelectedDate = today.subtract(1, "year").endOf("year");
          break;
        default:
          newDisplayDate = today;
          newSelectedDate = today;
      }
    }
    setCurrentDates({
      displayDate: newDisplayDate,
      selectedDate: newSelectedDate,
    });
    setCurrentPreset(widgetData);
  }, [widgetData, DateStartDate, DateEndDate]);
  const currencySymbol=getCurrencySymbol(country)
  const formatCurrency = (value) =>
  `${currencySymbol}${(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const METRICS_CONFIG = {
    gross_revenue_without_tax: {
      title: "Gross Revenue (No Tax)",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(
            prev
          )}`,
      currencySymbol: currencySymbol,
    },
    gross_revenue_with_tax: {
      title: "Gross Revenue",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(
            prev
          )}`,
      currencySymbol: currencySymbol,
    },
    total_orders: {
      title: "Orders",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${prev || "0"}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${prev || "0"}`,
    },
    total_units: {
      title: "Units Sold",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${prev || "0"}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${prev || "0"}`,
    },
    total_tax: {
      title: "Total Tax",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(
            prev
          )}`,
      currencySymbol: currencySymbol,
    },
    refund: {
      title: "Refunds",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${prev || "0"}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${prev || "0"}`,
    },
    total_cogs: {
      title: "COGS",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(
            prev
          )}`,
      currencySymbol: currencySymbol,
    },
    net_profit: {
      title: "Net Profit",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(
            prev
          )}`,
      currencySymbol: currencySymbol,
    },
    expenses: {
      title: "Expenses",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(
            prev
          )}`,
      currencySymbol: currencySymbol,
    },
    margin: {
      title: "Profit Margin",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${prev?.toFixed(2)}%`
          : `${date.subtract(1, "day").format("MMM DD")}: ${prev?.toFixed(2)}%`,
      percentSymbol: "%",
    },
    business_value: {
      title: "Business Value",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(
            prev
          )}`,
      currencySymbol: currencySymbol,
    },
  };
  const today = API_TODAY;
  const handlePrevious = () => {
    const today = API_TODAY;
    if (DateStartDate && DateEndDate) {
      const rangeDays =
        dayjs(DateEndDate).diff(dayjs(DateStartDate), "day") + 1;
      setCurrentDates((prev) => ({
        displayDate: prev.displayDate.subtract(rangeDays, "day"),
        selectedDate: prev.selectedDate.subtract(rangeDays, "day"),
      }));
    } else {
      const newSelectedDate = currentDates.selectedDate.subtract(1, "day");
      let newPreset = "Custom";
      if (newSelectedDate.isSame(today, "day")) {
        newPreset = "Today";
      } else if (newSelectedDate.isSame(today.subtract(1, "day"), "day")) {
        newPreset = "Yesterday";
      } else {
        newPreset = widgetData;
      }
      setCurrentDates((prev) => ({
        ...prev,
        selectedDate: newSelectedDate,
      }));
      setCurrentPreset(newPreset);
    }
  };
  const handleNext = () => {
    const today = API_TODAY;
    if (DateStartDate && DateEndDate) {
      const rangeDays =
        dayjs(DateEndDate).diff(dayjs(DateStartDate), "day") + 1;
      const newEndDate = dayjs(currentDates.selectedDate).add(rangeDays, "day");
      if (newEndDate.isAfter(today)) return;
      setCurrentDates((prev) => ({
        displayDate: prev.displayDate.add(rangeDays, "day"),
        selectedDate: prev.selectedDate.add(rangeDays, "day"),
      }));
    } else if (!currentDates.selectedDate.isSame(today, "day")) {
      const newSelectedDate = currentDates.selectedDate.add(1, "day");
      let newPreset = "Custom";
      if (newSelectedDate.isSame(today, "day")) {
        newPreset = "Today";
      } else if (newSelectedDate.isSame(today.subtract(1, "day"), "day")) {
        newPreset = "Yesterday";
      } else {
        newPreset = widgetData;
      }
      setCurrentDates((prev) => ({
        ...prev,
        selectedDate: newSelectedDate,
      }));
      setCurrentPreset(newPreset);
    }
  };
  const handleBackToToday = () => {
    const today = API_TODAY;
    if (DateStartDate && DateEndDate) {
      const rangeDays =
        dayjs(DateEndDate).diff(dayjs(DateStartDate), "day") + 1;
      setCurrentDates({
        displayDate: today.subtract(rangeDays - 1, "day"),
        selectedDate: today,
      });
    } else {
      setCurrentDates((prev) => ({
        ...prev,
        selectedDate: today,
      }));
      setCurrentPreset("Today");
    }
  };
  const getGraphPoints = (metric = "gross_revenue_without_tax") => {
    const maxValue = Math.max(...dataState.bindGraph.map((d) => d[metric]), 1);
    const width = isMobile ? 200 : 280;
    return dataState.bindGraph
      .map((item, index) => {
        const x = (index / (dataState.bindGraph.length - 1)) * width + 10;
        const y = 50 - (item[metric] / maxValue) * 30;
        return `${x},${y}`;
      })
      .join(" ");
  };
  const getCirclePoints = (metric = "gross_revenue_without_tax") => {
    const maxValue = Math.max(...dataState.bindGraph.map((d) => d[metric]), 1);
    const width = isMobile ? 200 : 280;
    return dataState.bindGraph.map((item, index) => ({
      ...item,
      cx: (index / (dataState.bindGraph.length - 1)) * width + 10,
      cy: 50 - (item[metric] / maxValue) * 30,
      value: item[metric],
    }));
  };
  const metricBlockStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderBottom: "1px solid #e0e0e0",
  py: { xs: 0.5, sm: 1 },
  px: { xs: 1, sm: 2 },
  boxSizing: "border-box",
};
  return (
    <Box
  sx={{
    border: "1px solid #e0e0e0",
    borderRadius: 2,
    backgroundColor: "#fff",
    width: { xs: "100%", sm: "99%" },
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    py: 0.5,
    mt: -5,
  }}
>
  {loading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <SkeletonLoadingUI />
    </Box>
  ) : (
    <>
      <Box
        sx={{
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 1.5 },
          borderBottom: "1px solid #e0e0e0",
          textAlign: "left",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          color="#020202ff"
          sx={{
            fontFamily: "'Nunito Sans', sans-serif",
            pt:'10px',
            fontSize: { xs: 16, sm: 18 },
          }}
        >
          Executive Overview
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          px: { xs: 1, sm: 2 },
        }}
      >
        {/* Date Navigation */}
        <Box
          sx={{
            ...metricBlockStyle,
            borderRight: { xs: "none", sm: "1px solid #e0e0e0" },
            borderLeft: "none",
            flex: { xs: "1 1 100%", sm: "0 0 auto" },
            minWidth: { xs: "100%", sm: "180px", md: "200px" },
          }}
        >
          <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    mt: 0.5,
  }}
>
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <IconButton
      size="small"
      onClick={handlePrevious}
      disabled={dataLoading}
      sx={{ p: 0.5 }}
    >
      <ChevronLeft sx={{ fontSize: 22 }} />
    </IconButton>

    <Typography
      sx={{
        minWidth: 120,
        textAlign: "center",
        fontWeight: 600,
        fontFamily: "'Nunito Sans', sans-serif",
        fontSize: 13,
        color: "#485E75",
      }}
    >
      {getDisplayDateText(
        currentPreset,
        DateStartDate,
        DateEndDate,
        currentDates.displayDate,
        currentDates.selectedDate
      )}
    </Typography>

    <IconButton
      size="small"
      onClick={handleNext}
      disabled={
        dataLoading || currentDates.selectedDate.isSame(API_TODAY, "day")
      }
      sx={{ p: 0.5 }}
    >
      <ChevronRight sx={{ fontSize: 22 }} />
    </IconButton>
  </Box>

  <Typography
    variant="caption"
    color="text.secondary"
    sx={{
      mt: 0.3,
      textAlign: "center",
      fontSize: 12,
      fontFamily: "'Nunito Sans', sans-serif",
    }}
  >
    {getSubtitleText(
      currentPreset,
      DateStartDate,
      DateEndDate,
      currentDates.displayDate,
      currentDates.selectedDate
    )}
  </Typography>
</Box>
        </Box>

        {/* First Row Metrics */}
        {/* Gross Revenue Without Tax */}
        {visibleMetrics.includes("gross_revenue_without_tax") && (
          <Box sx={{
            ...metricBlockStyle,
            flex: { xs: "1 1 calc(50% - 16px)", sm: "1 1 180px", md: "1 1 200px" },
            minWidth: { xs: "calc(50% - 16px)", sm: "180px", md: "200px" },
            maxWidth: { xs: "calc(50% - 16px)", sm: "180px", md: "200px" },
          }}>
            <MetricItem
              title="Gross Revenue (No Tax)"
              value={dataState.metrics.gross_revenue_without_tax}
              change={dataState.difference.gross_revenue_without_tax}
              isNegative={String(
                dataState.difference.gross_revenue_without_tax
              ).startsWith("-")}
              tooltip={
                currentDates.selectedDate.isSame(today, "day")
                  ? `Yesterday: ${formatCurrency(
                    dataState.previous.gross_revenue_without_tax
                  )}`
                  : `${currentDates.selectedDate
                    .subtract(1, "day")
                    .format("MMM DD")}: ${formatCurrency(
                      dataState.previous.gross_revenue_without_tax
                    )}`
              }
              currencySymbol={currencySymbol}
              loading={dataLoading}
            />
          </Box>
        )}

        {/* Gross Revenue With Tax */}
        {visibleMetrics.includes("gross_revenue_with_tax") && (
          <Box sx={{
            ...metricBlockStyle,
            flex: { xs: "1 1 calc(50% - 16px)", sm: "1 1 180px", md: "1 1 200px" },
            minWidth: { xs: "calc(50% - 16px)", sm: "180px", md: "200px" },
            maxWidth: { xs: "calc(50% - 16px)", sm: "180px", md: "200px" },
          }}>
            <MetricItem
              title="Gross Revenue"
              value={dataState.metrics.gross_revenue_with_tax}
              change={dataState.difference.gross_revenue_with_tax}
              isNegative={String(
                dataState.difference.gross_revenue_with_tax
              ).startsWith("-")}
              tooltip={
                currentDates.selectedDate.isSame(today, "day")
                  ? `Yesterday: ${formatCurrency(
                    dataState.previous.gross_revenue_with_tax
                  )}`
                  : `${currentDates.selectedDate
                    .subtract(1, "day")
                    .format("MMM DD")}: ${formatCurrency(
                      dataState.previous.gross_revenue_with_tax
                    )}`
              }
              currencySymbol={currencySymbol}
              loading={dataLoading}
            />
          </Box>
        )}

        {/* Chart */}
        {(visibleMetrics.includes("gross_revenue_without_tax") ||
          visibleMetrics.includes("gross_revenue_with_tax")) && (
            <Box sx={{ 
              borderRight: { xs: "none", sm: "1px solid #e0e0e0" },
              flex: { xs: "1 1 100%", sm: "1 1 280px", md: "1 1 300px" },
              minWidth: { xs: "100%", sm: "280px", md: "300px" },
              maxWidth: { xs: "100%", sm: "280px", md: "300px" },
            }}>
              <Box
                ref={graphContainerRef}
                sx={{
                  ...metricBlockStyle,
                  position: "relative",
                  overflow: "visible",
                  flexDirection: "column",
                  opacity: dataLoading ? 0.6 : 1,
                  height: "100%",
                }}
                onMouseLeave={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX;
                  const y = e.clientY;
                  if (
                    x < rect.left ||
                    x > rect.right ||
                    y < rect.top ||
                    y > rect.bottom
                  ) {
                    setTimeout(() => setTooltipData(null), 100);
                  }
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 70, sm: 80 },
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <svg ref={svgRef} width="100%" height={isMobile ? 50 : 60}>
                    {/* Grid lines */}
                    {[20, 30, 40].map((y, idx) => (
                      <line
                        key={idx}
                        x1="0"
                        y1={y}
                        x2="100%"
                        y2={y}
                        stroke="#eee"
                        strokeWidth="1"
                      />
                    ))}
                    {/* X-axis */}
                    <line
                      x1="0"
                      y1={isMobile ? 46 : 48}
                      x2="100%"
                      y2={isMobile ? 46 : 48}
                      stroke="#000"
                      strokeWidth="1"
                    />
                    {!dataLoading && (
                      <>
                        {/* Revenue lines */}
                        <polyline
                          points={getGraphPoints("gross_revenue_without_tax")}
                          style={{
                            fill: "none",
                            stroke: theme.palette.primary.main,
                            strokeWidth: isMobile ? 1.5 : 2,
                          }}
                        />
                        <polyline
                          points={getGraphPoints("gross_revenue_with_tax")}
                          style={{
                            fill: "none",
                            stroke: "#FF9800",
                            strokeWidth: isMobile ? 1.5 : 2,
                          }}
                        />
                        {getCirclePoints("gross_revenue_with_tax").map(
                          (point, index) => (
                            <circle
                              key={`visible-with-tax-${index}`}
                              cx={point.cx}
                              cy={point.cy}
                              r={isMobile ? 3 : 4}
                              fill="#FF9800"
                              stroke="white"
                              strokeWidth="1.5"
                              style={{
                                pointerEvents: "none",
                                transition: "r 0.2s ease",
                              }}
                            />
                          )
                        )}
                        {/* Invisible larger circles for easier hovering - gross_revenue_with_tax */}
                        {getCirclePoints("gross_revenue_with_tax").map(
                          (point, index) => (
                            <circle
                              key={`hover-with-tax-${index}`}
                              cx={point.cx}
                              cy={point.cy}
                              r={isMobile ? 8 : 10}
                              fill="transparent"
                              stroke="transparent"
                              style={{
                                pointerEvents: "all",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                setTooltipData({ ...point, index });
                              }}
                              onMouseLeave={(e) => {
                                e.stopPropagation();
                                setTimeout(() => setTooltipData(null), 50);
                              }}
                            />
                          )
                        )}
                        {/* Highlight circle when hovering */}
                        {tooltipData && (
                          <>
                            <circle
                              cx={tooltipData.cx}
                              cy={tooltipData.cy}
                              r={isMobile ? 6 : 8}
                              fill="white"
                              stroke={
                                tooltipData.gross_revenue_with_tax
                                  ? "#FF9800"
                                  : theme.palette.primary.main
                              }
                              strokeWidth="2"
                              style={{ pointerEvents: "none" }}
                            />
                            <circle
                              cx={tooltipData.cx}
                              cy={tooltipData.cy}
                              r={isMobile ? 3 : 4}
                              fill={
                                tooltipData.gross_revenue_with_tax
                                  ? "#FF9800"
                                  : theme.palette.primary.main
                              }
                              style={{ pointerEvents: "none" }}
                            />
                          </>
                        )}
                      </>
                    )}
                  </svg>
                  {/* Graph X-axis Dates */}
                  {!dataLoading && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: isMobile ? 42 : 52,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: { xs: 9, sm: 11 },
                        color: "#555",
                        px: 1,
                        marginTop: "3px",
                      }}
                    >
                      <span>{dataState.bindGraph[0]?.date}</span>
                      <span>
                        {
                          dataState.bindGraph[dataState.bindGraph.length - 1]
                            ?.date
                        }
                      </span>
                    </Box>
                  )}
                  {dataLoading && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: { xs: 10, sm: 12 },
                        color: "#666",
                      }}
                    >
                      Loading...
                    </Box>
                  )}
                </Box>
                {/* Tooltip */}
                {tooltipData && !dataLoading && (
                  <Box
                    sx={{
                      position: "fixed",
                      left: Math.max(
                        10,
                        Math.min(
                          window.innerWidth - 160,
                          svgOffset.left + tooltipData.cx - 80
                        )
                      ),
                      top: Math.max(10, svgOffset.top + tooltipData.cy - 70),
                      backgroundColor: "white",
                      border: "1px solid #d0d7de",
                      borderRadius: 2,
                      padding: { xs: "6px 10px", sm: "8px 12px" },
                      fontSize: { xs: 11, sm: 12 },
                      pointerEvents: "none",
                      zIndex: 1000,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      whiteSpace: "nowrap",
                      maxWidth: 200,
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{ fontSize: { xs: 12, sm: 14 } }}
                      color="#485E75"
                    >
                      {dayjs(tooltipData.fullDate).format("MMM DD, YYYY")}
                    </Typography>
                    <Typography
                      sx={{ fontSize: { xs: 12, sm: 14 } }}
                      color="#FF9800"
                      fontWeight="bold"
                    >
                      Gross Revenue:{" "}
                      {formatCurrency(tooltipData.gross_revenue_with_tax)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

        {/* Second Row Metrics - All other metrics */}
        {[
          "total_orders",
          "total_units",
          "total_tax",
          "refund", 
          "total_cogs",
          "net_profit",
          "expenses",
          "margin",
          "business_value",
        ]
          .filter(id => visibleMetrics.includes(id))
          .map((id, idx) => {
            const item = METRICS_CONFIG[id];
            return (
              <Box key={idx} sx={{
                ...metricBlockStyle,
                flex: { xs: "1 1 calc(50% - 16px)", sm: "1 1 180px", md: "1 1 200px" },
                minWidth: { xs: "calc(50% - 16px)", sm: "180px", md: "200px" },
                maxWidth: { xs: "calc(50% - 16px)", sm: "180px", md: "200px" },
              }}>
                <MetricItem
                  title={item.title}
                  value={dataState.metrics[id]}
                  change={dataState.difference[id]}
                  isNegative={String(dataState.difference[id]).startsWith("-")}
                  tooltip={item.tooltip(
                    currentDates.selectedDate,
                    today,
                    dataState.previous[id]
                  )}
                  currencySymbol={item.currencySymbol}
                  percentSymbol={item.percentSymbol}
                  loading={dataLoading}
                />
              </Box>
            );
          })}
      </Box>
    </>
  )}
</Box>
  );
};
export default TestCard;
