

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { formatCurrency } from "../../../../utils/currencyFormatter"


const formatterLong = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
})

const PerformanceCard = ({
  title,
  country,
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
  previous,
  netPrevious,
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showTooltip, setShowTooltip] = useState(null)

  const calculatePercentageChange = (current, previous) => {
    const curr = Number.parseFloat(current?.replace(/[^\d.-]/g, "") || "0")
    const prev = Number.parseFloat(previous?.replace(/[^\d.-]/g, "") || "0")
    if (prev === 0) return 0
    return ((curr - prev) / prev) * 100
  }

  const grossRevenuePercent = calculatePercentageChange(grossRevenue, previous)
  const netProfitPercent = calculatePercentageChange(netProfit, netPrevious)

  const renderChangeIndicator = (value) => {
    if (!value) return null
    const isNegative = value.startsWith("-")
    return (
      <span
        style={{
          color: isNegative ? "rgb(51, 204, 153)" : "red",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {isNegative ? "↑" : "↓"}
        {value}
      </span>
    )
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h3 style={styles.cardTitle}>{title}</h3>
          <p style={styles.dateText}>{dateRange}</p>
        </div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowMenu(!showMenu)} style={styles.menuButton}>
            ⋮
          </button>
          {showMenu && (
            <div style={styles.menu}>
              <button style={styles.menuItem}>Remove</button>
            </div>
          )}
        </div>
      </div>

      {/* Gross Revenue & Expenses Row */}
      <div style={styles.metricsRow}>
        <div
          style={styles.metricBox}
          onMouseEnter={() => setShowTooltip("revenue")}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <p style={styles.metricLabel}>Gross Revenue</p>
          <p style={styles.metricValue}>{grossRevenue}</p>
          <div style={styles.percentContainer}>
            <p
              style={{
                ...styles.percentText,
                color: grossRevenuePercent > 0 ? "rgb(51, 204, 153)" : "rgb(51, 204, 153)",
              }}
            >
              {Math.abs(grossRevenuePercent).toFixed(2)}%
            </p>
            {grossRevenuePercent > 0 ? (
              <span style={{ color: "rgb(51, 204, 153)" }}>↑</span>
            ) : (
              <span style={{ color: "red" }}>↓</span>
            )}
          </div>
          {showTooltip === "revenue" && (
            <div style={styles.tooltip}>
              <p style={styles.tooltipTitle}>Current vs Previous</p>
              <div style={styles.tooltipRow}>
                <span>{dateRangeFormat}</span>
                <span>{grossRevenue}</span>
              </div>
              <div style={styles.tooltipRow}>
                <span>{dateRangePrevFormat}</span>
                <span>{previous}</span>
              </div>
            </div>
          )}
        </div>

        <div style={styles.metricBox}>
          <p style={styles.metricLabel}>Expenses</p>
          <p style={styles.metricValue}>{expenses}</p>
        </div>
      </div>

      <div
        style={{ ...styles.metricsRow, borderRadius: "4px", padding: "12px" }}
      >
        <div
          style={styles.metricBox}
          onMouseEnter={() => setShowTooltip("profit")}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <p style={styles.metricLabel}>Net Profit</p>
          <p style={styles.metricValue}>{netProfit}</p>
          <div style={styles.percentContainer}>
            <p
              style={{ ...styles.percentText, color: netProfitPercent > 0 ? "rgb(51, 204, 153)" : "rgb(51, 204, 153)" }}
            >
              {Math.abs(netProfitPercent).toFixed(2)}%
            </p>
            {netProfitPercent > 0 ? (
              <span style={{ color: "rgb(51, 204, 153)" }}>↑</span>
            ) : (
              <span style={{ color: "red" }}>↓</span>
            )}
          </div>
          {showTooltip === "profit" && (
            <div style={styles.tooltip}>
              <p style={styles.tooltipTitle}>Current vs Previous</p>
              <div style={styles.tooltipRow}>
                <span>{dateRangeFormat}</span>
                <span>{netProfit}</span>
              </div>
              <div style={styles.tooltipRow}>
                <span>{dateRangePrevFormat}</span>
                <span>{netPrevious}</span>
              </div>
            </div>
          )}
        </div>

        <div style={styles.metricBox}>
          <p style={styles.metricLabel}>Margin</p>
          <p style={styles.metricValue}>{margin}</p>
          <a href="#" style={styles.explainLink}>
            Explain
          </a>
        </div>
      </div>

      {/* Bottom Metrics Row */}
      <div style={styles.bottomMetrics}>
        <div style={styles.bottomMetricBox}>
          <p style={styles.bottomLabel}>Orders</p>
          <p style={styles.bottomValue}>{orders}</p>
        </div>
        <div style={styles.bottomMetricBox}>
          <p style={styles.bottomLabel}>Units Sold</p>
          <p style={styles.bottomValue}>{unitsSold}</p>
        </div>
        <div style={styles.bottomMetricBox}>
          <p style={styles.bottomLabel}>Refunds</p>
          <p style={styles.bottomValue}>{refunds}</p>
        </div>
      </div>
    </div>
  )
}

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
  const [metricsData, setMetricsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const lastParamsRef = useRef("")

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
    })

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams
      fetchMetricsComparission(widgetData)
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
  ])

  const fetchMetricsComparission = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}getPeriodWiseDataCustom/`, {
        country: country,
        preset: widgetData,
        marketplace_id: marketPlaceId?.id,
        brand_id: brand_id,
        product_id: product_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        start_date: DateStartDate,
        end_date: DateEndDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      setMetricsData(response.data)
    } catch (error) {
      console.error("Error fetching metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const transformData = (data, country) => {
    if (!data) return []

    const safeFormatDate = (dateString, formatter) => {
      try {
        return dateString ? formatter.format(new Date(dateString)) : ""
      } catch (e) {
        console.warn("Date formatting error:", e)
        return ""
      }
    }

    const safeGet = (obj, path, defaultValue = 0) => {
      try {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj) ?? defaultValue
      } catch (e) {
        return defaultValue
      }
    }

    const periods = ["today", "yesterday", "last7Days", "custom"]

    return periods.reduce((acc, period) => {
      if (!data[period]) return acc

      const periodData = data[period]

      try {
        const getLocal = (range, key, fallbackKey = key) => range?.[key] || range?.[fallbackKey]

        const cardData = {
          title:
            period === "last7Days"
              ? "Last 7 Days"
              : period === "today"
                ? "Today"
                : period.charAt(0).toUpperCase() + period.slice(1),

          dateRange: periodData.dateRanges?.current
            ? `${safeFormatDate(
                getLocal(periodData.dateRanges.current, "from_local", "from"),
                formatterLong,
              )} - ${safeFormatDate(getLocal(periodData.dateRanges.current, "to_local", "to"), formatterLong)}`
            : "",

          dateRangePrev: periodData.dateRanges?.previous
            ? `${safeFormatDate(
                getLocal(periodData.dateRanges.previous, "from_local", "from"),
                formatterLong,
              )} - ${safeFormatDate(getLocal(periodData.dateRanges.previous, "to_local", "to"), formatterLong)}`
            : "",

          dateRangeFormat: periodData.dateRanges?.current
            ? `${safeFormatDate(
                getLocal(periodData.dateRanges.current, "from_local", "from"),
                new Intl.DateTimeFormat("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }),
              )} - ${safeFormatDate(
                getLocal(periodData.dateRanges.current, "to_local", "to"),
                new Intl.DateTimeFormat("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }),
              )}`
            : "",

          dateRangePrevFormat: periodData.dateRanges?.previous
            ? `${safeFormatDate(
                getLocal(periodData.dateRanges.previous, "from_local", "from"),
                new Intl.DateTimeFormat("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }),
              )} - ${safeFormatDate(
                getLocal(periodData.dateRanges.previous, "to_local", "to"),
                new Intl.DateTimeFormat("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }),
              )}`
            : "",

          grossRevenue: formatCurrency(safeGet(periodData, "summary.grossRevenue.current", 0), country),
          expenses: `-${formatCurrency(safeGet(periodData, "summary.expenses.current", 0), country)}`,
          netProfit: formatCurrency(safeGet(periodData, "summary.netProfit.current", 0), country),
          netPrevious: formatCurrency(safeGet(periodData, "summary.netProfit.previous", 0), country),
          margin: `${safeGet(periodData, "summary.margin.current", 0).toFixed(2)}%`,
          orders: safeGet(periodData, "summary.orders.current", 0),
          unitsSold: safeGet(periodData, "summary.unitsSold.current", 0),
          refunds: safeGet(periodData, "summary.refunds.current", 0),
          previous: formatCurrency(safeGet(periodData, "summary.grossRevenue.previous", 0), country),
          netProfitCalculation: periodData.netProfitCalculation || {},
        }

        acc.push(cardData)
      } catch (error) {
        console.error(`Error processing ${period} data:`, error)
      }

      return acc
    }, [])
  }

  const processedData = metricsData ? transformData(metricsData, country) : []

  return (
    <div style={styles.container}>
      <h2 style={styles.mainTitle}>Performance Summary</h2>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div style={styles.cardsContainer}>
          {processedData.map((cardData, idx) => (
            <PerformanceCard key={idx} {...cardData} country={country} />
          ))}
        </div>
      )}
    </div>
  )
}

// Mobile-first inline styles
const styles = {
  container: {
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
    padding: "16px",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  mainTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#13191F",
    marginBottom: "16px",
    fontFamily: "'Nunito Sans', sans-serif",
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#13191F",
    margin: "0 0 4px 0",
  },
  dateText: {
    fontSize: "12px",
    color: "#485E75",
    margin: "0",
  },
  menuButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "4px 8px",
  },
  menu: {
    position: "absolute",
    top: "24px",
    right: "0",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    zIndex: 10,
  },
  menuItem: {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "12px",
    color: "#485E75",
  },
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "12px",
  },
  metricBox: {
    position: "relative",
  },
  metricLabel: {
    fontSize: "12px",
    color: "#485E75",
    margin: "0 0 4px 0",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#13191F",
    margin: "0 0 4px 0",
  },
  percentContainer: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  percentText: {
    fontSize: "12px",
    margin: "0",
    fontWeight: "500",
  },
  tooltip: {
    position: "absolute",
    top: "100%",
    left: "0",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
    zIndex: 20,
    minWidth: "200px",
  },
  tooltipTitle: {
    fontWeight: "600",
    color: "#121212",
    margin: "0 0 4px 0",
  },
  tooltipRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
    color: "#485E75",
  },
  explainLink: {
    fontSize: "12px",
    color: "#0066cc",
    textDecoration: "none",
    marginTop: "4px",
    display: "inline-block",
  },
  bottomMetrics: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #e0e0e0",
  },
  bottomMetricBox: {
    textAlign: "center",
  },
  bottomLabel: {
    fontSize: "11px",
    color: "#485E75",
    margin: "0 0 4px 0",
    fontWeight: "500",
  },
  bottomValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#13191F",
    margin: "0",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "300px",
    gap: "12px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #0066cc",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
}

export default MetricCard
