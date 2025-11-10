"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const metricColors = {
  gross_revenue: "#00b894",
  gross_revenue_with_tax: "#2ecc71",
  net_profit: "#6629b3",
  profit_margin: "#0984e3",
  orders: "#f14682",
  units_sold: "#000080",
  refund_amount: "#e6770d",
  refund_quantity: "#600101",
}

const initialMetricConfig = [
  {
    id: "gross_revenue_with_tax",
    label: "Gross Revenue",
    value: null,
    change: null,
    color: "#00b894",
    show: false,
    isCurrency: true,
  },
  {
    id: "net_profit",
    label: "Net Profit",
    value: null,
    change: null,
    color: "#6629b3",
    show: false,
    isCurrency: true,
  },
  {
    id: "profit_margin",
    label: "Profit Margin",
    value: null,
    change: null,
    color: "#0984e3",
    show: false,
  },
  {
    id: "orders",
    label: "Orders",
    value: null,
    change: null,
    color: "#f14682",
    show: false,
  },
  {
    id: "units_sold",
    label: "Units Sold",
    value: null,
    change: null,
    color: "#000080",
    show: false,
  },
  {
    id: "refund_amount",
    label: "Refund Amount",
    value: null,
    change: null,
    color: "#e6770d",
    show: false,
    isCurrency: true,
  },
  {
    id: "refund_quantity",
    label: "Refund Quantity",
    value: null,
    change: null,
    color: "#600101",
    show: false,
  },
]

const metricLabels = {
  gross_revenue: "Gross Revenue",
  gross_revenue_with_tax: "Gross Revenue",
  net_profit: "Net Profit",
  profit_margin: "Profit Margin",
  orders: "Orders",
  units_sold: "Units Sold",
  refund_amount: "Refund Amount",
  refund_quantity: "Refund Quantity",
}

