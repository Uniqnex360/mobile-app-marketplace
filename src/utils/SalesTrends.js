// ProductPerformanceContainer.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SalesDecreasing from '../Components/Client-Admin/Sales/SalesDecreasing';
import SalesIncreasing from '../Components/Client-Admin/Sales/SalesIncreasing';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import DottedCircleLoading from '../Components/Loading/DotLoading';

const ProductPerformanceContainer = ({
  userId,
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate
}) => {
  const [performanceData, setPerformanceData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProductPerformance = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProductPerformanceSummary/`,
        {
          user_id: userId,
          target_date: dayjs().format('DD/MM/YYYY'),
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
      console.error('Failed to fetch product performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductPerformance();
  }, [userId, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          width: '100%'
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