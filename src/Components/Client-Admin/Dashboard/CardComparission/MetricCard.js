import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Popover,
  Grid,
  Button,
  Container,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { styled } from "@mui/material/styles";
import NotificationTooltip from "./NotificationTooltip";
import { Delete } from "@mui/icons-material";
import DottedCircleLoading from "../../../Loading/DotLoading";
import { getCurrencySymbol } from "../../../../utils/currencySymbol";

const CustomPopover = styled(Popover)(({ theme }) => ({
  "& .MuiPopover-paper": {
    backgroundColor: "white",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    borderRadius: "4px",
    padding: theme.spacing(1),
    fontFamily: "'Nunito Sans', sans-serif",
    color: "#485E75",
    fontSize: "14px",
  },
}));

const formatterLong = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const formatterShort = new Intl.DateTimeFormat("en-US", {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});


function OrderInfoPopover({
  open,
  anchorEl,
  handleClose,
  organic,
  sponsored,
  total,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        borderRadius: "6px",
        boxShadow: "none",
        border: "1px solid rgb(161, 173, 184)",
      }}
    >
      <CustomPopover
        id="order-info-popover"
        sx={{
          pointerEvents: "none",
          boxShadow: 3,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleClose}
        disableRestoreFocus
      >
        <Box
          sx={{
            p: 1,
            width: { xs: "160px", sm: "200px" },
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.3,
            }}
          >
            <Typography sx={{ fontSize: { xs: "11px", sm: "12px" } }}>Organic</Typography>
            <Typography sx={{ fontSize: { xs: "11px", sm: "12px" } }}>{organic}</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.3,
            }}
          >
            <Typography sx={{ fontSize: { xs: "11px", sm: "12px" } }}>Sponsored</Typography>
            <Typography sx={{ fontSize: { xs: "11px", sm: "12px" } }}>0</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: { xs: "13px", sm: "14px" }, fontWeight: "bold", mb: 0.5 }}>
              Total Orders
            </Typography>
            <Typography sx={{ fontWeight: "bold", fontSize: { xs: "13px", sm: "14px" } }}>
              {organic}
            </Typography>
          </Box>
        </Box>
      </CustomPopover>
    </Box>
  );
}
const formatCurrency = (value,country) => {
    const currencySymbol = getCurrencySymbol(country);
    return `${currencySymbol}${(value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
const PerformanceCard = ({
  title,
  country,
  date,
  previous,
  netPrevious,
  dateRange,
  dateRangePrev,
  dateRangeFormat,
  dateRangePrevFormat,
  grossRevenue,
  grossRevenueChange,
  expenses,
  netProfit,
  margin,
  orders,
  unitsSold,
  refunds,
  netProfitCalculation,
  sponsoredOrders,
  totalOrders,
}) => {
  const [anchorElOptions, setAnchorElOptions] = useState(null);
  const [openOptionsPopover, setOpenOptionsPopover] = useState(false);
  const [anchorElOrders, setAnchorElOrders] = useState(null);
  const [openOrdersPopover, setOpenOrdersPopover] = useState(false);
  const [anchorElUnitsSold, setAnchorElUnitsSold] = useState(null);
  const [openUnitsSoldPopover, setOpenUnitsSoldPopover] = useState(false);
  const [anchorElRefunds, setAnchorElRefunds] = useState(null);
  const [openRefundsPopover, setOpenRefundsPopover] = useState(false);
  const [marginPopoverAnchorEl, setMarginPopoverAnchorEl] = useState(null);
  const [openMarginPopover, setOpenMarginPopover] = useState(false);
  const [anchorElGrossRevenue, setAnchorElGrossRevenue] = useState(null);
  const [openGrossRevenuePopover, setOpenGrossRevenuePopover] = useState(false);
  const [anchorElNetProfit, setAnchorElNetProfit] = useState(null);
  const [openNetProfitPopover, setOpenNetProfitPopover] = useState(false);

  // Add responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const openOrder = Boolean(anchorElOrders);
  const previousGrossRevenue = parseFloat(
  previous?.replace(/[^\d.-]/g, "") || "0"
);
  const currentGrossRevenue = parseFloat(
  grossRevenue?.replace(/[^\d.-]/g, "") || "0"
);
  const grossRevenueDiff = currentGrossRevenue - previousGrossRevenue;
  const grossRevenuePercentageChange =
    !isNaN(previousGrossRevenue) && previousGrossRevenue !== 0
      ? (grossRevenueDiff / previousGrossRevenue) * 100
      : 0;

  const netPreviousValue = parseFloat(
  netPrevious?.replace(/[^\d.-]/g, "") || "0"
);
  const currentNetProfitValue = parseFloat(
  netProfit?.replace(/[^\d.-]/g, "") || "0"
);
  const netProfitDiff = currentNetProfitValue - netPreviousValue;
  const netProfitPercentageChange =
    !isNaN(netPreviousValue) && netPreviousValue !== 0
      ? (netProfitDiff / netPreviousValue) * 100
      : 0;

  const handleOpenOptionsPopover = (event) => {
    setAnchorElOptions(event.currentTarget);
    setOpenOptionsPopover(true);
  };

  const handleCloseOptionsPopover = () => {
    setOpenOptionsPopover(false);
    setAnchorElOptions(null);
  };

  const handleOpenOrdersPopover = (event) => {
    setAnchorElOrders(event.currentTarget);
    setOpenOrdersPopover(true);
  };

  const handleCloseOrdersPopover = () => {
    setOpenOrdersPopover(false);
    setAnchorElOrders(null);
  };

  const handleOpenUnitsSoldPopover = (event) => {
    setAnchorElUnitsSold(event.currentTarget);
    setOpenUnitsSoldPopover(true);
  };

  const handleCloseUnitsSoldPopover = () => {
    setOpenUnitsSoldPopover(false);
    setAnchorElUnitsSold(null);
  };

  const handleOpenRefundsPopover = (event) => {
    setAnchorElRefunds(event.currentTarget);
    setOpenRefundsPopover(true);
  };

  const handleCloseRefundsPopover = () => {
    setOpenRefundsPopover(false);
    setAnchorElRefunds(null);
  };

  const handleOpenMarginPopover = (event) => {
    setMarginPopoverAnchorEl(event.currentTarget);
    setOpenMarginPopover(true);
  };

  const handleCloseMarginPopover = () => {
    setOpenMarginPopover(false);
    setMarginPopoverAnchorEl(null);
  };

  const handleOpenGrossRevenuePopover = (event) => {
    setAnchorElGrossRevenue(event.currentTarget);
    setOpenGrossRevenuePopover(true);
  };

  const handleCloseGrossRevenuePopover = () => {
    setOpenGrossRevenuePopover(false);
    setAnchorElGrossRevenue(null);
  };

  const handleOpenNetProfitPopover = (event) => {
    setAnchorElNetProfit(event.currentTarget);
    setOpenNetProfitPopover(true);
  };

  const handleCloseNetProfitPopover = () => {
    setOpenNetProfitPopover(false);
    setAnchorElNetProfit(null);
  };


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const renderChange = (value) => {
    if (!value) return null;
    const isNegative = value.startsWith("-");
    return (
      <Typography
        variant="caption"
        sx={{
          fontSize: { xs: "12px", sm: "14px" },
          color: isNegative ? "error.main" : "success.main",
          display: "flex",
          alignItems: "center",
        }}
      >
        {isNegative ? (
          <ArrowUpwardIcon
            sx={{ fontSize: { xs: "12px", sm: "14px" }, color: "rgb(51, 204, 153)" }}
          />
        ) : (
          <ArrowDownwardIcon sx={{ fontSize: { xs: "12px", sm: "14px" }, color: "red" }} />
        )}
        {value}
      </Typography>
    );
  };

  return (
    <Box sx={{ width: "100%", marginTop: { xs: "5px", sm: "10px" } }}>
      <Card
        sx={{ border: "1px solid #e0e0e0", fontSize: "14px", width: "100%" }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "16px", sm: "18px", md: "20px" },
                color: "#13191F",
                fontFamily: "'Nunito Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
            <IconButton
              aria-label="options"
              size="small"
              onClick={handleOpenOptionsPopover}
            >
              <MoreVertIcon sx={{ fontSize: { xs: "20px", sm: "24px" } }} />
            </IconButton>
            <Popover
              open={openOptionsPopover}
              anchorEl={anchorElOptions}
              onClose={handleCloseOptionsPopover}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Box sx={{ border: "1px solid #ddd", p: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontSize: { xs: "12px", sm: "14px" },
                    color: "#485E75",
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                  }}
                >
                  <Delete sx={{ color: "rgb(72, 94, 117)" }} fontSize="small" />
                  <Typography sx={{ fontSize: { xs: "12px", sm: "14px" } }}>Remove</Typography>
                </Box>
              </Box>
            </Popover>
          </Box>

          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: { xs: "12px", sm: "14px" },
              mb: 1,
            }}
          >
            {date ? formatDate(date) : dateRange}
          </Typography>

          {/* Gross Revenue and Expenses */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 0 } }}>
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: "12px", sm: "14px" },
                  fontFamily: "'Nunito Sans', sans-serif",
                  color: "#485E75",
                }}
              >
                Gross Revenue
              </Typography>
              <Box
                aria-owns={
                  openGrossRevenuePopover ? "gross-revenue-popover" : undefined
                }
                aria-haspopup="true"
                onMouseEnter={handleOpenGrossRevenuePopover}
                onMouseLeave={handleCloseGrossRevenuePopover}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "20px", sm: "22px", md: "24px" },
                    fontFamily: "'Nunito Sans', sans-serif",
                    cursor: "pointer",
                  }}
                >
                  {grossRevenue}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {!isNaN(grossRevenuePercentageChange) && (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "11px", sm: "12px" },
                          fontFamily: "'Nunito Sans', sans-serif",
                          color:
                            grossRevenuePercentageChange > 0
                              ? "#121212"
                              : grossRevenuePercentageChange < 0
                              ? "#121212"
                              : "inherit",
                        }}
                      >
                        {grossRevenuePercentageChange !== 0 &&
                          `${Math.abs(grossRevenuePercentageChange).toFixed(
                            2
                          )}%`}
                      </Typography>
                      {!isNaN(grossRevenuePercentageChange) && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {grossRevenuePercentageChange > 0 ? (
                            <ArrowUpwardIcon
                              sx={{
                                fontSize: { xs: 12, sm: 14 },
                                color: "rgb(51, 204, 153)",
                                mr: 0.5,
                              }}
                            />
                          ) : grossRevenuePercentageChange < 0 ? (
                            <ArrowDownwardIcon
                              sx={{ fontSize: { xs: 12, sm: 14 }, color: "red", mr: 0.5 }}
                            />
                          ) : (
                            "N/A"
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
              <Popover
                id="gross-revenue-popover"
                sx={{ pointerEvents: "none", boxShadow: "none" }}
                open={openGrossRevenuePopover}
                anchorEl={anchorElGrossRevenue}
                onClose={handleCloseGrossRevenuePopover}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                disableRestoreFocus
              >
                <Typography
                  sx={{
                    p: 2,
                    fontSize: { xs: "12px", sm: "14px" },
                    borderRadius: "6px",
                    boxShadow: "none",
                    border: "1px solid rgb(161, 173, 184)",
                    width: { xs: "250px", sm: "300px" },
                    color: "#485E75",
                  }}
                >
                  <Box
                    sx={{
                      color: "#121212",
                      fontWeight: "bold",
                      fontSize: { xs: "14px", sm: "16px" },
                    }}
                  >
                    Current vs Previous Period
                  </Box>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ minWidth: "130px", textAlign: "left" }}>
                      {dateRangeFormat}
                    </div>
                    <div style={{ textAlign: "right" }}>{grossRevenue}</div>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ minWidth: "130px", textAlign: "left" }}>
                      {dateRangePrevFormat}
                    </div>
                    <div style={{ textAlign: "right" }}>${previous}</div>
                  </div>
                  <br />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: isMobile ? "14px" : "16px",
                        color: "#121212",
                        textAlign: "left",
                      }}
                    >
                      Change:
                    </span>
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: isMobile ? "14px" : "16px",
                        color: "#121212",
                        textAlign: "right",
                      }}
                    >
                      {(() => {
                        const current = parseFloat(
  grossRevenue?.replace(/[^\d.-]/g, "") || "0"
);
                        const prev = parseFloat(previous?.replace(/[^\d.-]/g, "") || "0");

                        const value = current - prev;
                        return formatCurrency(value);
                      })()}
                    </span>
                  </div>
                </Typography>
              </Popover>
              <Typography
                sx={{
                  fontSize: { xs: "11px", sm: "12px" },
                  color: grossRevenueChange?.includes("-")
                    ? "error.main"
                    : "success.main",
                }}
              >
                {renderChange(grossRevenueChange)}
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign: "right",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "12px", sm: "14px" },
                  color: "#485E75",
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                Expenses
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "16px", sm: "18px" },
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                {expenses}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {/* Net Profit + Margin */}
          <Box sx={{ backgroundColor: "rgb(242, 245, 247)", borderRadius: "4px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                px: { xs: 1, sm: 1 },
                py: { xs: 1.5, sm: 2 },
                backgroundColor: "rgb(242, 245, 247)",
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: { xs: 1, sm: 0 }
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "'Nunito Sans', sans-serif",
                    fontSize: { xs: "12px", sm: "14px" },
                    color: "#485E75",
                  }}
                >
                  Net Profit
                </Typography>
                <Box
                  aria-owns={
                    openNetProfitPopover ? "net-profit-popover" : undefined
                  }
                  aria-haspopup="true"
                  onMouseEnter={handleOpenNetProfitPopover}
                  onMouseLeave={handleCloseNetProfitPopover}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: "20px", sm: "22px", md: "24px" },
                      fontFamily: "'Nunito Sans', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    {netProfit}
                  </Typography>
                  {netPrevious && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "11px", sm: "12px" },
                          fontFamily: "'Nunito Sans', sans-serif",
                          color:
                            netProfitPercentageChange > 0
                              ? "#121212"
                              : netProfitPercentageChange < 0
                              ? "#121212"
                              : "inherit",
                        }}
                      >
                        {netProfitPercentageChange !== 0 &&
                          `${Math.abs(netProfitPercentageChange).toFixed(2)}%`}
                      </Typography>
                      {!isNaN(netProfitPercentageChange) && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {netProfitPercentageChange > 0 ? (
                            <ArrowUpwardIcon
                              sx={{
                                fontSize: { xs: 12, sm: 14 },
                                color: "rgb(51, 204, 153)",
                                mr: 0.5,
                              }}
                            />
                          ) : netProfitPercentageChange < 0 ? (
                            <ArrowDownwardIcon
                              sx={{ fontSize: { xs: 12, sm: 14 }, color: "red", mr: 0.5 }}
                            />
                          ) : (
                            "N/A"
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
                <Popover
                  id="net-profit-popover"
                  sx={{ pointerEvents: "none" }}
                  open={openNetProfitPopover}
                  anchorEl={anchorElNetProfit}
                  onClose={handleCloseNetProfitPopover}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  disableRestoreFocus
                >
                  <Typography
                    sx={{
                      p: 2,
                      fontSize: { xs: "12px", sm: "14px" },
                      borderRadius: "6px",
                      boxShadow: "none",
                      border: "1px solid rgb(161, 173, 184)",
                      width: { xs: "250px", sm: "300px" },
                      color: "#485E75",
                    }}
                  >
                    <Box
                      sx={{
                        color: "#121212",
                        fontWeight: "bold",
                        fontSize: { xs: "14px", sm: "16px" },
                      }}
                    >
                      Current vs Previous Period
                    </Box>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ minWidth: "130px", textAlign: "left" }}>
                        {dateRangeFormat}
                      </div>
                      <div style={{ textAlign: "right" }}>{netProfit}</div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ minWidth: "130px", textAlign: "left" }}>
                        {dateRangePrevFormat}
                      </div>
                      <div style={{ textAlign: "right" }}>{netPrevious}</div>
                    </div>
                    <br />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: isMobile ? "14px" : "16px",
                          color: "#121212",
                          textAlign: "left",
                        }}
                      >
                        Change:
                      </span>
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: isMobile ? "14px" : "16px",
                          color: "#121212",
                          textAlign: "right",
                        }}
                      >
                        {(() => {
                          const profit = parseFloat(
  netProfit?.replace(/[^\d.-]/g, "") || "0"
);
                          const previous = parseFloat(
  netPrevious?.replace(/[^\d.-]/g, "") || "0"
);
                          const difference = profit - previous;
                          return formatCurrency(difference);
                        })()}
                      </span>
                    </div>
                  </Typography>
                </Popover>
              </Box>
              <Box sx={{ textAlign: "right", flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: "12px", sm: "14px" },
                    fontFamily: "'Nunito Sans', sans-serif",
                    color: "#485E75",
                  }}
                >
                  Margin
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "16px", sm: "18px" },
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}
                >
                  {margin}
                </Typography>
                <Tooltip
                  title={
                    <NotificationTooltip
                      content={netProfitCalculation?.current}
                    />
                  }
                  placement="left"
                  PopperProps={{
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, 10],
                        },
                      },
                    ],
                    sx: {
                      [`& .MuiTooltip-tooltip`]: {
                        backgroundColor: "transparent",
                        boxShadow: "3",
                        color: "#000",
                        padding: 0,
                      },
                    },
                  }}
                >
                  <Button
                    size="small"
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: "12px", sm: "14px" },
                      textTransform: "capitalize",
                      fontFamily: "'Nunito Sans', sans-serif",
                      padding: 0,
                    }}
                  >
                    Explain
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              fontFamily: "'Nunito Sans', sans-serif",
              px: { xs: 0, sm: 1, md: 2 },
              width: "100%",
              flexDirection: { xs: 'row', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}
          >
            {[
              [
                "Orders",
                orders,
                handleOpenOrdersPopover,
                handleCloseOrdersPopover,
                openOrdersPopover,
                anchorElOrders,
                <OrderInfoPopover
                  open={openOrdersPopover}
                  anchorEl={anchorElOrders}
                  handleClose={handleCloseOrdersPopover}
                  organic={orders}
                  sponsored={sponsoredOrders}
                  total={totalOrders}
                />,
              ],
              ["Units Sold", unitsSold],
              ["Refunds", refunds],
            ].map(
              ([
                label,
                value,
                handleOpen,
                handleClose,
                openPopover,
                anchorEl,
                popoverContent,
              ]) => (
                <Box
                  key={label}
                  sx={{
                    paddingRight: { xs: "0px", sm: "10px", md: "20px" },
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#485E75",
                      fontSize: { xs: "11px", sm: "12px", md: "14px" },
                      fontFamily: "'Nunito Sans', sans-serif",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {isMobile ? label.split(' ')[0] : label}
                    {label === "Orders" && (
                      <Box
                        aria-owns={
                          openPopover
                            ? `mouse-over-popover-${label}`
                            : undefined
                        }
                        aria-haspopup="true"
                        onMouseEnter={handleOpen}
                        onMouseLeave={handleClose}
                      >
                        <InfoOutlinedIcon
                          sx={{ fontSize: { xs: "14px", sm: "16px" }, cursor: "pointer" }}
                        />
                      </Box>
                    )}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: "16px", sm: "18px" },
                      fontFamily: "'Nunito Sans', sans-serif",
                    }}
                  >
                    {value}
                  </Typography>

                  {label === "Orders" && popoverContent && (
                    <Popover
                      id={`mouse-over-popover-${label}`}
                      sx={{ pointerEvents: "none" }}
                      open={openPopover}
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                      onClose={handleClose}
                      disableRestoreFocus
                    >
                      {popoverContent}
                    </Popover>
                  )}
                </Box>
              )
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const MetricCard = ({
  startDate,
  endDate,
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
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  let lastParamsRef = useRef("");
  
  useEffect(() => {
    const currentParams = JSON.stringify({
      preset: widgetData,
      marketplace_id: marketPlaceId?.id,
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
      fetchMetricsComparission(widgetData);
    }
  }, [
    widgetData,
    marketPlaceId,
    brand_id,
    country,
    product_id,
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
  ]);

  const fetchMetricsComparission = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getPeriodWiseDataCustom/`,
        {
          country: country,
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

      const data = response.data;

      setMetricsData(response.data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformData = (data,country) => {
  if (!data) return [];

  const safeFormatDate = (dateString, formatter) => {
    try {
      return dateString ? formatter.format(new Date(dateString)) : "";
    } catch (e) {
      console.warn("Date formatting error:", e);
      return "";
    }
  };

  const safeGet = (obj, path, defaultValue = 0) => {
    try {
      return (
        path.split(".").reduce((acc, part) => acc && acc[part], obj) ??
        defaultValue
      );
    } catch (e) {
      return defaultValue;
    }
  };

  const periods = ["today", "yesterday", "last7Days", "custom"];

  return periods.reduce((acc, period) => {
    if (!data[period]) return acc;

    const periodData = data[period];

    try {
      const getLocal = (range, key, fallbackKey = key) =>
        range?.[key] || range?.[fallbackKey];

      const cardData = {
        title:
          period === "last7Days"
            ? "Last 7 Days"
            : period.charAt(0).toUpperCase() + period.slice(1),

        dateRange: periodData.dateRanges?.current
          ? `${safeFormatDate(
              getLocal(periodData.dateRanges.current, "from_local", "from"),
              formatterLong
            )} - ${safeFormatDate(
              getLocal(periodData.dateRanges.current, "to_local", "to"),
              formatterLong
            )}`
          : "",

        dateRangePrev: periodData.dateRanges?.previous
          ? `${safeFormatDate(
              getLocal(periodData.dateRanges.previous, "from_local", "from"),
              formatterLong
            )} - ${safeFormatDate(
              getLocal(periodData.dateRanges.previous, "to_local", "to"),
              formatterLong
            )}`
          : "",

        dateRangeFormat: periodData.dateRanges?.current
          ? `${safeFormatDate(
              getLocal(periodData.dateRanges.current, "from_local", "from"),
              formatterShort
            )} - ${safeFormatDate(
              getLocal(periodData.dateRanges.current, "to_local", "to"),
              formatterShort
            )}`
          : "",

        dateRangePrevFormat: periodData.dateRanges?.previous
          ? `${safeFormatDate(
              getLocal(periodData.dateRanges.previous, "from_local", "from"),
              formatterShort
            )} - ${safeFormatDate(
              getLocal(periodData.dateRanges.previous, "to_local", "to"),
              formatterShort
            )}`
          : "",

        grossRevenue: formatCurrency(
          safeGet(periodData, "summary.grossRevenue.current", 0),
          country // Pass country parameter
        ),

        expenses: `-${formatCurrency(
          safeGet(periodData, "summary.expenses.current", 0),
          country // Pass country parameter
        )}`,

        netProfit: formatCurrency(
          safeGet(periodData, "summary.netProfit.current", 0),
          country // Pass country parameter
        ),

        netPrevious: formatCurrency(
          safeGet(periodData, "summary.netProfit.previous", 0),
          country // Pass country parameter
        ),

        margin: `${safeGet(periodData, "summary.margin.current", 0).toFixed(
          2
        )}%`,

        orders: safeGet(periodData, "summary.orders.current", 0),
        unitsSold: safeGet(periodData, "summary.unitsSold.current", 0),
        refunds: safeGet(periodData, "summary.refunds.current", 0),
        
        // Update this to use formatCurrency with country
        previous: formatCurrency(
          safeGet(periodData, "summary.grossRevenue.previous", 0),
          country // Pass country parameter
        ),

        revenueChange: (() => {
          const delta = safeGet(periodData, "summary.grossRevenue.delta", 0);
          const sign = delta >= 0 ? "+" : "";
          return `${sign}${formatCurrency(Math.abs(delta), country)}`; // Pass country parameter
        })(),

        netProfitCalculation: periodData.netProfitCalculation || {},
      };

      acc.push(cardData);
    } catch (error) {
      console.error(`Error processing ${period} data:`, error);
    }

    return acc;
  }, []);
};
  const processedData = metricsData ? transformData(metricsData,country) : [];

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
      {loading ? (
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
        <>
          <Box
            sx={{
              px: { xs: 0, sm: 2 },
              py: 2,
              textAlign: "left",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color="#13191F"
              sx={{
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: { xs: "18px", sm: "20px" },
              }}
            >
              Performance Summary
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {processedData.map((cardData, idx) => (
              <Grid item xs={12} sm={6} md={6} xl={3} key={idx}>
                <PerformanceCard {...cardData} country={country}/>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default MetricCard;