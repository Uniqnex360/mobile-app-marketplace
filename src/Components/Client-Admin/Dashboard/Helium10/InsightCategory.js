import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { SvgIcon } from "@mui/material";
import axios from "axios";
import { format, parseISO, isSameDay } from "date-fns";
import DottedCircleLoading from "../../../Loading/DotLoading";
import {
  Download,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVert,
} from "@mui/icons-material";

const ShowIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 512 512" sx={{ fontSize: 16 }}>
    <path
      fill="currentColor"
      d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
    />
  </SvgIcon>
);

const HideIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 512 512" sx={{ fontSize: 16 }}>
    <path
      fill="currentColor"
      d="M233.4 105.4c-12.5-12.5-32.8-12.5-45.3 0l-192 192c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L256 173.3 425.4 342.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-192-192z"
    />
  </SvgIcon>
);

const LeftArrowIcon = (props) => (
  <SvgIcon
    {...props}
    viewBox="0 0 256 512"
    sx={{ fontSize: 16, color: "#718096" }}
  >
    <path
      fill="currentColor"
      d="M47 239c-9.4 9.4-9.4 24.6 0 33.9L207 433c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L97.9 256 241 113c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L47 239z"
    />
  </SvgIcon>
);

const RightArrowIcon = (props) => (
  <SvgIcon
    {...props}
    viewBox="0 0 256 512"
    sx={{ fontSize: 16, color: "#718096" }}
  >
    <path
      fill="currentColor"
      d="M273 239c9.4 9.4 9.4 24.6 0 33.9L113 433c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l143-143L79 113c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L273 239z"
    />
  </SvgIcon>
);

const allCategories = ["Insights By Category", "Insights By Urgency"];

