import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
} from "recharts";
import DottedCircleLoading from "../../Loading/DotLoading";
import { formatCurrency } from "../../../utils/currencyFormatter";
const fontStyles = {
  fontSize: "16px",
  color: "#485E75",
  fontFamily:
    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
};
export const MARKETPLACE_COLORS = {
  Amazon: "#7190f7",
  Walmart: "#82ca9d ",
  TikTok: "#8884d8",
  Shopify: "#ffc658",
  eBay: "#ff8042",
  Tesco: "#0088fe",
  OneShop: "#00c49f",
  Wayfair: "#ffbb28",
  HomeDepot: "#ff6b6b",
  Lowes: "#a4de6c",
  custom: "#ffa5a5",
};
const CardComponent = ({
  widgetData,
  country,
  marketPlaceId,
  DateStartDate,
  DateEndDate,
  brand_id,
  product_id,
  manufacturer_name,
}) => {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const lastFetchParamsRef = useRef(null);
  const userData = localStorage.getItem("user");
  let userIds = "";
  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
  const fetchData = async () => {
    try {
      setLoading(true);
      const orderSam = await axios.get(
        `${process.env.REACT_APP_IP}ordersCountForDashboard/`,
        {
          params: {
            country: country,
            preset: widgetData,
            marketplace_id: marketPlaceId.id,
            start_date: DateStartDate,
            end_date: DateEndDate,
            user_id: userIds,
            brand_id: brand_id,
            product_id: product_id,
            manufacturer_name: manufacturer_name,
            timezone: "US/Pacific",
          },
        }
      );
      if (orderSam.data?.data) {
        const { total_order_count, ...marketplaces } = orderSam.data.data;
        setTotalOrders(total_order_count?.value || 0);
        const pieData = Object.entries(marketplaces)
          .filter(([name]) => name !== "total_order_count")
          .map(([name, data]) => ({
            name,
            value: data.count || data.value||0,
            percentage: parseFloat(data.percentage || 0),
            color: MARKETPLACE_COLORS[name] || getDefaultColor(name),
            orderValue: data.order_value || 0,
          }))
          .filter((item) => item.value > 0);
        setOrderData(pieData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  const getDefaultColor = (name) => {
    const defaultColors = [
      "#FFD4A3",
      "#B5EAD7",
      "#FFDFD3",
      "#E2F0CB",
      "#C7CEEA",
      
    ];
    const index = name.charCodeAt(0) % defaultColors.length;
    return defaultColors[index];
  };
  useEffect(() => {
    const currentParams = JSON.stringify({
      preset: widgetData,
      country,
      marketplace_id: marketPlaceId?.id,
      start_date: DateStartDate,
      end_date: DateEndDate,
      brand_id,
      product_id,
      manufacturer_name,
      user_id: userIds,
    });
    if (lastFetchParamsRef.current !== currentParams) {
      lastFetchParamsRef.current = currentParams;
      fetchData();
    }
  }, [
    widgetData,
    marketPlaceId?.id,
    DateStartDate,
    DateEndDate,
    brand_id,
    product_id,
    manufacturer_name,
    country,
  ]);
  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    value,
    percentage,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + (outerRadius * 0.3)
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#111827"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontSize: "14px",
          fontWeight: 500,
          fontFamily: fontStyles.fontFamily,
        }}
      >
        {" "}
        {name}({value}){" "}
      </text>
    );
  };
  const CustomPercentageLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: fontStyles.fontFamily,
        }}
      >
        {" "}
        {percentage.toFixed(1)}%{" "}
      </text>
    );
  };
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: "white",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {" "}
          <Typography
            sx={{ ...fontStyles, fontWeight: 600, fontSize: "14px", mb: 0.5 }}
          >
            {" "}
            {data.name}{" "}
          </Typography>{" "}
          <Typography sx={{ ...fontStyles, fontSize: "12px" }}>
            {" "}
            Order Count: {data.value}{" "}
          </Typography>{" "}
          <Typography sx={{ ...fontStyles, fontSize: "12px" }}>
            {" "}
            Order Value: {formatCurrency(data.orderValue, country)}{" "}
          </Typography>{" "}
          <Typography sx={{ ...fontStyles, fontSize: "12px" }}>
            {" "}
            Percentage: {data.percentage.toFixed(1)}%{" "}
          </Typography>{" "}
        </Box>
      );
    }
    return null;
  };
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
          width: "100%",
        }}
      >
        {" "}
        <DottedCircleLoading />{" "}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: 3,
        backgroundColor: "white",
        minHeight: 400,
      }}
    >
      {totalOrders > 0 && orderData.length > 0 && (


      <Typography
        variant="h6"
        sx={{
          ...fontStyles,
          fontWeight: 600,
          fontSize: "18px",
          color: "#111827",
          mb: 3,
          textAlign: "center",
        }}
      >
        Total Orders Distribution by Channel{" "}
      </Typography>
      )}

      {totalOrders > 0 && orderData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          {" "}
          <PieChart>
            {" "}
            <Pie
              data={orderData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={orderData.length === 1 ? 80 : 100} 
              label={orderData.length > 1 ? (props) => <CustomLabel {...props} /> : false}
              labelLine={orderData.length > 1 ? { stroke: "#cccccc", strokeWidth: 1 } : false}
            >
              {" "}
              {orderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}{" "}
              <Label
                value={totalOrders}
                position="center"
                style={{
                  fontSize: orderData.length === 1 ? "24px" : "32px",
                  fontWeight: "bold",
                  fill: "#111827",
                  fontFamily: fontStyles.fontFamily,
                }}
              />{" "}
            </Pie>{" "}
            {orderData.length > 1 && orderData.map((entry, index)  => (
              <Pie
                key={`percentage-${index}`}
                data={[entry]}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                startAngle={orderData
                  .slice(0, index)
                  .reduce(
                    (sum, item) => sum + (item.percentage / 100) * 360,
                    0
                  )}
                endAngle={orderData
                  .slice(0, index + 1)
                  .reduce(
                    (sum, item) => sum + (item.percentage / 100) * 360,
                    0
                  )}
                fill="none"
                label={(props) => (
                  <CustomPercentageLabel
                    {...props}
                    percentage={entry.percentage}
                  />
                )}
                isAnimationActive={false}
              />
            ))}{" "}
            <Tooltip content={<CustomTooltip />} />{" "}
          </PieChart>{" "}
        </ResponsiveContainer>
      ) : (
        <Box
          sx={{
            border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: 3,
                    backgroundColor: "white",
                    minHeight: 400,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
          }}
        >
          {" "}
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              fontSize: "1rem",
              fontWeight: "bold",
              color: "#888",
            }}
          >
            {" "}
            No orders found{" "}
          </Typography>{" "}
        </Box>
      )}{" "}
    </Box>
  );
};
export default CardComponent;
