"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

const colors = [
  "#0d47a1",
  "#00bcd4",
  "#00897b",
  "#9c27b0",
  "#f44336",
  "#FF9800",
  "#8BC34A",
  "#03A9F4",
  "#FF5722",
  "#795548",
]

const CustomTooltip = ({ active, payload, label, productList, tab }) => {
  if (!active || !payload || payload.length === 0) return null

  const formattedDate = label.includes(":") ? dayjs(label).format("MMM D, h:mm A") : dayjs(label).format("MMM D")

  const formatTooltipValue = (value, tab) => {
    switch (tab) {
      case 0:
        return `$${value.toFixed(2)}`
      case 1:
        return `${value} units`
      case 2:
        return `${value} refunds`
      default:
        return value
    }
  }

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        minWidth: "220px",
        fontSize: "12px",
        zIndex: 1000,
      }}
    >
      <div style={{ fontWeight: "600", marginBottom: "8px" }}>{formattedDate}</div>
      {payload.map((entry) => {
        const product = productList.find((p) => p.id === entry.dataKey)
        if (!product) return null
        return (
          <div
            key={entry.dataKey}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              paddingBottom: "6px",
              borderBottom: "1px solid #eee",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: product.color,
                }}
              />
              <span style={{ fontSize: "11px" }}>{product.sku}</span>
            </div>
            <div style={{ fontWeight: "600" }}>{formatTooltipValue(entry.value, tab)}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function TopProductsChart({
  country = "US",
  startDate,
  endDate,
  widgetData = "Today",
  marketPlaceId,
  brand_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
}) {
  const [tab, setTab] = useState(0)
  const [productList, setProductList] = useState([])
  const [activeProducts, setActiveProducts] = useState([])
  const [bindGraph, setBindGraph] = useState([])
  const [loading, setLoading] = useState(false)
  const [copiedAsin, setCopiedAsin] = useState(null)

  const stableBrandId = JSON.stringify(brand_id)
  const stableManufacturer = JSON.stringify(manufacturer_name)
  const isTodayOrYesterday = widgetData === "Today" || widgetData === "Yesterday"

  const userData = JSON.parse(localStorage.getItem("user") || "{}")
  const userId = userData?.id || ""
  const copyTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async (value) => {
    if (!value) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = value
        textarea.style.position = "fixed"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      setCopiedAsin(value)
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedAsin(null)
      }, 2000)
    } catch (err) {
      console.error("Copy failed", err)
    }
  }

  const getSortByValue = (tab) => {
    switch (tab) {
      case 0:
        return "price"
      case 1:
        return "units_sold"
      case 2:
        return "refund"
      default:
        return "price"
    }
  }

  const getDataField = (item) => {
    switch (tab) {
      case 0:
        return item.total_price
      case 1:
        return item.total_units
      case 2:
        return item.refund_qty
      default:
        return item.total_price
    }
  }

  const formatYAxisTick = (value) => {
    switch (tab) {
      case 0:
        if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(1)}K`
        } else {
          return `$${value.toFixed(0)}`
        }
      case 1:
        if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`
        } else {
          return Math.round(value).toString()
        }
      case 2:
        return Math.round(value).toString()
      default:
        return `$${value.toFixed(0)}`
    }
  }

  const fetchTopProducts = async () => {
    setLoading(true)
    try {
      const params = {
        sortBy: getSortByValue(tab),
        user_id: userId,
        marketplace_id: marketPlaceId?.id || "1",
        brand_id: brand_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        timeZone: "US/Pacific",
      }

      if (DateStartDate && DateEndDate) {
        params.start_date = DateStartDate
        params.end_date = DateEndDate
      } else {
        params.preset = widgetData
      }

      const response = await axios.post(`${process.env.REACT_APP_IP}get_top_products/`, params)

      if (response.data?.data?.results?.items) {
        const items = response.data.data.results.items
        const products = items.map((item, index) => ({
          id: `product_${index}`,
          topIds: item.id,
          name: item.product,
          sku: item.sku,
          asin: item.asin,
          color: colors[index % colors.length],
          img: item.product_image || "",
          chart: item.chart || {},
          total_price: item.total_price,
          total_units: item.total_units,
          refund_qty: item.refund_qty,
        }))

        setProductList(products)
        setActiveProducts(products.map((p) => p.id))

        const chartDataMap = {}
        const allTimestamps = new Set()

        products.forEach((product) => {
          Object.entries(product.chart || {}).forEach(([datetime, value]) => {
            let timeKey
            if (isTodayOrYesterday) {
              timeKey = dayjs(datetime).format("YYYY-MM-DD HH:mm:ss")
            } else {
              timeKey = datetime.split(" ")[0]
            }
            allTimestamps.add(timeKey)
            if (!chartDataMap[timeKey]) {
              chartDataMap[timeKey] = { date: timeKey }
            }
            chartDataMap[timeKey][product.id] = isTodayOrYesterday
              ? value
              : (chartDataMap[timeKey][product.id] || 0) + value
          })
        })

        const sortedChartData = [...allTimestamps]
          .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
          .map((timestamp) => chartDataMap[timestamp])

        setBindGraph(sortedChartData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (widgetData || (DateStartDate && DateEndDate)) {
      fetchTopProducts()
    }
  }, [
    tab,
    widgetData,
    marketPlaceId,
    stableBrandId,
    stableManufacturer,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
  ])

  const handleToggle = (id) => {
    setActiveProducts((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]))
  }

  const hasRefundData = () => {
    if (tab !== 2) return true
    if (!bindGraph.length) return false
    return bindGraph.some((row) =>
      activeProducts.some((pid) => {
        const value = row[pid]
        return value !== undefined && value !== null && value > 0
      }),
    )
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <div style={{ fontSize: "14px", color: "#666" }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: "16px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "700",
          marginBottom: "16px",
          margin: "0 0 16px 0",
        }}
      >
        Top 10 Products
      </h2>

      {/* Tab Buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          overflow: "auto",
          paddingBottom: "8px",
        }}
      >
        {["Revenue", "Units Sold", "Refunds"].map((label, index) => (
          <button
            key={index}
            onClick={() => setTab(index)}
            style={{
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: tab === index ? "600" : "400",
              border: tab === index ? "1px solid #333" : "1px solid #ccc",
              backgroundColor: tab === index ? "#333" : "#fff",
              color: tab === index ? "#fff" : "#333",
              borderRadius: "6px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Products List */}
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          marginBottom: "16px",
          border: "1px solid #eee",
          borderRadius: "8px",
        }}
      >
        {productList.map((product) => {
          const isActive = activeProducts.includes(product.id)
          return (
            <div
              key={product.id}
              style={{
                padding: "12px",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => handleToggle(product.id)}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: product.color,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />

              {/* Product Image */}
              {product.img && (
                <img
                  src={product.img || "/placeholder.svg"}
                  alt={product.name}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Product Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#333",
                  }}
                >
                  {product.name}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#666",
                    marginTop: "4px",
                  }}
                >
                  {product.sku} • {product.asin}
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={() => handleCopy(product.asin)}
                style={{
                  padding: "6px 10px",
                  fontSize: "11px",
                  border: "1px solid #ddd",
                  backgroundColor: copiedAsin === product.asin ? "#e8f5e9" : "#f5f5f5",
                  color: copiedAsin === product.asin ? "#2e7d32" : "#666",
                  borderRadius: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                {copiedAsin === product.asin ? "✓ Copied" : "Copy"}
              </button>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      {hasRefundData() ? (
        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bindGraph} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: "11px", fill: "#666" }}
                tickFormatter={(val) => {
                  if (isTodayOrYesterday) {
                    return dayjs(val).format("h A")
                  } else {
                    return dayjs(val).format("MMM D")
                  }
                }}
              />
              <YAxis
                tick={{ fontSize: "11px", fill: "#666" }}
                tickFormatter={formatYAxisTick}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip productList={productList} tab={tab} />} />
              {activeProducts.map((productId) => {
                const product = productList.find((p) => p.id === productId)
                if (!product) return null
                return (
                  <Line
                    key={product.id}
                    type="monotone"
                    dataKey={product.id}
                    stroke={product.color}
                    strokeWidth={2}
                    connectNulls={true}
                    dot={false}
                    isAnimationActive={false}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            color: "#999",
            fontSize: "14px",
          }}
        >
          No refunds for the selected period
        </div>
      )}
    </div>
  )
}