const InsightsSection = () => {
  const [showChartAndChips, setShowChartAndChips] = useState(true);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [currentChartData, setCurrentChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Add theme and media query hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchInsightsData = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentChartData([]);

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IP}ProductInsightsView/`
        );
        const data = response.data;

        if (allCategories[categoryIndex] === "Insights By Category") {
          const formattedCategoryData = Object.entries(
            data.insights_by_category
          ).map(([name, value]) => ({
            name,
            value,
            color: getColorByCategory(name),
            textColor: getTextColorForBackground(getColorByCategory(name)),
          }));
          setCurrentChartData(formattedCategoryData);
        } else if (allCategories[categoryIndex] === "Insights By Urgency") {
          setCurrentChartData([]);
          // You would likely process and format urgency-based data here if your backend provides it
        }

        const sortedAlerts = [...data.alerts_feed].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setNotifications(
          sortedAlerts.map((alert) => ({
            id: Math.random(),
            title: alert.title,
            desc: alert.message,
            tag: alert.type,
            color: getColorByType(alert.type),
            date: parseISO(alert.date), // Parse the date string
            textColor: getTextColorForBackground(getColorByType(alert.type)),
          }))
        );
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchInsightsData();
  }, [categoryIndex]);

  const handleToggleChartAndChips = () => {
    setShowChartAndChips((prevState) => !prevState);
  };

  const handlePrevCategory = () => {
    setCategoryIndex(
      (prevIndex) =>
        (prevIndex - 1 + allCategories.length) % allCategories.length
    );
  };

  const handleNextCategory = () => {
    setCategoryIndex((prevIndex) => (prevIndex + 1) % allCategories.length);
  };

  const getColorByCategory = (category) => {
    switch (category) {
      case "Listing Optimization":
        return "#0c7e7d";
      case "Product Performance":
        return "#a428e7";
      case "Keyword":
        return "#8053CE";
      case "Inventory":
        return "#b35f16";
      case "Refunds":
        return "#447a1d";
      default:
        return "#cccccc";
    }
  };

  const getColorByType = (type) => {
    switch (type) {
      case "Listing Optimization":
        return "#0c7e7d";
      case "Product Performance":
        return "#a428e7";
      case "Keyword":
        return "#F1EDFB";
      case "Inventory":
        return "#b35f16";
      case "Refunds":
        return "#447a1d";
      default:
        return "#cccccc";
    }
  };

  const getTextColorForBackground = (backgroundColor) => {
    if (!backgroundColor) return "#000000";
    let r, g, b;
    if (backgroundColor.startsWith("#")) {
      r = parseInt(backgroundColor.slice(1, 3), 16);
      g = parseInt(backgroundColor.slice(3, 5), 16);
      b = parseInt(backgroundColor.slice(5, 7), 16);
    } else if (backgroundColor.startsWith("rgb")) {
      const match = backgroundColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
      if (match) {
        r = parseInt(match[1], 10);
        g = parseInt(match[2], 10);
        b = parseInt(match[3], 10);
      } else {
        return "#000000";
      }
    } else {
      return "#000000";
    }
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128 ? "#000000" : "";
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, note) => {
    const formattedDate = format(note.date, "MMMM d, yyyy");
    if (!acc[formattedDate]) {
      acc[formattedDate] = [];
    }
    acc[formattedDate].push(note);
    return acc;
  }, {});

  const sortedNotificationDates = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <Box 
      sx={{
        p: { xs: 1, sm: 1 },
        pr: { xs: 1, sm: 2, md: 3 },
        border: "1px solid #E5E7EB",
        borderRadius: 2,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: { xs: 18, sm: 20 },
          fontFamily:
            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
        }}
      >
        Insights
      </Typography>

      <Box 
        sx={{
          p: 1,
          pr: { xs: 1, sm: 2 },
          display: "inherit",
          gap: { xs: 2, sm: 10, md: 20 },
          overflowY: "auto",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            paddingTop: "10px",
            gap: { xs: 2, sm: 3.5 },
            minWidth: { xs: "100%", sm: 300 },
            mr: { xs: 0, sm: 2 },
          }}
        >
          <Box
            display="block"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: "pointer" }}
              onClick={handleToggleChartAndChips}
            >
              {showChartAndChips ? (
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ paddingTop: "2px" }}
                >
                  <KeyboardArrowUp sx={{ color: "#485E75" }} />
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 14 },
                      ml: 0.5,
                      color: "#485E75",
                      fontFamily:
                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    }}
                  >
                    Hide Chart
                  </Typography>
                </Box>
              ) : (
                <KeyboardArrowDown sx={{ color: "#485E75" }} />
              )}
            </Box>

            {showChartAndChips && (
              <Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={1}
                  mb={2}
                >
                  <IconButton
                    size="small"
                    sx={{ padding: "4px" }}
                    onClick={handlePrevCategory}
                  >
                    <LeftArrowIcon />
                  </IconButton>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: 14, sm: 16 },
                      color: "#485E75",
                      fontFamily:
                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    }}
                  >
                    {allCategories[categoryIndex]}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ padding: "4px" }}
                    onClick={handleNextCategory}
                  >
                    <RightArrowIcon />
                  </IconButton>
                </Box>

                <Box 
                  sx={{
                    display: "flex",
                    gap: { xs: 1, sm: 2 },
                    alignItems: "center",
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: 100, sm: 120 },
                      width: { xs: 100, sm: 120 },
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isLoading ? (
                      <DottedCircleLoading />
                    ) : error ? (
                      <Alert severity="error">{error}</Alert>
                    ) : currentChartData.length > 0 ? (
                      <PieChart width={isMobile ? 80 : 100} height={isMobile ? 100 : 120}>
                        <Pie
                          data={currentChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 28 : 35}
                          outerRadius={isMobile ? 38 : 45}
                          paddingAngle={1}
                          dataKey="value"
                        >
                          {currentChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <Typography 
                        sx={{
                          color: "textSecondary",
                          fontSize: { xs: 10, sm: 12 },
                        }}
                      >
                        No data available.
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    {isLoading ? (
                      <Typography
                        color="textSecondary"
                        fontSize={12}
                      ></Typography>
                    ) : error ? (
                      <></>
                    ) : currentChartData.length > 0 ? (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" },
                          gap: { xs: "5%", sm: "10% 2%" },
                        }}
                      >
                        {currentChartData.map((item, index) => (
                          <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            gap={0.4}
                          >
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: 12, sm: 14 },
                                color: "#1A2027",
                                fontFamily:
                                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                              }}
                            >
                              {item.value}
                              <span
                                style={{
                                  fontSize: isMobile ? "14px" : "16px",
                                  color: "#485E75",
                                  fontFamily:
                                    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                }}
                              >
                                ×
                              </span>
                            </Typography>

                            <Chip
                              label={
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={0.2}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: { xs: 10, sm: 12 },
                                      color: item.textColor,
                                      fontFamily:
                                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                    }}
                                  >
                                    {item.name}
                                  </Typography>
                                  <NorthEastIcon
                                    sx={{ fontSize: { xs: 10, sm: 12 }, color: "#718096" }}
                                  />
                                </Box>
                              }
                              size="small"
                              sx={{
                                backgroundColor: `${item.color}30`,
                                color: `${item.color}`,
                                fontWeight: 500,
                                fontSize: { xs: 9, sm: 11 },
                                borderRadius: "25px",
                                px: { xs: 0.6, sm: 0.8 },
                                py: { xs: 0.1, sm: 0.2 },
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      allCategories[categoryIndex] ===
                        "Insights By Category" && (
                        <Typography 
                          sx={{
                            color: "textSecondary",
                            fontSize: { xs: 10, sm: 12 },
                          }}
                        >
                          No category insights available.
                        </Typography>
                      )
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          <Box 
            sx={{
              flex: 1,
              display: "flex",
              gap: "1%",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {sortedNotificationDates.map((date) => (
              <Box key={date} mb={2} sx={{ width: "100%" }}>
                <Typography
                  sx={{
                    color: "#485E75",
                    fontSize: { xs: 12, sm: 14 },
                    mb: 1,
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                  }}
                >
                  {'September 1,2025'}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 1, sm: 2 },
                    overflowX: "auto",
                    overflowY: "hidden",
                    maxWidth: "100%",
                    paddingBottom: 1,
                    "&::-webkit-scrollbar": {
                      height: 4,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#485E75",
                      borderRadius: 4,
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "#d3d3d3",
                      borderRadius: 4,
                    },
                  }}
                >
                  {groupedNotifications[date].map((note) => (
                    <Box
                      key={note.id}
                      sx={{
                        minWidth: { xs: 250, sm: 300 },
                        p: { xs: 1, sm: 1.5 },
                        borderRadius: 2,
                        bgcolor: "#F0F9FF",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        position: "relative",
                      }}
                    >
                      <Box>
                        {/* Title and Close Icon Row */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Typography
                            sx={{
                              fontSize: { xs: 12, sm: 14 },
                              color: "#485E75",
                              fontFamily:
                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            <Box
                              component="span"
                              fontWeight={600}
                              sx={{ color: "#121212" }}
                            >
                              {note.title}.
                            </Box>{" "}
                            {note.desc}
                          </Typography>

                          <IconButton 
                            size="small" 
                            sx={{ 
                              p: { xs: 0.3, sm: 0.5 } 
                            }}
                          >
                            <CloseIcon 
                              sx={{
                                fontSize: { xs: "16px", sm: "small" }
                              }}
                            />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Tag and Button */}
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        gap={0.8} 
                        mt={1}
                      >
                        <Chip
                          label={
                            <Box display="flex" alignItems="center" gap={0.3}>
                              <NotificationsIcon 
                                sx={{ fontSize: { xs: 10, sm: 12 } }} 
                              />
                              <Typography
                                sx={{
                                  fontSize: { xs: 10, sm: 12 },
                                  color: note.textColor,
                                  fontFamily:
                                    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                }}
                              >
                                {note.tag}
                              </Typography>
                              <NorthEastIcon 
                                sx={{ fontSize: { xs: 10, sm: 12 } }} 
                              />
                            </Box>
                          }
                          size="small"
                          sx={{
                            backgroundColor: `${note.color}33`,
                            color: note.color,
                            fontWeight: 600,
                            fontSize: { xs: 8, sm: 10 },
                            borderRadius: "4px",
                            px: { xs: 0.6, sm: 0.8 },
                            py: { xs: 0.1, sm: 0.2 },
                          }}
                        />
                        {/* <Button
                          variant="contained"
                          size="small"
                          sx={{   
                            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                            borderRadius: '4px', 
                            textTransform: 'none', 
                            fontSize: { xs: 12, sm: 14 }, 
                            padding: { xs: '2px 6px', sm: '4px 8px' }
                          }}
                        >
                          Open
                        </Button> */}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InsightsSection;