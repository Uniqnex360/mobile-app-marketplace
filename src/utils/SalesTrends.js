import React, { useState, useEffect } from "react";
import axios from "axios";
import SalesDecreasing from "../Components/Client-Admin/Sales/SalesDecreasing";
import SalesIncreasing from "../Components/Client-Admin/Sales/SalesIncreasing";
import { Box } from "@mui/material";
import DottedCircleLoading from "../Components/Loading/DotLoading";
const ProductPerformanceContainer = ({
  userId,
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
  country,
}) => {
  const [performanceData, setPerformanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const stableBrandId = JSON.stringify(brand_id);
  const stableProductId = JSON.stringify(product_id);
  const stableManufacturer = JSON.stringify(manufacturer_name);
  const fetchProductPerformance = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProductPerformanceSummary/`,
        {
          country: country,
          user_id: userId,
          target_date: "01/09/2025",
          marketplace_id: marketPlaceId.id,
          brand_id,
          product_id,
          manufacturer_name,
          fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      );
      setPerformanceData(response.data);
    } catch (error) {
      console.error("Failed to fetch product performance data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProductPerformance();
  }, [
    userId,
    marketPlaceId,
    stableBrandId,
    stableProductId,
    stableManufacturer,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
    country,
  ]);
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          width: "100%",
        }}
      >
        <DottedCircleLoading />
      </Box>
    );
  }
  return (
    <>
      <Box sx={{ paddingBottom: "10px", width: "99%" }}>
        <SalesIncreasing
          country={country}
          marketPlaceId={marketPlaceId}
          brand_id={brand_id}
          product_id={product_id}
          manufacturer_name={manufacturer_name}
          fulfillment_channel={fulfillment_channel}
          DateStartDate={DateStartDate}
          DateEndDate={DateEndDate}
          products={performanceData.top_3_products || []}
        />
      </Box>
      <Box sx={{ paddingBottom: "10px", width: "99%" }}>
        <SalesDecreasing
          country={country}
          marketPlaceId={marketPlaceId}
          brand_id={brand_id}
          product_id={product_id}
          manufacturer_name={manufacturer_name}
          fulfillment_channel={fulfillment_channel}
          DateStartDate={DateStartDate}
          DateEndDate={DateEndDate}
          products={performanceData.least_3_products || []}
        />
      </Box>
    </>
  );
};
export default ProductPerformanceContainer;
