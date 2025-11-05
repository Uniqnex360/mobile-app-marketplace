import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { formatCurrency } from '../../../../utils/currencyFormatter';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Box,
  Switch,
  Button,
  Typography,
  ListItemText,
  MenuItem,
  IconButton,
  ListItemIcon,
  Menu,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {
  Download as DownloadIcon,
  Download,
  Delete,
  PictureAsPdf as PdfIcon,
  Remove as RemoveIcon,
  MoreVert,
} from "@mui/icons-material";
import ImageIcon from "@mui/icons-material/Image";
import DottedCircleLoading from "../../../Loading/DotLoading";
import NoteModel from "../NoteModel";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getCurrencySymbol } from "../../../../utils/currencySymbol";

const ProfitAndLoss = ({
  widgetData,
  country,
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
}) => {
  const [expanded, setExpanded] = useState(null);
  const [summary, setSummary] = useState(null);
  const [graph, setGraph] = useState(null);
  const [summaryOther, setSummaryOther] = useState(null);
  const [summaryDate, setSummaryDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const [loadingBody, setLoadingBody] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  const [events, setEvents] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Add theme and media query hooks for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  dayjs.extend(utc);
  let lastParamsRef = useRef("");

  const openDownloadMenu = Boolean(anchorEl);
  const downloadButtonRef = useRef(null);
  const chartContainerRef = useRef(null); // Ref for the chart container
  const userData = localStorage.getItem("user");
  let userIds = "";
  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveWidget = () => {
    console.log("Remove widget clicked");
    // Implement your remove widget logic here
  };

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setAnchorEl(null);
  };

  const handleDownloadOptionClick = async (option) => {
    console.log(`Download option "${option}" clicked`);
    handleCloseDownloadMenu();

    if (option === "PDF" && chartContainerRef.current) {
      setLoading(true);
      try {
        const canvas = await html2canvas(chartContainerRef.current);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const imgWidth = pdf.internal.pageSize.getWidth() - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save(
          `Profit_And_Loss_${new Date().toISOString().slice(0, 10)}.pdf`
        );
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setLoading(false);
      }
    } else if (option === "PNG" && chartContainerRef.current) {
      try {
        const canvas = await html2canvas(chartContainerRef.current);
        const link = document.createElement("a");
        link.download = `Profit_And_Loss_Chart_${new Date()
          .toISOString()
          .slice(0, 10)}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Error generating PNG:", error);
      }
    } else if (option === "JPEG" && chartContainerRef.current) {
      try {
        const canvas = await html2canvas(chartContainerRef.current);
        const link = document.createElement("a");
        link.download = `Profit_And_Loss_Chart_${new Date()
          .toISOString()
          .slice(0, 10)}.jpeg`;
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
      } catch (error) {
        console.error("Error generating JPEG:", error);
      }
    } else if (option === "CSV") {
      // Implement CSV download logic here using processedChartData and potentially summary data
      const csvData = [
        "Metric,Current,Previous,Delta",
        `Gross Revenue,<span class="math-inline">\{summary?\.grossRevenue?\.current?\.toFixed\(2\)\},</span>{summary?.grossRevenue?.previous?.toFixed(2)},${summary?.grossRevenue?.delta?.toFixed(
          2
        )}`,
        `Expenses,<span class="math-inline">\{summary?\.expenses?\.current?\.toFixed\(2\)\},</span>{summary?.expenses?.previous?.toFixed(2)},${summary?.expenses?.delta?.toFixed(
          2
        )}`,
        `Net Profit,<span class="math-inline">\{summary?\.netProfit?\.current?\.toFixed\(2\)\},</span>{summary?.netProfit?.previous?.toFixed(2)},${summary?.netProfit?.delta?.toFixed(
          2
        )}`,
        `COGS,<span class="math-inline">\{summaryOther?\.current?\.cogs?\.toFixed\(2\)\},</span>{summaryOther?.previous?.cogs?.toFixed(2)},${(
          summaryOther?.current?.cogs - summaryOther?.previous?.cogs
        )?.toFixed(2)}`,
        `Refunds,<span class="math-inline">\{summary?\.refunds?\.current\},</span>{summary?.refunds?.previous},${summary?.refunds?.delta}`,
        `Base Price,<span class="math-inline">\{summaryOther?\.current?\.base_price?\.toFixed\(2\)\},</span>{summaryOther?.previous?.base_price?.toFixed(2)},${(
          summaryOther?.current?.base_price - summaryOther?.previous?.base_price
        )?.toFixed(2)}`,
        `Giftwrap Price,<span class="math-inline">\{summaryOther?\.current?\.giftwrapPrice?\.toFixed\(2\)\},</span>{summaryOther?.previous?.giftwrapPrice?.toFixed(2)},${(
          summaryOther?.current?.giftwrapPrice -
          summaryOther?.previous?.giftwrapPrice
        )?.toFixed(2)}`,
        `Total Tax,<span class="math-inline">\{summaryOther?\.current?\.totalTax?\.toFixed\(2\)\},</span>{summaryOther?.previous?.totalTax?.toFixed(2)},${(
          summaryOther?.current?.totalTax - summaryOther?.previous?.totalTax
        )?.toFixed(2)}`,
        `Shipping,<span class="math-inline">\{summaryOther?\.current?\.shipping?\.toFixed\(2\)\},</span>{summaryOther?.previous?.shipping?.toFixed(2)},${(
          summaryOther?.current?.shipping_cost -
          summaryOther?.previous?.shipping_cost
        )?.toFixed(2)}`,
        `Shipping Chargeback,<span class="math-inline">\{summaryOther?\.current?\.shippingChargeback?\.toFixed\(2\)\},</span>{summaryOther?.previous?.shippingChargeback?.toFixed(2)},${(
          summaryOther?.current?.shippingChargeback -
          summaryOther?.previous?.shippingChargeback
        )?.toFixed(2)}`,
        `Giftwrap Chargeback,<span class="math-inline">\{summaryOther?\.current?\.giftwrapChargeback?\.toFixed\(2\)\},</span>{summaryOther?.previous?.giftwrapChargeback?.toFixed(2)},${(
          summaryOther?.current?.giftwrapChargeback -
          summaryOther?.previous?.giftwrapChargeback
        )?.toFixed(2)}`,
        // `Reimbursements,<span class="math-inline">\{summaryOther?\.current?\.reimbursements?\.toFixed\(2\)\},</span>{summaryOther?.previous?.reimbursements?.toFixed(2)},${(summaryOther?.current?.reimbursements - summaryOther?.previous?.reimbursements)?.toFixed(2)}`,
        `Channel Fees,<span class="math-inline">\{summaryOther?\.current?\.channel_fee?\.toFixed\(2\)\},</span>{summaryOther?.previous?.channel_fee?.toFixed(2)},${(
          summaryOther?.current?.channel_fee -
          summaryOther?.previous?.channel_fee
        )?.toFixed(2)}`,
        // `Promo Value,<span class="math-inline">\{summaryOther?\.current?\.promoValue?\.toFixed\(2\)\},</span>{summaryOther?.previous?.promoValue?.toFixed(2)},${(summaryOther?.current?.promoValue - summaryOther?.previous?.promoValue)?.toFixed(2)}`,
        // `PPC Costs,<span class="math-inline">\{summaryOther?\.current?\.ppcCosts?\.toFixed\(2\)\},</span>{summaryOther?.previous?.ppcCosts?.toFixed(2)},${(summaryOther?.current?.ppcCosts - summaryOther?.previous?.ppcCosts)?.toFixed(2)}`,
        `Total Tax (Cost),<span class="math-inline">\{summaryOther?\.current?\.totalTaxCost?\.toFixed\(2\)\},</span>{summaryOther?.previous?.totalTaxCost?.toFixed(2)},${(
          summaryOther?.current?.totalCosts - summaryOther?.previous?.totalCosts
        )?.toFixed(2)}`,
        Object.keys(processedChartData[0] || {}).join(","),
        ...processedChartData.map((item) => Object.values(item).join(",")),
      ].join("\n");
      const link = document.createElement("a");
      link.download = `Profit_And_Loss_Data_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;
      link.click();
    } else if (option === "XLS") {
      // Implement XLS download logic here (you might need a library like xlsx)
      console.log(
        "XLS download logic needs implementation with all data fields"
      );
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}profitLossChartCsv/`,
        {
          user_id: userIds,
          preset: widgetData,
          start_date: DateStartDate,
          end_date: DateEndDate,
          marketplace_id: marketPlaceId.id,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          timezone: systemTimeZone,
        },
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, "profitLossChart.csv");
    } catch (error) {
      console.error("CSV Download Error:", error);
    }
  };

  const handleDownloadXLS = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}profitLossExportXl/`,
        {
          user_id: userIds,
          preset: widgetData,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          marketplace_id: marketPlaceId.id,
          timezone: systemTimeZone,
        },
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "profitLossChart.xlsx");
    } catch (error) {
      console.error("XLS Download Error:", error);
    }
  };

  useEffect(() => {
    const currentParams = JSON.stringify({
      marketPlaceId,
      widgetData,
      brand_id,
      country,
      product_id,
      manufacturer_name,
      fulfillment_channel,
      DateStartDate,
      DateEndDate,
    });

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;

      fetchProfitAndLossDetails();
      fetchProfitAndLossGraph();
    }
  }, [
    marketPlaceId,
    widgetData,
    brand_id,
    product_id,
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
    country
  ]);

  const fetchProfitAndLossDetails = async () => {
    setLoadingBody(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProfitAndLossDetails/`,
        {
          country:country,
          preset: widgetData,
          start_date: DateStartDate,
          end_date: DateEndDate,
          marketplace_id: marketPlaceId.id,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          timezone: "US/Pacific",
        }
      );
      
      // Add null checks for the response data
      const responseData = response?.data || {};
      const customData = responseData?.custom || {};
      setSummaryDate(customData?.dateRanges || null);
      setSummaryOther(customData?.netProfitCalculation || null);
      setSummary(customData?.summary || null);
    } catch (error) {
      console.error("Error fetching profit and loss details:", error);
      // Set default values when error occurs
      setSummaryDate(null);
      setSummaryOther(null);
      setSummary(null);
    } finally {
      setLoadingBody(false);
    }
  };

  const fetchProfitAndLossGraph = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}profit_loss_chart/`,
        {
          country:country,
          preset: widgetData,
          marketplace_id: marketPlaceId.id,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          timezone: systemTimeZone,
        }
      );
      setGraph(response.data.graph);
    } catch (error) {
      console.error("Error fetching profit and loss graph:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extracting dates
  const fromDate = summaryDate?.current?.from;
  const toDate = summaryDate?.current?.to;

  // Format only the exact UTC date — no time zone conversion
  const formattedCurrentDate = fromDate
    ? dayjs.utc(fromDate).format("MMM DD, YYYY")
    : "";

  const formattedDateRange =
    fromDate && toDate
      ? `${dayjs.utc(fromDate).format("MMM DD, YYYY")} - ${dayjs
          .utc(toDate)
          .format("MMM DD, YYYY")}`
      : "";
  const xAxisTickFormatter = (value) => {
    const dateObj = dayjs(Number.isFinite(value)?value:new Date(value))
    if (graph && graph.length>0 && Object.keys(graph[0].values).every((k)=>
    dayjs(k).format('YYYY-MM-DD')===dayjs(Object.keys(graph[0].values)[0]).format('YYYY-MM-DD')))
    {
      return dateObj.format("HH:mm")
    }

    return dateObj.format("MMM D");
  };

  const calculateTicks = () => {
    if (!processedChartData || processedChartData.length === 0) {
      return [];
    }

    if (widgetData === "Today" || widgetData === "Yesterday") {
      const timestamps = processedChartData.map((item) => item.date);
      const minTime = dayjs(Math.min(...timestamps));
      const maxTime = dayjs(Math.max(...timestamps));
      const diffHours = maxTime.diff(minTime, "hour");
      const interval = Math.ceil(diffHours / 6) || 4;

      const ticks = [];
      for (let i = 0; i <= 24; i += interval) {
        const tickTime = minTime.add(i, "hour").valueOf();
        if (tickTime >= minTime.valueOf() && tickTime <= maxTime.valueOf()) {
          ticks.push(tickTime);
        }
      }
      return ticks.filter((v, i, a) => a.indexOf(v) === i);
    } else {
      const uniqueDates = [
        ...new Set(
          processedChartData.map((item) =>
            dayjs(item.date).format("YYYY-MM-DD")
          )
        ),
      ];
      if (uniqueDates.length <= 5) {
        return processedChartData.map((item) => item.date);
      } else {
        const interval = Math.ceil(uniqueDates.length / 5);
        return uniqueDates
          .filter((date, index) => index % interval === 0)
          .map((dateStr) => dayjs(dateStr).valueOf());
      }
    }
  };

  const yAxisTickFormatter = (value) => {
  const currencySymbol = getCurrencySymbol(country);
  return `${currencySymbol}${value}`;
};

  const yAxisUnitsTickFormatter = (value) => {
    return value;
  };

  const processedChartData =
    graph?.length > 0
      ? Object.keys(graph[0].values).map((key) => {
          const dataPoint = { date: new Date(key).getTime() };
          graph.forEach((item) => {
            dataPoint[item.metric] = item.values[key];
          });
          return dataPoint;
        })
      : [];

  const CustomTooltip = ({ active, payload, label }) => {
  const currencySymbol = getCurrencySymbol(country);
  
  if (active && payload && payload.length) {
    const dateObj = dayjs(label);
    const today = dayjs().format("YYYY-MM-YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    const valueDate = dateObj.format("YYYY-MM-DD");

    const isTodayOrYesterday =
      (valueDate === today && widgetData === "Today") ||
      (valueDate === yesterday && widgetData === "Yesterday");

    const dateLabel = isTodayOrYesterday ? (
      <>
        {dateObj.format("MMM D")} (<span>{dateObj.format("HH:mm")}</span>)
      </>
    ) : (
      dateObj.format("MMM DD, YY")
    );

    return (
      <div
        style={{
          backgroundColor: "#fff",
          padding: isMobile ? "8px" : "10px",
          width: isMobile ? "180px" : "230px",
          border: "1px solid #ccc",
          fontSize: isMobile ? "12px" : "14px",
        }}
      >
        <p className="label" style={{ margin: "0 0 8px 0" }}>
          {dateLabel}
        </p>
        {payload.map((item, index) => (
          <div
            key={`item-${index}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                color: "#485E75",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  marginRight: "6px",
                }}
              />
              {formatMetricName(item.name)}
            </span>
            <span style={{ color: "#000", fontWeight: "bold" }}>
              {item.name === "units" || item.name === 'Orders'
                ? item.value
                : `${currencySymbol}${Number(item.value).toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

  function formatMetricName(metric) {
    switch (metric) {
      case "grossRevenue":
        return "Gross Revenue";
      case "estimatedPayout":
        return "Estimated Payout";
      case "expenses":
        return "Expenses";
      case "netProfit":
        return "Net Profit";
      case "units":
        return "Orders";
      // case "ppcSales": return "PPC Sales";
      default:
        return metric;
    }
  }

  const summaryData = [
    {
      label: "Base Price",
      value: formatCurrency(summaryOther?.current?.base_price,country),
      delta: (
        summaryOther?.current?.base_price - summaryOther?.previous?.base_price
      )?.toFixed(2),
    },
    // { label: "Giftwrap Price", value: `$${summaryOther?.current?.giftwrapPrice?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.giftwrapPrice - summaryOther?.previous?.giftwrapPrice)?.toFixed(2) },
    {
      label: "Total Tax",
      
      value:formatCurrency(summaryOther?.current?.totalTax,country),
      delta: (
        summaryOther?.current?.totalTax - summaryOther?.previous?.totalTax
      )?.toFixed(2),
    },
    {
      label: "Shipping",
      
      value: formatCurrency(summaryOther?.current?.shipping_cost,country),
      delta: (
        summaryOther?.current?.shipping_cost -
        summaryOther?.previous?.shipping_cost
      )?.toFixed(2),
    },
    // { label: "Shipping Chargeback", value: `$${summaryOther?.current?.shippingChargeback?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.shippingChargeback - summaryOther?.previous?.shippingChargeback)?.toFixed(2) },
    // { label: "Giftwrap Chargeback", value: `$${summaryOther?.current?.giftwrapChargeback?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.giftwrapChargeback - summaryOther?.previous?.giftwrapChargeback)?.toFixed(2) },
    {
      label: "Gross Revenue",
      
      value: formatCurrency(summaryOther?.current?.gross,country),
      delta: summary?.grossRevenue?.delta?.toFixed(2),
    },
    // { label: "Reimbursements", value: `$${summaryOther?.current?.reimbursements?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.reimbursements - summaryOther?.previous?.reimbursements)?.toFixed(2) },
    {
      label: "Channel Fees",
      
      value: formatCurrency(summaryOther?.current?.channel_fee,country),
      delta: (
        summaryOther?.current?.channel_fee - summaryOther?.previous?.channel_fee
      )?.toFixed(2),
    },
    {
      label: "Refunds",
      
      value:formatCurrency(summaryOther?.current?.productRefunds,country),
      delta: (
        summaryOther?.current?.productRefunds -
        summaryOther?.previous?.productRefunds
      )?.toFixed(2),
    },
    // { label: "Promo Value", value: `$${summaryOther?.current?.promoValue?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.promoValue - summaryOther?.previous?.promoValue)?.toFixed(2) },
    // { label: "Estimated Payout", value: `$${summary?.netProfit?.current?.estimatedPayout?.toFixed(2) ?? '0.00'}` },
    {
      label: "COGS",
     
      value:  formatCurrency(summaryOther?.current?.cogs,country),
      delta: (
        summaryOther?.current?.cogs - summaryOther?.previous?.cogs
      )?.toFixed(2),
    },
    // { label: "PPC Costs", value: `$${(summaryOther?.current?.ppcProductCost + summaryOther?.current?.ppcBrandsCost + summaryOther?.current?.ppcDisplayCost + summaryOther?.current?.ppcStCost)?.toFixed(2) ?? '0.00'}`, delta: ((summaryOther?.current?.ppcProductCost + summaryOther?.current?.ppcBrandsCost + summaryOther?.current?.ppcDisplayCost + summaryOther?.current?.ppcStCost) - (summaryOther?.previous?.ppcProductCost + summaryOther?.previous?.ppcBrandsCost + summaryOther?.previous?.ppcDisplayCost + summaryOther?.previous?.ppcStCost))?.toFixed(2) },
    {
      label: "Total Tax (Cost)",
      
      value: formatCurrency(summaryOther?.current?.totalTax,country),
      delta: (
        summaryOther?.current?.totalCosts -
        summaryOther?.previous?.totalTaxWithheld
      )?.toFixed(2),
    },
      {
  label: "Expenses",
  value: formatCurrency(summary?.expenses?.current,country),
  delta: summary?.expenses?.delta?.toFixed(2),
},
    {
      label: "Net Profit",
      
      value: formatCurrency(summary?.netProfit?.current,country),
      delta: summary?.netProfit?.delta?.toFixed(2),
    },
  ];

  const getCircleColor = (label) => {
    if (label === "Gross Revenue") return "rgb(106, 42, 192)";
    if (label === "Expenses") return "red";
    if (label === "Net Profit" || label === "Estimated Payout") return "green";
    return "transparent";
  };

  const getFontSize = (label) => {
    return label === "Gross Revenue" ||
      label === "Expenses" ||
      label === "Net Profit"
      ? isMobile ? "14px" : "16px"
      : isMobile ? "12px" : "14px";
  };

  const getFontColor = (label) => {
    return label === "Gross Revenue" ||
      label === "Expenses" ||
      label === "Net Profit"
      ? "rgb(19, 25, 31)"
      : "rgb(72, 94, 117)";
  };

  const toggleExpansion = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const hasUnits = graph?.some((g) => g.metric === "units");
  const hasOtherMetrics = graph?.some((g) => g.metric !== "units");

  return (
    <Box
      sx={{
        padding: { xs: "10px", sm: "15px", md: "20px" },
        fontFamily:
          "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
        margin: { xs: "10px 0", sm: "15px 0" },
      }}
    >
      {loadingBody ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: { xs: 300, sm: 400 },
            width: "100%",
          }}
        >
          <DottedCircleLoading />
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "flex-start" },
              marginBottom: 2,
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Box sx={{ marginTop: { xs: "0", sm: "-30px" },paddingTop: { xs: "10px", sm: "15px" }  }}>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: "1.2em", sm: "1.5em" },
                  fontWeight: "bold",
                  marginBottom: "15px",
                  color: "#19232E",
                }}
              >
                P&L
              </Typography>

              <Typography
                sx={{
                  marginBottom: "15px",
                  color: "#485E75",
                  fontSize: { xs: "12px", sm: "14px" },
                  mb: 0.5,
                }}
              >
                {widgetData === "Today" || widgetData === "Yesterday"
                  ? formattedCurrentDate
                  : formattedDateRange}
              </Typography>
            </Box>
            <Box 
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
                flexWrap: "wrap",
              }}
            >
              {/* {events && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: { xs: "12px", sm: "14px" },
                    textTransform: "none",
                    padding: { xs: "3px 8px", sm: "4px 12px" },
                    color: "black",
                    borderColor: "black",
                  }}
                  onClick={() => setOpenNote(true)}
                >
                  + Add Note
                </Button>
              )} */}
              {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: { xs: "12px", sm: "14px" }, lineHeight: 1 }}
                >
                  Events
                </Typography>
                <Switch
                  checked={events}
                  onChange={() => setEvents(!events)}
                  size="small"
                />
              </Box> */}
              <Box>
                <IconButton
                  aria-label="download"
                  size="small"
                  onClick={handleDownloadClick}
                  ref={downloadButtonRef}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  id="download-menu"
                  anchorEl={anchorEl}
                  open={openDownloadMenu}
                  onClose={handleCloseDownloadMenu}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <Box sx={{ borderBottom: "1px solid #ddd" }}>
                    <MenuItem
                      sx={{
                        color: "#485E75",
                        fontFamily: "'Nunito Sans', sans-serif",
                        fontSize: { xs: 12, sm: 14 },
                      }}
                      onClick={() => handleDownloadOptionClick("PNG")}
                    >
                      <ListItemIcon>
                        <ImageIcon
                          sx={{
                            width: "18px",
                            height: "18px",
                            paddingRight: "3px",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Download PNG image" />
                    </MenuItem>
                    <MenuItem
                      sx={{
                        color: "#485E75",
                        fontFamily: "'Nunito Sans', sans-serif",
                        fontSize: { xs: 12, sm: 14 },
                      }}
                      onClick={() => handleDownloadOptionClick("JPEG")}
                    >
                      <ListItemIcon>
                        <ImageIcon
                          sx={{
                            width: "18px",
                            height: "18px",
                            paddingRight: "3px",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Download JPEG image" />
                    </MenuItem>
                    <MenuItem
                      sx={{
                        color: "#485E75",
                        fontFamily: "'Nunito Sans', sans-serif",
                        fontSize: { xs: 12, sm: 14 },
                      }}
                      onClick={() => handleDownloadOptionClick("PDF")}
                    >
                      <ListItemIcon sx={{ fontSize: "14px" }}>
                        <PdfIcon
                          sx={{
                            width: "18px",
                            height: "18px",
                            paddingRight: "-7px",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Download PDF document" />
                    </MenuItem>
                  </Box>
                  <Box sx={{ borderBottom: "1px solid #ddd" }}>
                    <MenuItem
                      onClick={() => {
                        handleDownloadCSV();
                        handleClose();
                      }}
                      sx={{
                        color: "#485E75",
                        fontFamily: "'Nunito Sans', sans-serif",
                        fontSize: { xs: 12, sm: 14 },
                      }}
                    >
                      <ListItemIcon>
                        <InsertDriveFileIcon
                          sx={{
                            width: "18px",
                            height: "18px",
                            paddingRight: "3px",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Download CSV" />
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDownloadXLS();
                        handleClose();
                      }}
                      sx={{
                        color: "#485E75",
                        fontFamily: "'Nunito Sans', sans-serif",
                        fontSize: { xs: 12, sm: 14 },
                      }}
                    >
                      <ListItemIcon>
                        <Download
                          sx={{
                            width: "18px",
                            height: "18px",
                            paddingRight: "3px",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Download XLS" />
                    </MenuItem>
                  </Box>
                  <MenuItem onClick={handleRemoveWidget}>
                    <ListItemIcon>
                      <Delete
                        sx={{
                          width: "18px",
                          height: "18px",
                          paddingRight: "3px",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText primary="Remove" />
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Box>
          <NoteModel open={openNote} onClose={() => setOpenNote(false)} />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "flex-start",
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "35%" },
                paddingRight: { xs: 0, sm: "20px" },
                maxHeight: { xs: 300, sm: 400 },
                overflowX: "hidden",
                borderRight: { xs: "none", sm: "1px solid lightgray" },
                borderBottom: { xs: "1px solid lightgray", sm: "none" },
                paddingBottom: { xs: 2, sm: 0 },
                marginBottom: { xs: 2, sm: 0 },
                overflowY: "auto",
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgb(212, 219, 225)",
                  borderRadius: 10,
                  minHeight: 4,
                  "&:hover": {
                    backgroundColor: "rgb(189, 198, 207)",
                  },
                  "&:active": {
                    backgroundColor: "rgb(161, 180, 201)",
                  },
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "8px",
                },
              }}
            >
              <Box>
                {summaryData.map((item, idx) => (
                  <Box key={idx} sx={{ marginBottom: "12px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            width: isMobile ? "8px" : "10px",
                            height: isMobile ? "8px" : "10px",
                            borderRadius: "50%",
                            backgroundColor: getCircleColor(item.label),
                            display: "inline-block",
                            marginRight: "8px",
                          }}
                        />
                        <span 
                          style={{ 
                            color: getFontColor(item.label),
                            fontSize: getFontSize(item.label),
                          }}
                        >
                          {item.label}
                        </span>
                      </Box>
                      <span 
                        style={{ 
                          fontWeight: "bold", 
                          color: "#19232E",
                          fontSize: isMobile ? "12px" : "14px",
                        }}
                      >
                        {item.value}
                      </span>
                    </Box>
                    {expanded === idx && item.delta !== undefined && (
                      <Box
                        sx={{
                          marginLeft: "18px",
                          marginTop: "8px",
                          color: "#637381",
                          fontSize: isMobile ? "0.8em" : "0.9em",
                        }}
                      >
                        <span>Change: </span>
                        <span
                          style={{ color: item.delta < 0 ? "red" : "green" }}
                        >
                          {item.delta < 0
                            ? `-${Math.abs(item.delta).toFixed(2)}`
                            : `+${Math.abs(item.delta).toFixed(2)}`}
                        </span>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", sm: "65%" },
                height: { xs: "300px", sm: "450px" },
              }}
              ref={chartContainerRef}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={processedChartData}
                  margin={{
                    top: 10,
                    right: isMobile ? 10 : hasUnits ? 50 : 30,
                    left: isMobile ? -10 : 0,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid
                    horizontal={true}
                    vertical={false}
                    stroke="#ccc"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="date"
                    padding={{ left: isMobile ? 10 : 20, right: isMobile ? 10 : 20 }}
                    tickFormatter={xAxisTickFormatter}
                    axisLine={true}
                    tickLine={false}
                    ticks={calculateTicks()}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                  />
                  {hasOtherMetrics && (
                    <YAxis
                      tickFormatter={yAxisTickFormatter}
                      axisLine={false}
                      tickLine={false}
                      yAxisId="left"
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                  )}
                  {hasUnits && (
                    <YAxis
                      tickFormatter={yAxisUnitsTickFormatter}
                      axisLine={false}
                      tickLine={false}
                      orientation="right"
                      yAxisId="right"
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  {graph?.find((g) => g.metric === "grossRevenue") && (
                    <Line
                      type="monotone"
                      dataKey="grossRevenue"
                      stroke="#6F42C1"
                      name="Gross Revenue"
                      strokeWidth={isMobile ? 1.5 : 2}
                      dot={false}
                      activeDot={{ r: isMobile ? 3 : 5 }}
                      yAxisId="left"
                    />
                  )}
                  {graph?.find((g) => g.metric === "expenses") && (
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#DC3545"
                      name="Expenses"
                      strokeWidth={isMobile ? 1.5 : 2}
                      dot={false}
                      activeDot={{ r: isMobile ? 3 : 5 }}
                      yAxisId="left"
                    />
                  )}
                  {graph?.find((g) => g.metric === "netProfit") && (
                    <Line
                      type="monotone"
                      dataKey="netProfit"
                      stroke="#198754"
                      name="Net Profit"
                      strokeWidth={isMobile ? 1.5 : 2}
                      dot={false}
                      activeDot={{ r: isMobile ? 3 : 5 }}
                      yAxisId="left"
                    />
                  )}
                  {graph?.find((g) => g.metric === "units") && (
                    <Line
                      type="monotone"
                      dataKey="units"
                      stroke="#b8b8ff"
                      name="Orders"
                      strokeWidth={isMobile ? 1.5 : 2}
                      dot={false}
                      activeDot={{ r: isMobile ? 3 : 5 }}
                      yAxisId="right"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProfitAndLoss;