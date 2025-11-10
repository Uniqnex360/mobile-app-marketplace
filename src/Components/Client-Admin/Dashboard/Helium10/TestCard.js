"use client"

import { useEffect, useState, useRef } from "react"
import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import "dayjs/locale/en"
import axios from "axios"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)
dayjs.extend(weekOfYear)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("en")

const TIMEZONE = "US/Pacific"

const MetricItem = ({ title, value, change, isNegative, tooltip, currencySymbol, loading = false }) => {
  const absValue = Math.abs(value ?? 0)
  const absChange = Math.abs(change ?? 0)

  const displayValue = `${(value ?? 0) < 0 ? "-" : ""}${
    currencySymbol
      ? `${currencySymbol}${Math.abs(value ?? 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Math.abs(value ?? 0))
  }`

  const displayChange =
    change !== undefined
      ? `${change < 0 ? "-" : ""}${
          currencySymbol
            ? `${currencySymbol}${Math.abs(change ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(Math.abs(change ?? 0))
        }`
      : ""

  return (
    <div style={styles.metricItem}>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricValueContainer}>
        <div style={styles.metricValue}>{loading ? "..." : displayValue}</div>
        {change !== undefined && (
          <div style={{ ...styles.metricChange, color: isNegative ? "#e74c3c" : "#27ae60" }}>
            {loading ? "..." : displayChange}
            {!loading && (isNegative ? " ↓" : " ↑")}
          </div>
        )}
      </div>
    </div>
  )
}

const TestCard = ({
  marketPlaceId,
  country,
  brand_id,
  widgetData,
  product_id,
  DateStartDate,
  DateEndDate,
  manufacturer_name,
  fulfillment_channel,
}) => {
  const API_TODAY = dayjs("02/09/2025", "DD/MM/YYYY").tz(TIMEZONE)
  const stableBrandId = JSON.stringify(brand_id)
  const stableProductId = JSON.stringify(product_id)
  const stableManufacturer = JSON.stringify(manufacturer_name)

  const [currentDates, setCurrentDates] = useState({
    selectedDate: API_TODAY,
    displayDate: API_TODAY,
  })

  const [dataState, setDataState] = useState({
    metrics: {},
    previous: {},
    difference: {},
    bindGraph: [],
  })

  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [tooltipData, setTooltipData] = useState(null)
  const [svgOffset, setSvgOffset] = useState({ left: 0, top: 0 })

  const userData = JSON.parse(localStorage.getItem("user") || "{}")
  const userId = userData?.id || ""
  const svgRef = useRef(null)
  const graphContainerRef = useRef(null)

  const [visibleMetrics, setVisibleMetrics] = useState([
    "gross_revenue_with_tax",
    "total_orders",
    "total_units",
    "total_tax",
    "refund",
    "total_cogs",
    "net_profit",
  ])

  useEffect(() => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      setSvgOffset({ left: rect.left, top: rect.top })
    }
  }, [])

  useEffect(() => {
    fetchMetrics(currentDates.selectedDate, currentDates.displayDate)
  }, [
    currentDates.selectedDate,
    currentDates.displayDate,
    stableBrandId,
    country,
    stableProductId,
    stableManufacturer,
    fulfillment_channel,
    marketPlaceId?.id,
  ])

  const latestRequestRef = useRef(0)

  const fetchMetrics = async (selectedDate, displayDate) => {
    setDataLoading(true)
    const requestId = ++latestRequestRef.current
    try {
      const payload = {
        target_date: "01/09/2025",
        user_id: userId,
        country: country,
        preset: widgetData,
        marketplace_id: marketPlaceId.id,
        brand_id: brand_id,
        product_id: product_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        timezone: TIMEZONE,
      }

      if (DateStartDate && dayjs(DateStartDate).isValid()) {
        payload.start_date = dayjs(DateStartDate).format("DD/MM/YYYY")
      }
      if (DateEndDate && dayjs(DateEndDate).isValid()) {
        payload.end_date = dayjs(DateEndDate).format("DD/MM/YYYY")
      }

      const response = await axios.post(`${process.env.REACT_APP_IP}get_metrics_by_date_range/`, payload)

      if (requestId === latestRequestRef.current) {
        const data = response.data.data
        setDataState({
          metrics: data.targeted || {},
          previous: data.previous || {},
          difference: data.difference || {},
          bindGraph: Object.entries(data.graph_data || {})
            .map(([rawDate, values]) => ({
              date: rawDate,
              fullDate: rawDate,
              dateObj: dayjs(rawDate, "MMMM DD, YYYY"),
              gross_revenue_without_tax: values.gross_revenue_without_tax,
              gross_revenue_with_tax: values.gross_revenue_with_tax,
            }))
            .sort((a, b) => a.dateObj - b.dateObj),
        })

        const selectedMetricKeys = Object.keys(data.targeted || {})
        setVisibleMetrics(selectedMetricKeys)
      }
    } catch (error) {
      if (requestId === latestRequestRef.current) {
        console.error("Error fetching metrics:", error)
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setDataLoading(false)
      }
    }
  }

  const getCurrencySymbol = (country) => {
    const symbolMap = {
      US: "$",
      GB: "£",
      EU: "€",
      JP: "¥",
    }
    return symbolMap[country] || "$"
  }

  const currencySymbol = getCurrencySymbol(country)

  const formatCurrency = (value) =>
    `${currencySymbol}${(value ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const today = API_TODAY

  const handlePrevious = () => {
    if (DateStartDate && DateEndDate) {
      const rangeDays = dayjs(DateEndDate).diff(dayjs(DateStartDate), "day") + 1
      setCurrentDates((prev) => ({
        displayDate: prev.displayDate.subtract(rangeDays, "day"),
        selectedDate: prev.selectedDate.subtract(rangeDays, "day"),
      }))
    } else {
      const newSelectedDate = currentDates.selectedDate.subtract(1, "day")
      setCurrentDates((prev) => ({
        ...prev,
        selectedDate: newSelectedDate,
      }))
    }
  }

  const handleNext = () => {
    if (DateStartDate && DateEndDate) {
      const rangeDays = dayjs(DateEndDate).diff(dayjs(DateStartDate), "day") + 1
      const newEndDate = dayjs(currentDates.selectedDate).add(rangeDays, "day")
      if (newEndDate.isAfter(today)) return
      setCurrentDates((prev) => ({
        displayDate: prev.displayDate.add(rangeDays, "day"),
        selectedDate: prev.selectedDate.add(rangeDays, "day"),
      }))
    } else if (!currentDates.selectedDate.isSame(today, "day")) {
      const newSelectedDate = currentDates.selectedDate.add(1, "day")
      setCurrentDates((prev) => ({
        ...prev,
        selectedDate: newSelectedDate,
      }))
    }
  }

  const getGraphPoints = (metric = "gross_revenue_with_tax") => {
    const maxValue = Math.max(...dataState.bindGraph.map((d) => d[metric]), 1)
    const width = 280
    return dataState.bindGraph
      .map((item, index) => {
        const x = (index / (dataState.bindGraph.length - 1)) * width + 10
        const y = 50 - (item[metric] / maxValue) * 30
        return `${x},${y}`
      })
      .join(" ")
  }

  const getCirclePoints = (metric = "gross_revenue_with_tax") => {
    const maxValue = Math.max(...dataState.bindGraph.map((d) => d[metric]), 1)
    const width = 280
    return dataState.bindGraph.map((item, index) => ({
      ...item,
      cx: (index / (dataState.bindGraph.length - 1)) * width + 10,
      cy: 50 - (item[metric] / maxValue) * 30,
      value: item[metric],
    }))
  }

  const getDisplayDateText = () => {
    if (DateStartDate && DateEndDate) {
      return `${dayjs(DateStartDate).format("MMM D")} - ${dayjs(DateEndDate).format("MMM D")}`
    }
    return currentDates.selectedDate.format("ddd, MMM DD")
  }

  const METRICS_CONFIG = {
    gross_revenue_with_tax: {
      title: "Gross Revenue",
      currencySymbol: currencySymbol,
    },
    total_orders: {
      title: "Orders",
    },
    total_units: {
      title: "Units Sold",
    },
    total_tax: {
      title: "Total Tax",
      currencySymbol: currencySymbol,
    },
    refund: {
      title: "Refunds",
    },
    total_cogs: {
      title: "COGS",
      currencySymbol: currencySymbol,
    },
    net_profit: {
      title: "Net Profit",
      currencySymbol: currencySymbol,
    },
  }

  useEffect(() => {
    const today = API_TODAY
    let newDisplayDate, newSelectedDate

    if (DateStartDate && DateEndDate) {
      newDisplayDate = dayjs(DateStartDate)
      newSelectedDate = dayjs(DateEndDate)
    } else {
      switch (widgetData) {
        case "Today":
          newDisplayDate = today
          newSelectedDate = today
          break
        case "Yesterday":
          newDisplayDate = today.subtract(1, "day")
          newSelectedDate = today.subtract(1, "day")
          break
        case "Last 7 days":
          newDisplayDate = today.subtract(6, "day")
          newSelectedDate = today
          break
        case "Last 30 days":
          newDisplayDate = today.subtract(29, "day")
          newSelectedDate = today
          break
        default:
          newDisplayDate = today
          newSelectedDate = today
      }
    }

    setCurrentDates({
      displayDate: newDisplayDate,
      selectedDate: newSelectedDate,
    })
  }, [widgetData, DateStartDate, DateEndDate])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Executive Overview</h3>
      </div>

      {dataLoading ? (
        <div style={styles.loadingContainer}>Loading...</div>
      ) : (
        <>
          {/* Date Navigation */}
          <div style={styles.dateNavigation}>
            <button style={styles.navButton} onClick={handlePrevious} disabled={dataLoading}>
              ←
            </button>
            <span style={styles.dateText}>{getDisplayDateText()}</span>
            <button
              style={styles.navButton}
              onClick={handleNext}
              disabled={dataLoading || currentDates.selectedDate.isSame(API_TODAY, "day")}
            >
              →
            </button>
          </div>

          {/* Main Metric - Gross Revenue */}
          {visibleMetrics.includes("gross_revenue_with_tax") && (
            <div style={styles.mainMetricSection}>
              <div style={styles.mainMetricLabel}>Gross Revenue</div>
              <div style={styles.mainMetricValue}>{formatCurrency(dataState.metrics.gross_revenue_with_tax)}</div>
              <div style={styles.mainMetricChange}>
                <span
                  style={{
                    color: String(dataState.difference.gross_revenue_with_tax).startsWith("-") ? "#e74c3c" : "#27ae60",
                  }}
                >
                  {String(dataState.difference.gross_revenue_with_tax).startsWith("-") ? "↓" : "↑"}{" "}
                  {formatCurrency(Math.abs(dataState.difference.gross_revenue_with_tax || 0))}
                </span>
              </div>
            </div>
          )}

          {/* Chart */}
          {visibleMetrics.includes("gross_revenue_with_tax") && dataState.bindGraph.length > 0 && (
            <div style={styles.chartContainer} ref={graphContainerRef}>
              <svg ref={svgRef} width="100%" height="120" style={styles.svg}>
                {/* Grid lines */}
                {[20, 30, 40].map((y, idx) => (
                  <line key={idx} x1="0" y1={y} x2="100%" y2={y} stroke="#eee" strokeWidth="1" />
                ))}
                {/* X-axis */}
                <line x1="0" y1="48" x2="100%" y2="48" stroke="#000" strokeWidth="1" />
                {/* Revenue line */}
                <polyline
                  points={getGraphPoints("gross_revenue_with_tax")}
                  style={{
                    fill: "none",
                    stroke: "#2c3e50",
                    strokeWidth: 2,
                  }}
                />
                {/* Circle points */}
                {getCirclePoints("gross_revenue_with_tax").map((point, index) => (
                  <circle
                    key={`point-${index}`}
                    cx={point.cx}
                    cy={point.cy}
                    r="4"
                    fill="#2c3e50"
                    stroke="white"
                    strokeWidth="1.5"
                    style={{
                      pointerEvents: "none",
                    }}
                  />
                ))}
                {/* Hover circles */}
                {getCirclePoints("gross_revenue_with_tax").map((point, index) => (
                  <circle
                    key={`hover-${index}`}
                    cx={point.cx}
                    cy={point.cy}
                    r="10"
                    fill="transparent"
                    stroke="transparent"
                    style={{
                      pointerEvents: "all",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation()
                      setTooltipData({ ...point, index })
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation()
                      setTimeout(() => setTooltipData(null), 50)
                    }}
                  />
                ))}
              </svg>
              <div style={styles.chartDateRange}>
                <span>{dataState.bindGraph[0]?.date}</span>
                <span>{dataState.bindGraph[dataState.bindGraph.length - 1]?.date}</span>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div style={styles.metricsGrid}>
            {["total_orders", "total_units", "total_tax", "refund", "total_cogs", "net_profit"]
              .filter((id) => visibleMetrics.includes(id))
              .map((id) => {
                const item = METRICS_CONFIG[id]
                return (
                  <MetricItem
                    key={id}
                    title={item.title}
                    value={dataState.metrics[id]}
                    change={dataState.difference[id]}
                    isNegative={String(dataState.difference[id]).startsWith("-")}
                    currencySymbol={item.currencySymbol}
                    loading={dataLoading}
                  />
                )
              })}
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "100vw",
    backgroundColor: "#fff",
    padding: "0",
    margin: "0",
    fontFamily: "system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    overflowX: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0",
    color: "#020202",
  },
  filterButton: {
    padding: "8px 16px",
    border: "2px solid #000",
    borderRadius: "8px",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  dateNavigation: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    borderBottom: "1px solid #e0e0e0",
  },
  navButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "8px",
    color: "#485E75",
  },
  dateText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#485E75",
    minWidth: "120px",
    textAlign: "center",
  },
  mainMetricSection: {
    padding: "24px 16px",
    borderBottom: "1px solid #e0e0e0",
  },
  mainMetricLabel: {
    fontSize: "14px",
    color: "#485E75",
    marginBottom: "8px",
  },
  mainMetricValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#020202",
    marginBottom: "8px",
  },
  mainMetricChange: {
    fontSize: "14px",
    fontWeight: "600",
  },
  chartContainer: {
    padding: "16px",
    borderBottom: "1px solid #e0e0e0",
  },
  svg: {
    width: "100%",
    height: "120px",
  },
  chartDateRange: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#666",
    marginTop: "8px",
    paddingX: "16px",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0",
    padding: "0",
  },
  metricItem: {
    padding: "16px",
    // borderRight: "1px solid #e0e0e0",
    // borderBottom: "1px solid #e0e0e0",
  },
  metricTitle: {
    fontSize: "12px",
    color: "#485E75",
    marginBottom: "8px",
  },
  metricValueContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  metricValue: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#020202",
  },
  metricChange: {
    fontSize: "12px",
    fontWeight: "600",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "18px",
    color: "#666",
  },
}

export default TestCard