const CompareChart = ({
  startDate,
  endDate,
  country,
  widgetData,
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
}) => {
  const [chartData, setChartData] = useState({})
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState([])
  const [visibleMetrics, setVisibleMetrics] = useState([])
  const [selectedValue, setSelectedValue] = useState("")
  const [showComparisonPill, setShowComparisonPill] = useState(false)
  const [comparisonText, setComparisonText] = useState("")
  const [compareDropDown, setCompareDropDown] = useState({})
  const [compareTotal, setCompareTotal] = useState({})
  const [compareDateFilter, setCompareDateFilter] = useState("")
  const lastParamsRef = useRef("")

  const [selectedStartDate, setSelectedStartDate] = useState(null)
  const [selectedEndDate, setSelectedEndDate] = useState(null)

  const options = [
    { key: "previous_period", label: "Previous period" },
    { key: "previous_week", label: "Previous week" },
    { key: "previous_month", label: "Previous month" },
    { key: "previous_year", label: "Previous year" },
  ]

  const fetchRevenue = async () => {
    setLoading(true)
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      const userId = userData?.id || ""
      const payload = {
        preset: widgetData,
        country: country,
        marketplace_id: marketPlaceId?.id,
        user_id: userId,
        compare_startdate: selectedStartDate,
        compare_enddate: selectedEndDate,
        brand_id: brand_id,
        product_id: product_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        start_date: DateStartDate,
        end_date: DateEndDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }

      const response = await fetch(`${process.env.REACT_APP_IP}updatedRevenueWidgetAPIView/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      const apiData = data.data

      setCompareDropDown(apiData.comapre_past || {})
      setCompareTotal(apiData.compare_total || {})
      setChartData(apiData?.graph || {})

      const formatCurrency = (amount) =>
        `$${Number(amount || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`

      const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`
      const formatNumber = (value) => Number(value || 0).toLocaleString()

      const availableMetrics = Object.keys(apiData.total)
      const updatedMetricConfig = initialMetricConfig.map((metric) => ({
        ...metric,
        show: availableMetrics.includes(metric.id),
      }))

      setMetrics(
        updatedMetricConfig
          .filter((m) => m.show)
          .map((metric) => ({
            label: metricLabels[metric.id],
            value: metric.isCurrency
              ? formatCurrency(apiData.total[metric.id])
              : metric.isPercentage
                ? formatPercentage(apiData.total[metric.id])
                : formatNumber(apiData.total[metric.id]),
            compareValue:
              apiData.compare_total?.[metric.id] !== undefined
                ? metric.isCurrency
                  ? formatCurrency(apiData.compare_total[metric.id])
                  : metric.isPercentage
                    ? formatPercentage(apiData.compare_total[metric.id])
                    : formatNumber(apiData.compare_total[metric.id])
                : null,
            color: metricColors[metric.id],
            id: metric.id,
            isPercentage: metric.isPercentage,
            isCurrency: metric.isCurrency,
          })),
      )

      setVisibleMetrics(updatedMetricConfig.filter((m) => m.show).map((m) => m.id))
    } catch (error) {
      console.error("Error fetching revenue data:", error)
      setChartData({})
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (value) => {
    setSelectedValue(value)

    if (value !== "custom") {
      const start = compareDropDown?.[value]?.start
      const end = compareDropDown?.[value]?.end

      if (start && end) {
        setSelectedStartDate(start)
        setSelectedEndDate(end)

        const selectedOption = options.find((opt) => opt.key === value)
        if (selectedOption) {
          setComparisonText(`${start} - ${end}`)
          setShowComparisonPill(true)
        }
      }
    } else if (value === "custom") {
      setComparisonText("Custom date range")
      setShowComparisonPill(true)
    } else {
      setShowComparisonPill(false)
      setComparisonText("")
    }
  }

  const handleMetricToggle = (metricId) => {
    setVisibleMetrics((prev) => (prev.includes(metricId) ? prev.filter((m) => m !== metricId) : [...prev, metricId]))
  }

  const handleClosePill = () => {
    setSelectedValue("")
    setSelectedEndDate("")
    setSelectedStartDate("")
    setShowComparisonPill(false)
    setComparisonText("")
  }

  useEffect(() => {
    const currentParams = JSON.stringify({
      country,
      widgetData,
      marketPlaceId,
      selectedEndDate,
      selectedValue,
      selectedStartDate,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
      DateStartDate,
      DateEndDate,
    })

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams
      fetchRevenue()
    }
  }, [
    country,
    widgetData,
    marketPlaceId,
    selectedEndDate,
    selectedValue,
    selectedStartDate,
    brand_id,
    product_id,
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
  ])

  useEffect(() => {
    if (!chartData || Object.keys(chartData).length === 0) return

    const localGraphData = Object.values(chartData)
    if (localGraphData.length > 0) {
      const startDate = new Date(localGraphData[0].current_date)
      const endDate = new Date(localGraphData[localGraphData.length - 1].current_date)

      const formatShortDate = (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      const formattedStart = formatShortDate(startDate)
      const formattedEnd = formatShortDate(endDate)
      const year = endDate.getFullYear()

      const displayRange =
        widgetData === "Today" || widgetData === "Yesterday"
          ? `${formattedStart}, ${year}`
          : `${formattedStart} - ${formattedEnd}, ${year}`

      setCompareDateFilter(displayRange)
    }
  }, [chartData, widgetData])

  const formattedData = useMemo(() => {
    if (!chartData || Object.keys(chartData).length === 0) {
      return []
    }

    return Object.values(chartData).map((item) => ({
      time: new Date(item.current_date).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      }),
      date: item.current_date,
      compareDate: item.compare_date,
      grossRevenue: item.gross_revenue_with_tax ?? 0,
      netProfit: item.net_profit ?? 0,
      profitMargin: item.profit_margin ?? 0,
      orders: item.orders ?? 0,
      unitsSold: item.units_sold ?? 0,
      refundAmount: item.refund_amount ?? 0,
      refundQuantity: item.refund_quantity ?? 0,
      compareGrossRevenue: item.compare_gross_revenue_with_tax ?? null,
      compareNetProfit: item.compare_net_profit ?? null,
      compareProfitMargin: item.compare_profit_margin ?? null,
      compareOrders: item.compare_orders ?? null,
      compareUnitsSold: item.compare_units_sold ?? null,
      compareRefundAmount: item.compare_refund_amount ?? null,
      compareRefundQuantity: item.compare_refund_quantity ?? null,
    }))
  }, [chartData])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) {
      return null
    }

    const currentDataPoint = payload[0]?.payload
    const formatValue = (val, key) => {
      if (typeof val === "number") {
        if (key.toLowerCase().includes("margin") || key.toLowerCase() === "acos") {
          return `${val.toFixed(2)}%`
        } else if (
          key.toLowerCase().includes("revenue") ||
          key.toLowerCase().includes("profit") ||
          key.toLowerCase().includes("amount")
        ) {
          return `$${val.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        } else {
          return val.toLocaleString()
        }
      }
      return "n/a"
    }

    return (
      <div
        style={{
          backgroundColor: "#fff",
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          fontSize: "13px",
          maxWidth: "90vw",
        }}
      >
        {payload.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "4px",
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
            ></span>
            <span style={{ color: "#485E75", marginRight: "8px" }}>{item.name}:</span>
            <span style={{ fontWeight: "bold", color: "#333" }}>{formatValue(item.value, item.name)}</span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
          fontSize: "16px",
          color: "#666",
        }}
      >
        Loading...
      </div>
    )
  }

  if (formattedData.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
        No data available for the selected period.
      </div>
    )
  }

  return (
    <div style={{ padding: "16px", paddingTop: "20px" }}>
      {/* Metrics List */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#1a1a1a",
              marginBottom: "4px",
            }}
          >
            Revenue
          </div>
          <div style={{ fontSize: "13px", color: "#999" }}>Compare to past</div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {metrics.map((metric, index) => {
            const isSelected = visibleMetrics.includes(metric.id)
            return (
              <div
                key={index}
                onClick={() => handleMetricToggle(metric.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  backgroundColor: isSelected ? "#f0f7ff" : "#fff",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: "1px solid #e0e0e0",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleMetricToggle(metric.id)}
                  style={{
                    width: "18px",
                    height: "18px",
                    marginRight: "12px",
                    cursor: "pointer",
                    accentColor: metric.color,
                  }}
                />

                {/* Metric Info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: metric.color,
                        marginRight: "8px",
                      }}
                    ></span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {metric.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#000",
                      marginLeft: "16px",
                    }}
                  >
                    {metric.value}
                  </div>
                </div>

                {/* Compare Value */}
                {metric.compareValue && (
                  <div style={{ textAlign: "right", marginLeft: "12px" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "2px",
                      }}
                    >
                      Compare
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: metric.compareValue > 0 ? "#00b894" : "#e14d2a",
                      }}
                    >
                      {metric.compareValue}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Comparison Selector */}
      {visibleMetrics.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          {!showComparisonPill ? (
            <select
              value={selectedValue}
              onChange={(e) => handleChange(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">Compare to past</option>
              {options.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
              <option value="custom">Custom date range</option>
            </select>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#e0f2f7",
                borderRadius: "20px",
                padding: "10px 16px",
                fontSize: "14px",
                color: "#1e88e5",
              }}
            >
              <span>Comparing to {comparisonText}</span>
              <button
                onClick={handleClosePill}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {visibleMetrics.length > 0 && (
        <div style={{ marginTop: "24px", backgroundColor: "#fafafa", padding: "12px", borderRadius: "8px" }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    hour12: true,
                  })
                }}
                tick={{ fontSize: 11 }}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />

              {/* Render lines for visible metrics */}
              {visibleMetrics.includes("gross_revenue_with_tax") && (
                <>
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="grossRevenue"
                    stroke={metricColors.gross_revenue_with_tax}
                    dot={false}
                    strokeWidth={2}
                    name="Gross Revenue"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="compareGrossRevenue"
                    stroke={metricColors.gross_revenue_with_tax}
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Compare Gross Revenue"
                  />
                </>
              )}

              {visibleMetrics.includes("net_profit") && (
                <>
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="netProfit"
                    stroke={metricColors.net_profit}
                    dot={false}
                    strokeWidth={2}
                    name="Net Profit"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="compareNetProfit"
                    stroke={metricColors.net_profit}
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Compare Net Profit"
                  />
                </>
              )}

              {visibleMetrics.includes("profit_margin") && (
                <>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="profitMargin"
                    stroke={metricColors.profit_margin}
                    dot={false}
                    strokeWidth={2}
                    name="Profit Margin"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="compareProfitMargin"
                    stroke={metricColors.profit_margin}
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Compare Profit Margin"
                  />
                </>
              )}

              {visibleMetrics.includes("orders") && (
                <>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke={metricColors.orders}
                    dot={false}
                    strokeWidth={2}
                    name="Orders"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="compareOrders"
                    stroke={metricColors.orders}
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Compare Orders"
                  />
                </>
              )}

              {visibleMetrics.includes("units_sold") && (
                <>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="unitsSold"
                    stroke={metricColors.units_sold}
                    dot={false}
                    strokeWidth={2}
                    name="Units Sold"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="compareUnitsSold"
                    stroke={metricColors.units_sold}
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Compare Units Sold"
                  />
                </>
              )}

              {visibleMetrics.includes("refund_amount") && (
                <>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="refundAmount"
                    stroke={metricColors.refund_amount}
                    dot={false}
                    strokeWidth={2}
                    name="Refund Amount"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="compareRefundAmount"
                    stroke={metricColors.refund_amount}
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Compare Refund Amount"
                  />
                </>
              )}

              {visibleMetrics.includes("refund_quantity") && (
                <>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="refundQuantity"
                    stroke={metricColors.refund_quantity}
                    dot={false}
                    strokeWidth={2}
                    name="Refund Quantity"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="compareRefundQuantity"
                    stroke={metricColors.refund_quantity}
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Compare Refund Quantity"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default CompareChart
