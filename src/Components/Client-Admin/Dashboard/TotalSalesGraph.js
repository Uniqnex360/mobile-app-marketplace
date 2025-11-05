import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Card,
  Grid,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import CustomBarChart from "./CustomBarChart";
import DottedCircleLoading from "../../Loading/DotLoading";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { format } from "date-fns";
import DonutChart from "./DonutChart";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { fetchMarketplaceList } from "../../../utils/marketplace";
import { formatCurrency } from "../../../utils/currencyFormatter";

const TotalOrdersGraph = ({
  widgetData,
  country,
  marketPlaceId,
  DateStartDate,
  DateEndDate,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel
}) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState({});
  const [market, setMarket] = useState("");
  const [shipping, setShipping] = useState({});
  const [fulfillment, setFulfillment] = useState({});
  const [categories, setCategories] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filter, setFilter] = useState("all");
  const [salesData, setSalesData] = useState([]);
  const [chartOffset, setChartOffset] = useState(0);
  const chartContainerRef = useRef(null);

  // Add responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const userData = localStorage.getItem("user");
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleScroll = (direction) => {
    if (chartContainerRef.current) {
      const containerWidth = chartContainerRef.current.offsetWidth;
      const scrollAmount = containerWidth * 0.8; // Scroll 80% of the container width

      if (direction === "left") {
        chartContainerRef.current.scrollLeft -= scrollAmount;
        setChartOffset((prevOffset) => Math.max(0, prevOffset - scrollAmount));
      } else {
        chartContainerRef.current.scrollLeft += scrollAmount;
        setChartOffset((prevOffset) => prevOffset + scrollAmount);
      }
    }
  };
  useEffect(()=>{
      fetchMarketplaceListAPI()
    },[])

   const fetchMarketplaceListAPI = async () => {
      try {
        const categoryData = await fetchMarketplaceList(userIds,'Total salesgraph');
              setCategories(categoryData);
  
      } catch (error) {
        console.error("Error fetching marketplace list:", error);
      }
    };
    

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch marketplace categories
      // const marketplaceResponse = await axios.get(
      //   `${process.env.REACT_APP_IP}getMarketplaceList/`,
      //   { params: { user_id: userIds } }
      // );
      // const categoryData = marketplaceResponse.data.data.map((item) => ({
      //   id: item.id,
      //   name: item.name,
      //   imageUrl: item.image_url,
      // }));
      // const categoryData=await fetchMarketplaceList(userIds)
      // setCategories(categoryData);

      // Fetch sales analytics
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_IP}salesAnalytics/`,
        {
          country:country,
          preset: widgetData,
          brand_id: brand_id,
          product_id: product_id,
          marketplace_id: marketPlaceId.id,
          date_range: filter,
          start_date: DateStartDate,
          end_date: DateEndDate,
          user_id: userIds,
          timezone: "US/Pacific",
        }
      );

      if (orderResponse.data?.data) {
        setOrder(orderResponse.data.data);

        // Map the data to format it for the chart
        const formattedData = orderResponse.data.data.order_days.map(
          (item) => ({
            date: zonedTimeToUtc(item.date,"US/Pacific"), // Convert date string to Date object
            revenue: item.order_value,
            orderCount: item.order_count, // Add order count
          })
        );

        setSalesData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchData();
}, [
  widgetData,
  country,
  marketPlaceId?.id,
  DateStartDate,
  DateEndDate,
  filter,
  JSON.stringify(brand_id),
  JSON.stringify(product_id),
  JSON.stringify(manufacturer_name),
  fulfillment_channel
]);


  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: { xs: "50vh", sm: "100vh" },
        }}
      >
        <Typography variant="h6">
          <DottedCircleLoading />
        </Typography>
      </Box>
    );
  }

  

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {/* Custom Bar Chart */}
      </Grid>
      <Grid item xs={12} sm={12}>
        <Grid item xs={12} sm={12} md={12}>
          <Card
            sx={{
              mb: 2,
              width: { xs: "100%", sm: "101%" },
              maxWidth: 1500,
              position: "relative",
              marginLeft: { xs: "0", sm: "-10px" },
              minHeight: { xs: 250, sm: 300 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  mb: { xs: 0.5, sm: 0 }
                }}
              >
                💲 Total Sales
              </Typography>

              {/* <FormControl
                sx={{
                    position: 'absolute',
                    top: { xs: 8, sm: 10 },
                    right: { xs: 8, sm: 10 },
                    minWidth: { xs: 80, sm: 100 },
                    '& .MuiOutlinedInput-root': {
                        height: { xs: 28, sm: 30 },
                        padding: '5px',
                        fontSize: { xs: '0.75rem', sm: '1rem' },
                    },
                    '& .MuiSelect-icon': {
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.75rem', sm: '1rem' },
                    },
                }}
            >
                <InputLabel id="filter-label">Range</InputLabel>
                <Select
                    labelId="filter-label"
                    id="filter-select"
                    value={filter}
                    label="Filter"
                    onChange={handleFilterChange}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                </Select>
            </FormControl> */}

              <Typography
                variant="h4"
                align="right"
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: "16px", sm: "18px" }, 
                  marginBottom: { xs: 0.5, sm: 1 } 
                }}
              >
                 {formatCurrency(order?.total_sales || 0, country)}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* <IconButton 
                  onClick={() => handleScroll('left')} 
                  disabled={chartOffset === 0}
                  size={isMobile ? "small" : "medium"}
                >
                    <ArrowBackIosIcon sx={{ fontSize: { xs: '16px', sm: '24px' } }} />
                </IconButton> */}

                <div
                  ref={chartContainerRef}
                  style={{
                    width: isMobile ? "100%" : "calc(100% - 100px)",
                    scrollBehavior: "smooth",
                  }}
                >
                  {salesData.length > 0 ? (
                    <ResponsiveContainer 
                      width="100%" 
                      height={isMobile ? 180 : isTablet ? 210 : 235}
                    >
                      <LineChart 
                        data={salesData}
                        margin={{
                          top: 5,
                          right: isMobile ? 5 : 30,
                          left: isMobile ? -10 : 0,
                          bottom: 5,
                        }}
                      >
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                          angle={isMobile ? -45 : 0}
                          textAnchor={isMobile ? "end" : "middle"}
                          height={isMobile ? 60 : 30}
                          tickFormatter={(value) => {
                            const pacificTime = utcToZonedTime(
                              value,
                              "US/Pacific"
                            );
                            return format(pacificTime, isMobile ? "M/d" : "MMM dd");
                          }}
                        />

                        <YAxis 
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(value,country)}
                          labelFormatter={(label) => {
                            const pacificTime = utcToZonedTime(
                              label,
                              "US/Pacific"
                            );
                            return format(pacificTime, "MMM dd");
                          }}
                          contentStyle={{
                            fontSize: isMobile ? '11px' : '14px'
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8A56AC"
                          strokeWidth={isMobile ? 1.5 : 2}
                          dot={false} // no initial dots
                          activeDot={{ r: isMobile ? 3 : 4 }} // dot appears on hover
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: { xs: 180, sm: 225 },
                        width: "100%",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: "center",
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          fontWeight: "bold",
                          color: "#888",
                        }}
                      >
                        No total sales found
                      </Typography>
                    </Box>
                  )}
                </div>

                {/* <IconButton 
                  onClick={() => handleScroll('right')}
                  size={isMobile ? "small" : "medium"}
                >
                    <ArrowForwardIosIcon sx={{ fontSize: { xs: '16px', sm: '24px' } }} />
                </IconButton> */}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TotalOrdersGraph;