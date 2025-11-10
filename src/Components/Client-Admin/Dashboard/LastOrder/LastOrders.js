import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Tooltip as MuiTooltip,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/en-in";
import localizedFormat from "dayjs/plugin/localizedFormat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomizeTooltip from "../../CustomTooltip/CustomTooltip";
import LatestOrdersSkeleton from "./LastOrderLoading";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { formatCurrency } from "../../../../utils/currencyFormatter";

dayjs.locale("en-in");
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

// Custom Recharts Tooltip Component
const CustomTooltip = React.memo(({ active, payload }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (active && payload && payload.length && payload[0].value > 0) {
    const hour = parseInt(payload[0].payload.hour);
    const date = dayjs().hour(hour).minute(0);
    const startTime = date.format("h A");
    const endTime = date.add(1, "hour").format("h A");
    const orders = payload[0].value;
    const units = payload[0].payload.units || 0;

    return (
      <Box
        sx={{
          p: isMobile ? 1 : 1.5,
          borderRadius: 2,
          minWidth: isMobile ? 150 : 180,
          border: "1px solid rgb(161, 173, 184)",
          backgroundColor: 'white',
          zIndex: 100,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "#485E75",
            fontSize: isMobile ? "11px" : "14px",
            fontFamily:
              "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
          }}
          align="left"
        >
          {startTime} - {endTime} {date.format("MMM D,")}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            fontSize: isMobile ? "11px" : "14px"
          }}
          align="left"
        >
          <Box component="span" fontWeight="bold">
            {orders} {orders === 1 ? "Order" : "Orders"}
          </Box>{" "}
          <Box component="span" color="text.primary">
            ({units} {units === 1 ? "unit" : "units"})
          </Box>
        </Typography>
      </Box>
    );
  }
  return null;
});

