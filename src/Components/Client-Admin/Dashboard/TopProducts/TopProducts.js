import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  Box,
  Tabs,
  Tab,
  Button,
  Switch,
  Typography,
  Avatar,
  Checkbox,
  Stack,
  IconButton,
  Paper,
  Grid,
  Tooltip as MuiTooltip,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/en-in";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import NoteModel from "../NoteModel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import TooltipName from "./TooltipName";
import DottedCircleLoading from "../../../Loading/DotLoading";
// import './Helium.css';
dayjs.extend(utc);
dayjs.extend(timezone);

// Define a consistent set of colors
const colors = [
  "#0d47a1", // Deep Blue
  "#00bcd4", // Cyan
  "#00897b", // Teal
  "#9c27b0", // Purple
  "#f44336", // Red
  "#FF9800", // Orange
  "#8BC34A", // Green
  "#03A9F4", // Light Blue
  "#FF5722", // Deep Orange
  "#795548", // Brown
];

function CopyAsin({ open, onClose, children }) {
  return (
    <MuiTooltip
      open={open}
      onClose={onClose}
      title={
        <Box
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <CheckCircleIcon sx={{ color: "#4CAF50", mr: 0.5, fontSize: 16 }} />
          <span>ASIN Copied</span>
        </Box>
      }
      placement="top"
    >
      {children}
    </MuiTooltip>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
  productList,
  tab,
  hoveredProductId,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const filteredPayload = hoveredProductId
    ? payload.filter((entry) => entry.dataKey === hoveredProductId)
    : payload;

  // Only return null if there's nothing to display after filtering
  if (filteredPayload.length === 0) return null;

   const formattedDate = label.includes(':') 
    ? dayjs(label).format("MMM D, h:mm A")  // For hourly data
    : dayjs(label).format("MMM D"); 

  // Helper function to format tooltip values based on tab
  const formatTooltipValue = (value, tab) => {
    switch (tab) {
      case 0: // Revenue
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      case 1: // Units Sold
        return `${value} units`;
      case 2: // Refunds
        return `${value} refunds`;
      default:
        return value;
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: "none",
        minWidth: 250,
        border: "1px solid rgb(161, 173, 184)",
      }}
    >
      <Typography fontWeight={600} fontSize={14} gutterBottom>
        {formattedDate}
      </Typography>

      {filteredPayload.map((entry) => {
        const product = productList.find((p) => p.id === entry.dataKey);
        if (!product) return null;

        return (
          <Stack
            key={entry.dataKey}
            direction="column"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: product.color,
                  }}
                />
                <Typography fontSize={14} color="text.secondary">
                  {product?.sku || "N/A"}
                </Typography>
              </Stack>

              <Typography fontWeight="bold" fontSize={14}>
                {formatTooltipValue(entry.value, tab)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={product?.img}
                variant="rounded"
                sx={{ width: 30, height: 30 }}
              />
              <Box>
                <Typography
                  fontSize={14}
                  fontWeight={500}
                  noWrap
                  maxWidth={180}
                  sx={{ fontWeight: "bold" }}
                >
                  {product?.title || product?.name}
                </Typography>
                <Typography fontSize={14} color="text.secondary">
                  {product?.asin}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        );
      })}
    </Paper>
  );
};

export default function TopProductsChart({
  startDate,
  endDate,
  widgetData,
  marketPlaceId,
  brand_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
}) {
  const [tab, setTab] = useState(0);
  const [productList, setProductList] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);
  const [bindGraph, setBindGraph] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedAsin, setCopiedAsin] = useState(null);
  const [tooltipText, setTooltipText] = useState("Copy ASIN");
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);
  const isTodayOrYesterday =
    widgetData === "Today" || widgetData === "Yesterday";
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handles copying the ASIN value to the clipboard using document.execCommand.
   * This method is more compatible in environments where navigator.clipboard might be restricted (e.g., iframes).
   * @param {string} asinValue - The ASIN value to be copied.
   */

  const handleTooltipOpen = (value) => {
    const isNumberOnly = /^\d+$/.test(value);
    const label = isNumberOnly ? "WPID" : "ASIN";
    setTooltipText(`Copy ${label}`);
  };

  const handleCopy = async (value) => {
    if (!value) return;

    const isNumberOnly = /^\d+$/.test(value);
    const label = isNumberOnly ? "WPID" : "ASIN";

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setTooltipText(`${label} Copied!`);
    } catch (err) {
      console.error("Copy failed", err);
      setTooltipText("Copy Failed");
    }

    setTimeout(() => {
      setTooltipText(`Copy ${label}`);
    }, 1500);
  };

  /**
   * Helper function to copy text using document.execCommand.
   * @param {string} text - The text to be copied.
   */
  const copyUsingExecCommand = (text) => {
    let textArea;
    try {
      textArea = document.createElement("textarea");
      textArea.value = text;
      // Make the textarea invisible and outside the viewport
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      // Execute the copy command
      document.execCommand("copy");

      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 5000);
    } catch (err) {
      console.error("Failed to copy using document.execCommand:", err);
      // Optionally, show a user-friendly message that copying failed
    } finally {
      // Clean up: remove the textarea from the DOM
      if (textArea && textArea.parentNode) {
        textArea.parentNode.removeChild(textArea);
      }
    }
  };

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.id || "";
  const [openNote, setOpenNote] = useState(false);
  const [events, setEvents] = useState(true);

  const runCerebro = () => {
    console.log("Running Cerebro...");
  };

  const analyzeListing = () => {
    console.log("Analyzing Listing...");
  };

  const startOfDay = dayjs().startOf("day");
  const ticks = Array.from(
    { length: 12 },
    (_, i) => startOfDay.add(i * 2, "hour").format("YYYY-MM-DD HH:mm:ss") // Match your data format
  );

  const getSortByValue = (tab) => {
    switch (tab) {
      case 0:
        return "price";
      case 1:
        return "units_sold";
      case 2:
        return "refund";
      default:
        return "price";
    }
  };

  // Helper function to get the appropriate data field based on tab
  const getDataField = (item) => {
    switch (tab) {
      case 0: // Revenue
        return item.total_price;
      case 1: // Units Sold
        return item.total_units;
      case 2: // Refunds
        return item.refund_qty;
      default:
        return item.total_price;
    }
  };

  // Helper function to format Y-axis values based on tab
  const formatYAxisTick = (value) => {
    switch (tab) {
      case 0: // Revenue
        if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(1)}K`;
        } else {
          return `$${Math.round(value)}`;
        }
      case 1: // Units Sold
        if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        } else {
          return Math.round(value).toString();
        }
      case 2: // Refunds
        return Math.round(value).toString();
      default:
        return `$${Math.round(value)}`;
    }
  };

  const generateTickTimes = (graphData) => {
    if (!graphData || graphData.length === 0) return [];

    const start = dayjs(graphData[0].date).startOf("day");
    const end = dayjs(graphData[graphData.length - 1].date).endOf("day");
    const totalTicks = 7;
    const intervalMs = end.diff(start) / (totalTicks - 1);

    const ticks = [];

    for (let i = 0; i < totalTicks; i++) {
      const tickTime = start.add(i * intervalMs, "millisecond");
      // Round to nearest 2-hour mark
      const roundedHour = Math.round(tickTime.hour() / 2) * 2;
      ticks.push(
        tickTime
          .set("hour", roundedHour)
          .set("minute", 0)
          .set("second", 0)
          .toISOString()
      );
    }

    return [...new Set(ticks)];
  };

  const fetchTopProducts = async () => {
    setLoading(true);
    try {
      const params = {
        sortBy: getSortByValue(tab),
        user_id: userId,
        marketplace_id: marketPlaceId.id,
        brand_id: brand_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        timeZone: "US/Pacific",
      };

      // Use custom dates if available, otherwise use preset
      if (DateStartDate && DateEndDate) {
        params.start_date = DateStartDate;
        params.end_date = DateEndDate;
      } else {
        params.preset = widgetData;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_IP}get_top_products/`,
        params
      );
      setApiResponse(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (widgetData || (DateStartDate && DateEndDate)) fetchTopProducts();
  }, [
    tab,
    widgetData,
    marketPlaceId,
    brand_id,
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
  ]);

  useEffect(() => {
    if (apiResponse?.data?.results?.items) {
      const items = apiResponse.data.results.items;

      const products = items.map((item, index) => ({
        id: `product_${index}`,
        topIds: item.id,
        name: item.product,
        sku: item.sku,
        asin: item.asin,
        color: colors[index],
        img: item.product_image || "",
        chart: item.chart || {},
        total_price: item.total_price,
        total_units: item.total_units,
        refund_qty: item.refund_qty,
      }));

      setProductList(products);
      setActiveProducts(products.map((p) => p.id));

      const chartDataMap = {};
      const allTimestamps = new Set();

      const isTodayOrYesterday =
        widgetData === "Today" || widgetData === "Yesterday";

      products.forEach((product) => {
        Object.entries(product.chart || {}).forEach(([datetime, value]) => {
          if (isTodayOrYesterday) {
            // For today/yesterday, convert to Pacific for hourly display
            const pacificDate = dayjs(datetime).tz("US/Pacific");
            const targetDay =
              widgetData === "Today"
                ? dayjs().tz("US/Pacific")
                : dayjs().tz("US/Pacific").subtract(1, "day");

            if (!pacificDate.isSame(targetDay, "day")) return;

            const timeKey = pacificDate
              .minute(0)
              .second(0)
              .millisecond(0)
              .format("YYYY-MM-DD HH:mm:ss");

            allTimestamps.add(timeKey);

            if (!chartDataMap[timeKey]) {
              chartDataMap[timeKey] = { date: timeKey };
            }

            chartDataMap[timeKey][product.id] = value;
          } else {
            // For date ranges, extract just the date part from the UTC timestamp
            // This treats "2025-07-07 00:00:00+00:00" as July 7th
            const dateOnly = datetime.split(" ")[0]; // Gets "2025-07-07"

            allTimestamps.add(dateOnly);

            if (!chartDataMap[dateOnly]) {
              chartDataMap[dateOnly] = { date: dateOnly };
            }

            chartDataMap[dateOnly][product.id] =
              (chartDataMap[dateOnly][product.id] || 0) + value;
          }
        });
      });

      const sortedChartData = [...allTimestamps]
        .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
        .map((timestamp) => chartDataMap[timestamp]);

      setBindGraph(sortedChartData);
    }
  }, [apiResponse, widgetData]);

  const handleToggle = (id) => {
    setActiveProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Util: Format date for X-axis
  const formatXAxisTick = (tick) => {
    const dateObj = dayjs(tick);
    const today = dayjs();
    const yesterday = today.subtract(1, "day");

    if (dateObj.isSame(today, "day") || dateObj.isSame(yesterday, "day")) {
      return dateObj.format("h:mm A"); // e.g., "3:00 AM"
    } else {
      return dateObj.format("MMM D"); // e.g., "Apr 1"
    }
  };

  const isTwoHourTick = (dateString) => {
    const hour = dayjs(dateString).hour();
    return hour % 2 === 0;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Horizontal center
          alignItems: "center", // Vertical center
          height: "50vh", // Adjust height as needed
        }}
      >
        <DottedCircleLoading />
      </div>
    );
  }

  return (
    <Box p={2}>
      <Typography sx={{ fontSize: "20px" }} fontWeight="bold" mb={1}>
        Top 10 Products
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4} sx={{ marginLeft: "-13px" }}>
          <Box
            sx={{
              backgroundColor: "#e1e8f0",
              borderRadius: "16px", // Smaller border radius for tighter look
              display: "inline-flex",
              p: "1px", // 🔽 Less padding for reduced height
              mb: 1.5, // Slightly less bottom margin
            }}
          >
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              variant="standard"
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
                marginTop: "3px",
                minHeight: "26px", // 🔽 Reduced total Tabs height
              }}
            >
              {["Revenue", "Units Sold", "Refunds"].map((label, index) => (
                <Tab
                  key={index}
                  label={
                    <Typography
                      fontSize="11px"
                      fontWeight={tab === index ? 600 : "normal"}
                    >
                      {label}
                    </Typography>
                  }
                  sx={{
                    fontFamily:
                      'Nunito Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                    minHeight: "20px",
                    minWidth: "auto",
                    px: 1.2,
                    py: 0.2,
                    borderRadius: "12px",
                    fontWeight: 500,
                    fontSize: "14px !important",
                    textTransform: "none",
                    color: "#2b2f3c",
                    backgroundColor: tab === index ? "#fff" : "transparent",
                    "&.Mui-selected": {
                      color: "#000",
                    },
                    "&:hover": {
                      backgroundColor:
                        tab === index ? "#fff" : "rgb(166, 183, 201)",
                    },
                    "&:active": {
                      backgroundColor: "rgb(103, 132, 162)",
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Scrollable Product List */}
          <Stack
            direction="column"
            spacing={0.5}
            sx={{
              maxHeight: 400,
              overflowX: "hidden",
              overflowY: "auto",
              pr: 0.5,
              "&::-webkit-scrollbar": {
                height: "2px",
                width: "2px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888",
                borderRadius: "8px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#555",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1",
                borderRadius: "8px",
              },
            }}
          >
            {productList.map((product) => {
              console.log("ids", product);
              const isActive = activeProducts.includes(product.id);
              const hasAsin = Boolean(product.asin);
              const isCurrentlyCopied = copiedId === product.asin;

              return (
                <Stack
                  key={product.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ paddingBottom: "3px" }}
                >
                  <Checkbox
                    checked={isActive}
                    onChange={() => handleToggle(product.id)}
                    icon={
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          display: "block",
                          borderRadius: 3,
                          border: `2px solid ${product.color}`,
                        }}
                      />
                    }
                    checkedIcon={
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 3,
                          backgroundColor: product.color,
                          border: `2px solid ${product.color}`,
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 14 }} />
                      </span>
                    }
                    sx={{ p: 0, color: product.color }}
                  />
                  <Avatar src={product.img} sx={{ width: 28, height: 28 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <TooltipName
                      title={product?.title || product?.name}
                      onRunCerebro={runCerebro}
                      onAnalyzeListing={analyzeListing}
                    >
                      <a
                        href={`/Home/product-detail/${product?.topIds}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                          width: "40px",
                          height: "40px",
                        }}
                      >
                        <Typography
                          fontSize="14px"
                          fontWeight={600}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: "1.3em",
                            maxHeight: "2.6em",
                            cursor: "pointer",
                            whiteSpace: "normal",
                            color: "#0A6FE8",
                            fontFamily:
                              'Nunito Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                          }}
                        >
                          {product.name}
                        </Typography>
                      </a>
                    </TooltipName>

                    <Box
                      sx={{ display: "flex", alignItems: "center", mt: 0.3 }}
                    >
                      <img
                        src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
                        alt="Country Flag"
                        width={27}
                        height={16}
                        style={{ marginRight: 6 }}
                      />

                      <Typography
                        fontSize="14px"
                        color="text.secondary"
                        mr={0.5}
                      >
                        {product?.asin}
                      </Typography>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MuiTooltip
                          title={tooltipText}
                          onOpen={() => handleTooltipOpen(product.asin)}
                          arrow
                        >
                          <IconButton
                            onClick={() => handleCopy(product.asin)}
                            size="small"
                            sx={{ mr: 0.5 }}
                          >
                            <ContentCopyIcon
                              sx={{ fontSize: "14px", color: "#757575" }}
                            />
                          </IconButton>
                        </MuiTooltip>

                        <MuiTooltip
                          title={`SKU: ${product.sku}`}
                          placement="top"
                          arrow
                        >
                          <IconButton size="small" sx={{ p: 0.5 }}>
                            •{" "}
                            <InfoOutlinedIcon
                              fontSize="inherit"
                              sx={{
                                paddingLeft: "3px",
                                height: "16px",
                                width: "16px",
                              }}
                            />
                          </IconButton>
                        </MuiTooltip>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          {/* Add Note and Events */}
          <Box display="flex" justifyContent="flex-end">
            <Box display="flex" alignItems="center" gap={2}>
              {events && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: "14px",
                    textTransform: "none",
                    padding: "4px 12px",
                    color: "black", // 👈 sets the text color to black
                    borderColor: "black", // optional: sets the border color to black as well
                  }}
                  onClick={() => setOpenNote(true)}
                >
                  + Add Note
                </Button>
              )}

              <Typography
                variant="body2"
                sx={{ fontSize: "14px", lineHeight: 1 }}
              >
                Events
              </Typography>

              <Switch
                checked={events}
                onChange={() => setEvents(!events)}
                size="small"
              />
            </Box>
          </Box>

          <NoteModel open={openNote} onClose={() => setOpenNote(false)} />

          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={bindGraph}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              {/* Grid lines */}
              <CartesianGrid
                stroke="#e0e0e0"
                strokeDasharray="3 3"
                vertical={false}
              />{" "}
              {/* No vertical line on left */}
              <XAxis
                dataKey="date"
                tick={{ fontSize: "12px", fill: "#666" }}
                padding={{ left: 20, right: 20 }}
                tickFormatter={(val) => {
                  if (isTodayOrYesterday) {
                    // For hourly data, val is already in Pacific time format
                    return dayjs(val).format("h:mm A");
                  } else {
                    // For date ranges, val is just the date (YYYY-MM-DD)
                    return dayjs(val).format("MMM D");
                  }
                }}
              />
              {/* Y Axis with dynamic formatting based on tab */}
              <YAxis
                tick={{ fontSize: "12px", fill: "#666" }}
                tickFormatter={formatYAxisTick}
                axisLine={false}
                tickLine={false}
                domain={["auto", "auto"]}
                tickCount={5} // Increased from 2 to show better price ranges
              />
              {/* Tooltip */}
              <Tooltip
                content={
                  <CustomTooltip
                    productList={productList}
                    tab={tab}
                    hoveredProductId={hoveredProductId}
                  />
                }
                wrapperStyle={{ zIndex: 1000 }}
                filterNull={true}
              />
              {/* Line Series for Active Products */}
              {activeProducts.map((productId) => {
                const product = productList.find((p) => p.id === productId);
                if (!product) return null;

                return (
                  <Line
                    key={product.id}
                    type="linear"
                    dataKey={product.id} // This is the ID that will appear in payload.dataKey
                    stroke={product.color}
                    strokeWidth={2.5}
                    strokeLinecap="butt"
                    strokeLinejoin="mitter"
                    connectNulls={true}
                    isAnimationActive={false}
                    dot={
                      Object.keys(product.chart).length <= 2 ? { r: 4 } : false
                    }
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    // These are crucial for setting the hovered product
                    onMouseEnter={() => setHoveredProductId(product.id)}
                    onMouseLeave={() => setHoveredProductId(null)} // Reset when leaving this specific line
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Box>
  );
}
