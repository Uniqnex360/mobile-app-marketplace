import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Collapse,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  ListItemText,
  useTheme,
  useMediaQuery,
  TableCell,
  TableBody,
  TableRow,
  Avatar,
  Table,
  TableHead,
} from "@mui/material";
import {
  Download,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVert,
} from "@mui/icons-material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { saveAs } from "file-saver";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import MarketplaceChart from "./MarketplaceChart";
import CardComponent from "../CardComponet";
import DottedCircleLoading from "../../../Loading/DotLoading";
import NetProfitChart from "./NetProfitChart";
import { formatCurrency } from "../../../../utils/currencyFormatter";

dayjs.extend(utc);
function MarketplaceRow({ row, index }) {
  const [open, setOpen] = useState(false);
  const theme=useTheme()
  const isMobile=useMediaQuery(theme.breakpoints.down('sm'))

  const isFirstRow = index === 0;
  const cellStyle = {
    ...fontStyles,
    color: "black",
    fontWeight: 600,
    fontSize: "14px",
  };
  const getDataForMobile = () => [
    { label: "Marketplace", value: row.marketplace, isHeader: true },
    { label: "Gross Revenue", value: formatCurrency(row.currency_list[0]?.grossRevenue), color: row.currency_list[0]?.grossRevenue < 0 ? "red" : "black" },
    { label: "Expenses", value: formatCurrency(row.currency_list[0]?.expenses), color: row.currency_list[0]?.expenses < 0 ? "red" : "black" },
    { label: "COGS", value: formatCurrency(row.currency_list[0]?.total_cogs), color: row.currency_list[0]?.total_cogs < 0 ? "red" : "black" },
    { label: "Net Profit", value: formatCurrency(row.currency_list[0]?.netProfit), color: row.currency_list[0]?.netProfit < 0 ? "red" : "black" },
    { label: "Margin", value: `${row.currency_list[0]?.margin?.toFixed(2)}%` },
    { label: "ROI", value: `${row.currency_list[0]?.roi?.toFixed(2)}%` },
    { label: "Refunds", value: row.currency_list[0]?.refunds },
    { label: "Units Sold", value: row.currency_list[0]?.unitsSold },
  ];

  if(isMobile)
  {
    return (
      <>
      <TableRow>
        <TableCell sx={{borderBottom:'none',pb:0}}>
          <Box sx={{
            border:'1px solid #e0e0e0',borderRadius:'8px',mb:2,backgroundColor:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.0.5)"
          }}>
            <Box sx={{display:"flex",alignItems:'center',p:1,borderBottom:'1px solid #f0f0f0'}}>
              <IconButton size='small'onClick={()=>setOpen(!open)} sx={{mr:1}}>
                {open?<KeyboardArrowUp/>:<KeyboardArrowDown/>}
              </IconButton>
              <Typography sx={{...fontStyles,fontWeight:600,fontSize:'14px'}}>
                {row.marketplace}
              </Typography>
            </Box>
            <Box sx={{p:2,display:open?'block':'none'}}>
              {getDataForMobile().slice(1).map((data,i)=>(
                <Box key={i} sx={{display:'flex',justifyContent:'space-between',mb:1,fontSize:"14px"}}>
                  <Typography sx={{color:"#666",mr:2}}>{data.label}</Typography>
                  <Typography sx={{fontWeight:600,color:data.color||'black'}}>{data.value}</Typography>
                  </Box>  
                  
              ))}

            </Box>
          </Box>
        </TableCell>
      </TableRow>
      </>
    )
  }

  return (
    <>
      <TableRow sx={{ ...fontStyles, borderBottom: "none" }}>
        <TableCell padding="none" sx={{ borderBottom: "none" }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{
            fontFamily:
              "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            color: "#485E75",
            pb: open && !isFirstRow ? "4px" : 0,
            borderBottom: "none",
          }}
        >
          {row.image && (
            <Avatar
              src={row.image}
              alt={row.marketplace}
              sx={{
                width: 20,
                height: 20,
                color: "#485E75",
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontSize: "14px",
                fontWeight: "800",
                mr: 1,
              }}
            />
          )}
          {row.marketplace}
        </TableCell>
        <TableCell
          sx={{
            ...cellStyle,
            borderBottom: "none",
            color: row.currency_list[0]?.grossRevenue < 0 ? "red" : "black",
          }}
        >
          {formatCurrency(row.currency_list[0]?.grossRevenue)}
        </TableCell>
        <TableCell
          sx={{
            ...cellStyle,
            borderBottom: "none",
            color: row.currency_list[0]?.expenses < 0 ? "red" : "black",
          }}
        >
          {formatCurrency(row.currency_list[0]?.expenses)}
        </TableCell>
        <TableCell
          sx={{
            ...cellStyle,
            borderBottom: "none",
            color: row.currency_list[0]?.total_cogs < 0 ? "red" : "black",
          }}
        >
          {formatCurrency(row.currency_list[0]?.total_cogs)}
        </TableCell>
        <TableCell
          sx={{
            ...cellStyle,
            borderBottom: "none",
            color: row.currency_list[0]?.netProfit < 0 ? "red" : "black",
          }}
        >
          {formatCurrency(row.currency_list[0]?.netProfit)}
        </TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>
          {row.currency_list[0]?.margin?.toFixed(2)}%
        </TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>
          {row.currency_list[0]?.roi?.toFixed(2)}%
        </TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>
          {row.currency_list[0]?.refunds}
        </TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>
          {row.currency_list[0]?.unitsSold}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {/* Add more details here if needed */}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
const fontStyles = {
  fontSize: "16px",
  color: "#485E75",
  fontFamily:
    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
};

export default function AllMarketplace({
  widgetData,
  marketPlaceId,
  brand_id,
  country,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
}) {
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [marketplaceData, setMarketplaceData] = useState(null);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastParamsRef = useRef("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTooltipOpen = () => {
    setOpenTooltip(true);
  };

  const handleTooltipClose = () => {
    setOpenTooltip(false);
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}downloadMarketplaceDataCSV/`,
        {
          marketplace_id: marketPlaceId.id,
          preset: widgetData,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
        },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, "marketplace-data.csv");
    } catch (error) {
      console.error("CSV Download Error:", error);
    }
  };

  const handleDownloadXLS = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}allMarketplaceDataxl/`,
        {
          marketplace_id: marketPlaceId.id,
          preset: widgetData,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
        },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "marketplace-data.xlsx");
    } catch (error) {
      console.error("XLS Download Error:", error);
    }
  };

  const fromDate = marketplaceData?.from_date;
  const toDate = marketplaceData?.to_date;

  const parseDateOnly = (dateString) => {
    if (!dateString) return null;
    return dayjs.utc(dateString.slice(0, 10));
  };

  const formattedCurrentDate = parseDateOnly(fromDate)
    ? parseDateOnly(fromDate).format("MMM DD, YYYY")
    : "";

  const formattedDateRange =
    fromDate && toDate
      ? `${parseDateOnly(fromDate).format("MMM DD, YYYY")} - ${parseDateOnly(
          toDate
        ).format("MMM DD, YYYY")}`
      : "";

  const fetchAllMarketplace = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id || "";
      const response = await axios.post(
        `${process.env.REACT_APP_IP}allMarketplaceData/`,
        {
          country: country,
          user_id: userId,
          preset: widgetData,
          marketplace_id: marketPlaceId.id,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      );
      setMarketplaceData(response.data);
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentParams = JSON.stringify({
      widgetData,
      marketPlaceId,
      country,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
      DateStartDate,
      DateEndDate,
    });
    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchAllMarketplace();
    }
  }, [
    widgetData,
    marketPlaceId,
    brand_id,
    country,
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
  ]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const rows = marketplaceData?.custom?.marketplace_list || [];
  const allMarketplaceData = marketplaceData?.custom?.all_marketplace || {};

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          boxShadow: "none",
          p: { xs: 2, sm: 3, md: 4 },
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 3,
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                ...fontStyles,
                fontWeight: 600,
                fontSize: { xs: "18px", sm: "20px" },
                color: "#111827",
              }}
            >
              All Marketplaces
            </Typography>
            <Typography
              sx={{
                ...fontStyles,
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
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "space-between", sm: "flex-end" },
            }}
          >
            <Tooltip
              title={
                <Typography
                  sx={{ fontWeight: 100, fontSize: "14px", color: "#485E75" }}
                >
                  All currencies have been converted to{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    $ USD
                  </Box>{" "}
                  based on the daily exchange rate
                </Typography>
              }
              open={openTooltip}
              onClose={handleTooltipClose}
              onMouseEnter={handleTooltipOpen}
              onMouseLeave={handleTooltipClose}
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: "white",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#485E75",
                    fontSize: { xs: "12px", sm: "14px" },
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                  },
                },
                arrow: {
                  sx: { color: "white" },
                },
              }}
            >
            </Tooltip>
            <Menu
              id="long-menu"
              MenuListProps={{ "aria-labelledby": "long-button" }}
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              PaperProps={{
                style: {
                  width: isMobile ? 180 : 200,
                  borderRadius: 10,
                  zIndex: 1200,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleDownloadCSV();
                  handleMenuClose();
                }}
                sx={{
                  color: "rgb(72, 94, 117)",
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: { xs: 12, sm: 14 },
                }}
              >
                <ListItemIcon sx={{ color: "rgb(72, 94, 117)", minWidth: 36 }}>
                  <InsertDriveFileIcon
                    sx={{ color: "rgb(72, 94, 117)", fontSize: "16px" }}
                  />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    fontSize: "16px",
                  }}
                  primary="Download CSV"
                />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleDownloadXLS();
                  handleMenuClose();
                }}
                sx={{
                  color: "rgb(72, 94, 117)",
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: { xs: 12, sm: 14 },
                }}
              >
                <ListItemIcon sx={{ color: "rgb(72, 94, 117)", minWidth: 36 }}>
                  <Download
                    sx={{ color: "rgb(72, 94, 117)", fontSize: "16px" }}
                  />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    fontSize: "16px",
                  }}
                  primary="Download XLS"
                />
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  color: "rgb(72, 94, 117)",
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: { xs: 12, sm: 14 },
                }}
              >
                <ListItemIcon sx={{ color: "rgb(72, 94, 117)", minWidth: 36 }}>
                  <Delete
                    sx={{ color: "rgb(72, 94, 117)", fontSize: "16px" }}
                  />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    fontSize: "16px",
                  }}
                  primary="Remove"
                />
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={{ xs: 2, sm: 3 }} mb={3}>
          {/* Left side - Metrics */}
          <Grid item xs={12} md={4}>
            <CardComponent
              country={country}
              widgetData={widgetData}
              marketPlaceId={marketPlaceId}
              DateStartDate={DateStartDate}
              DateEndDate={DateEndDate}
              brand_id={brand_id}
              product_id={product_id}
              manufacturer_name={manufacturer_name}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: { xs: 200, sm: 300 },
                  width: "100%",
                  height: "100%",
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <DottedCircleLoading />
                </Box>
              </Box>
            ) : (
              <NetProfitChart marketplaceList={rows} country={country} />
            )}
          </Grid>

          {/* Right side - CardComponent */}
          
          <Grid item xs={12} md={4}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: { xs: 200, sm: 300 },
                  width: "100%",
                  height: "100%",
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <DottedCircleLoading />
                </Box>
              </Box>
            ) : (
                          <MarketplaceChart marketplaceList={rows} />

            )}
          </Grid>
        </Grid>

        {/* Marketplace Breakdown Section - Now with Chart */}
        <Box
          display="flex"
          alignItems="center"
          mb={2}
          sx={{ cursor: "pointer" }}
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          <IconButton
            size="small"
            sx={{
              color: "rgb(10, 111, 232)",
              "&:hover": { color: "rgb(2, 83, 182)" },
            }}
          >
            {showBreakdown ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              ...fontStyles,
              fontSize: "14px",
              fontWeight: 600,
              color: "rgb(10, 111, 232)",
              "&:hover": { color: "rgb(2, 83, 182)" },
            }}
          >
            Marketplace Breakdown
          </Typography>
        </Box>

        <Collapse in={showBreakdown} timeout="auto" unmountOnExit>
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 300,
                  width: "100%",
                  height: "100%",
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <DottedCircleLoading />
                </Box>
              </Box>
            ) : (
              <Table size="small">
                <TableHead
                  sx={{
                    backgroundColor: "#f3f4f6",
                    "& .MuiTableCell-root": {
                      borderTop: "none",
                      borderBottom: "none",
                    },
                  }}
                >
                  <TableRow>
                    <TableCell padding="none"></TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        color: "#485E75",
                        borderTop: "none",
                      }}
                    >
                      Marketplace
                    </TableCell>
                    <TableCell
                      sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}
                    >
                      Gross Revenue
                    </TableCell>
                    <TableCell
                      sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}
                    >
                      Expenses
                    </TableCell>
                    <TableCell
                      sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}
                    >
                      COGS
                    </TableCell>
                    <TableCell
                      sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}
                    >
                      Net Profit
                    </TableCell>
                    <TableCell
                      sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}
                    >
                      Margin
                    </TableCell>
                    <TableCell
                      sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}
                    >
                      ROI
                    </TableCell>
                    <TableCell
                      sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}
                    >
                      Refunds
                    </TableCell>
                    <TableCell
                      sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}
                    >
                      Units Sold
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <MarketplaceRow key={index} row={row} index={index} />
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
          </Collapse>
      </Paper>
    </Box>
  );
}