// Individual Order Card Component
const OrderCard = React.memo(({ order, country }) => {
  const [tooltipText, setTooltipText] = useState("");
  const [copyLoading, setCopyLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTooltipOpen = useCallback((value) => {
    const isNumberOnly = /^\d+$/.test(value);
    const label = isNumberOnly ? "WPID" : "ASIN";
    setTooltipText(`Copy ${label}`);
  }, []);

  const handleCopy = useCallback(async (value) => {
    if (!value) return;

    const isNumberOnly = /^\d+$/.test(value);
    const label = isNumberOnly ? "WPID" : "ASIN";

    try {
      setCopyLoading(true);
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
    } finally {
      setCopyLoading(false);
    }
    setTimeout(() => {
      setTooltipText(`Copy ${label}`);
    }, 1500);
  }, []);

  const handleProductTitleClick = useCallback(() => {
    console.log(`Navigate to product detail for ID: ${order.id}`);
  }, [order.id]);

  return (
    <Card
      sx={{
        mb: 1,
        borderRadius: 1,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        fontFamily: `"Segoe UI", Roboto, sans-serif`,
        backgroundColor: 'white',
      }}
    >
      <CardContent
        sx={{
          padding: isMobile ? "6px 10px" : "8px 12px",
          "&:last-child": { paddingBottom: isMobile ? "6px" : "8px" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontSize: "10px", color: "#555" }}
          >
            {order.purchaseDate
              ? dayjs.tz(order.purchaseDate, "US/Pacific").format("h:mm A")
              : "N/A"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: "10px", fontWeight: 500 }}
          >
            Price:{" "}
            <Box component="span" sx={{ color: "grey" }}>
              {formatCurrency(order.price, country)}
            </Box>{" "}
            Quantity:{" "}
            <Box component="span" sx={{ color: "grey" }}>
              {order.quantityOrdered}
            </Box>
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Avatar
            variant="rounded"
            src={order.imageUrl}
            sx={{ width: 25, height: 25, mt: 0.5 }}
          />

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <CustomizeTooltip title={order?.title}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                onClick={handleProductTitleClick}
                sx={{
                  fontSize: "12px",
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 1,
                  whiteSpace: "normal",
                  color: "#0A6FE8",
                  fontFamily:
                    'Nunito Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                  cursor: "pointer",
                }}
              >
                {order.title}
              </Typography>
            </CustomizeTooltip>

            {/* All elements in one line */}
            <Box 
              sx={{ 
                mt: 0.5,
                display: 'flex', 
                alignItems: 'center', 
                gap: isMobile ? 0.5 : 1,
                flexWrap: 'wrap'
              }}
            >
              {/* Flag and ASIN */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <img
                  src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
                  alt="Country Flag"
                  width={20}
                  height={12}
                />
                <Typography
                  variant="caption"
                  component="span"
                  sx={{
                    fontSize: "11px",
                    color: "#485E75",
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    lineHeight: 1.3,
                  }}
                >
                  {order.asin}
                </Typography>

              {/* Copy Icon */}
              <MuiTooltip
                title={tooltipText}
                onOpen={() => handleTooltipOpen(order.asin)}
                arrow
              >
                <IconButton
                  onClick={() => handleCopy(order.asin)}
                  size="small"
                  sx={{ 
                    padding: '2px', 
                    lineHeight: 1,
                    minWidth: 'auto'
                  }}
                >
                  <ContentCopyIcon
                    sx={{ fontSize: "12px", color: "#757575" }}
                  />
                </IconButton>
              </MuiTooltip>

              {/* Info Icon */}
              <MuiTooltip
                title={`Seller SKU: ${order.sellerSku}`}
                placement="top"
                arrow
              >
                <IconButton 
                  size="small" 
                  sx={{ 
                    padding: '2px', 
                    lineHeight: 1,
                    minWidth: 'auto'
                  }}
                >
                  <InfoOutlinedIcon
                    fontSize="inherit"
                    sx={{
                      height: "14px",
                      width: "14px",
                      color: "#757575"
                    }}
                  />
                </IconButton>
              </MuiTooltip>
              </Box>

            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

export const LastOrders = React.memo(
  ({
    country,
    marketPlaceId,
    brand_id,
    product_id,
    manufacturer_name,
    fulfillment_channel,
  }) => {
    const [latestOrders, setLatestOrders] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const lastParamsRef = useRef("");

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchLatestOrders = useCallback(async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("user");
        const userId = userData ? JSON.parse(userData).id : "";
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const response = await axios.post(
          `${process.env.REACT_APP_IP}LatestOrdersTodayAPIView/`,
          {
            user_id: userId,
            timezone: userTimezone,
            marketplace_id: marketPlaceId?.id,
            brand_id: brand_id || "",
            product_id: product_id || "",
            manufacturer_name: manufacturer_name || "",
            fulfillment_channel: fulfillment_channel || "",
          }
        );

        if (response.data.status) {
          const orders = response.data.data.orders || [];
          const hourlyRaw = response.data.data.hourly_order_count || [];

          const hourlyMap = {};
          hourlyRaw.forEach((entry) => {
            const hour = new Date(entry.hour).getHours();
            hourlyMap[hour] = {
              order_count: entry.ordersCount || 0,
              total_units: entry.unitsCount || 0,
            };
          });

          const allHours = Array.from({ length: 24 }, (_, i) => i);
          const formattedChartData = allHours.map((hour) => {
            const displayHour = dayjs().hour(hour).minute(0);
            return {
              time: displayHour.format("h A"),
              orders: hourlyMap[hour]?.order_count || 0,
              units: hourlyMap[hour]?.total_units || 0,
              hour: hour,
            };
          });

          setLatestOrders(orders);
          setChartData(formattedChartData);
        } else {
          console.error("Error fetching orders:", response.data.message);
          setLatestOrders([]);
          setChartData([]);
        }
      } catch (error) {
        console.error("Error fetching latest orders:", error);
        setLatestOrders([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }, [
      marketPlaceId,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
    ]);

    useEffect(() => {
      const currentParams = JSON.stringify({
        marketPlaceId,
        brand_id,
        product_id,
        manufacturer_name,
        fulfillment_channel,
      });

      if (lastParamsRef.current !== currentParams) {
        lastParamsRef.current = currentParams;
        fetchLatestOrders();
      }
    }, [
      marketPlaceId,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
      fetchLatestOrders
    ]);

    return (
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
              width: "100%",
            }}
          >
            <LatestOrdersSkeleton />
          </Box>
        ) : (
          <>
            {/* Chart Section */}
            <Box mb={2}>
              <Typography
                variant="h6"
                sx={{ fontSize: "18px" }}
                mb={1}
              >
                {chartData.length > 0 ? "Latest Orders" : null}
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontSize: "12px", color: 'text.secondary' }}
                mb={1}
              >
                Showing all orders from the last 24 hours
              </Typography>
              <Box sx={{ borderRadius: 2, backgroundColor: 'white', p: 1 }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={250}
                  >
                    <BarChart
                      data={chartData}
                      barCategoryGap="10%"
                      margin={{
                        top: 10,
                        right: 5,
                        left: -10,
                        bottom: 5
                      }}
                    >
                      <CartesianGrid
                        vertical={false}
                        horizontal={true}
                        stroke="#e0e0e0"
                      />

                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: "10px" }}
                        tickLine={false}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tickFormatter={(value, index) => {
                          const hour = chartData[index]?.hour;
                          return hour % 6 === 0 ? value : "";
                        }}
                      />

                      <YAxis
                        tick={{ fontSize: "10px" }}
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="orders"
                        fill="#8A2BE2"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 2, fontSize: "12px" }}
                  >
                    No order data available for the last 24 hours.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Product Cards - List Section (now below the chart) */}
            <Box mt={2}>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "14px",
                  color: "grey",
                  fontWeight: 600
                }}
              >
               {dayjs().tz("US/Pacific").format("MMMM D")}
              </Typography>
              <Box
                sx={{
                  maxHeight: "350px",
                  overflowY: "auto",
                  borderRadius: 2,
                  backgroundColor: 'white',
                }}
              >
               {latestOrders.map((order, index) => (
                 <OrderCard key={`${order.id}-${index}`} order={order} country={country} />
               ))}
               {latestOrders.length === 0 && (
                 <Typography variant="body2" color="text.secondary" p={2} textAlign="center">
                   No recent orders today.
                 </Typography>
               )}
              </Box>
            </Box>
          </>
        )}
      </Box>
    );
  }
);

export default LastOrders;