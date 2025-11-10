"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

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
  const [summary, setSummary] = useState(null)
  const [graph, setGraph] = useState(null)
  const [summaryOther, setSummaryOther] = useState(null)
  const [summaryDate, setSummaryDate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingBody, setLoadingBody] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  dayjs.extend(utc)
  const lastParamsRef = useRef("")

  const userData = localStorage.getItem("user")
  let userIds = ""
  if (userData) {
    const data = JSON.parse(userData)
    userIds = data.id
  }

  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen)
  }

  const handleDownloadOption = async (option) => {
    if (option === "CSV") {
      await handleDownloadCSV()
    } else if (option === "XLS") {
      await handleDownloadXLS()
    }
    setMenuOpen(false)
  }

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
        },
      )
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "profitLossChart.csv"
      link.click()
    } catch (error) {
      console.error("CSV Download Error:", error)
    }
  }

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
        },
      )
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "profitLossChart.xlsx"
      link.click()
    } catch (error) {
      console.error("XLS Download Error:", error)
    }
  }

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
    })

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams
      fetchProfitAndLossDetails()
      fetchProfitAndLossGraph()
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
    country,
  ])

  const fetchProfitAndLossDetails = async () => {
    setLoadingBody(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}getProfitAndLossDetails/`, {
        country: country,
        preset: widgetData,
        start_date: DateStartDate,
        end_date: DateEndDate,
        marketplace_id: marketPlaceId.id,
        brand_id: brand_id,
        product_id: product_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        timezone: "US/Pacific",
      })

      const responseData = response?.data || {}
      const customData = responseData?.custom || {}
      setSummaryDate(customData?.dateRanges || null)
      setSummaryOther(customData?.netProfitCalculation || null)
      setSummary(customData?.summary || null)
    } catch (error) {
      console.error("Error fetching profit and loss details:", error)
      setSummaryDate(null)
      setSummaryOther(null)
      setSummary(null)
    } finally {
      setLoadingBody(false)
    }
  }

  const fetchProfitAndLossGraph = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}profit_loss_chart/`, {
        country: country,
        preset: widgetData,
        marketplace_id: marketPlaceId.id,
        brand_id: brand_id,
        product_id: product_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        start_date: DateStartDate,
        end_date: DateEndDate,
        timezone: systemTimeZone,
      })
      setGraph(response.data.graph)
    } catch (error) {
      console.error("Error fetching profit and loss graph:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value, country) => {
    if (value === null || value === undefined) return "$0.00"
    const currencySymbol = country === "US" ? "$" : "€"
    return `${currencySymbol}${Number(value).toFixed(2)}`
  }

  const fromDate = summaryDate?.current?.from
  const toDate = summaryDate?.current?.to

  const formattedCurrentDate = fromDate ? dayjs.utc(fromDate).format("MMM DD, YYYY") : ""

  const summaryData = [
    {
      label: "Base Price",
      value: formatCurrency(summaryOther?.current?.base_price, country),
      delta: summaryOther?.current?.base_price - summaryOther?.previous?.base_price,
      color: "transparent",
    },
    {
      label: "Total Tax",
      value: formatCurrency(summaryOther?.current?.totalTax, country),
      delta: summaryOther?.current?.totalTax - summaryOther?.previous?.totalTax,
      color: "transparent",
    },
    {
      label: "Shipping",
      value: formatCurrency(summaryOther?.current?.shipping_cost, country),
      delta: summaryOther?.current?.shipping_cost - summaryOther?.previous?.shipping_cost,
      color: "transparent",
    },
    {
      label: "Gross Revenue",
      value: formatCurrency(summaryOther?.current?.gross, country),
      delta: summary?.grossRevenue?.delta?.toFixed(2),
      color: "rgb(106, 42, 192)",
    },
    {
      label: "Channel Fees",
      value: formatCurrency(summaryOther?.current?.channel_fee, country),
      delta: summaryOther?.current?.channel_fee - summaryOther?.previous?.channel_fee,
      color: "transparent",
    },
    {
      label: "Refunds",
      value: formatCurrency(summaryOther?.current?.productRefunds, country),
      delta: summaryOther?.current?.productRefunds - summaryOther?.previous?.productRefunds,
      color: "transparent",
    },
    {
      label: "COGS",
      value: formatCurrency(summaryOther?.current?.cogs, country),
      delta: summaryOther?.current?.cogs - summaryOther?.previous?.cogs,
      color: "transparent",
    },
    {
      label: "Total Tax (Cost)",
      value: formatCurrency(summaryOther?.current?.totalTax, country),
      delta: summaryOther?.current?.totalCosts - summaryOther?.previous?.totalTaxWithheld,
      color: "transparent",
    },
    {
      label: "Expenses",
      value: formatCurrency(summary?.expenses?.current, country),
      delta: summary?.expenses?.delta?.toFixed(2),
      color: "red",
    },
    {
      label: "Net Profit",
      value: formatCurrency(summary?.netProfit?.current, country),
      delta: summary?.netProfit?.delta?.toFixed(2),
      color: "green",
    },
  ]

  const processedChartData =
    graph?.length > 0
      ? Object.keys(graph[0].values).map((key) => {
          const dataPoint = { date: new Date(key).getTime() }
          graph.forEach((item) => {
            dataPoint[item.metric] = item.values[key]
          })
          return dataPoint
        })
      : []

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dateObj = dayjs(label)
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "8px",
            border: "1px solid #ccc",
            fontSize: "12px",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: "0 0 4px 0" }}>{dateObj.format("MMM D")}</p>
          {payload.map((item, index) => (
            <div key={`item-${index}`} style={{ fontSize: "11px" }}>
              <span style={{ color: item.color }}>●</span> <span>{item.name}: </span>
              <span style={{ fontWeight: "bold" }}>
                {item.name === "units" ? item.value : formatCurrency(item.value, country)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (loadingBody) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          fontSize: "14px",
          color: "#666",
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        fontFamily: "'Nunito Sans', sans-serif",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
          borderBottom: "1px solid #e0e0e0",
          paddingBottom: "12px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              margin: "0 0 8px 0",
              color: "#000",
            }}
          >
            P&L
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#666",
              margin: "0",
            }}
          >
            {formattedCurrentDate}
          </p>
        </div>

        {/* Menu button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={handleMenuToggle}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#333",
              padding: "0",
              marginTop: "2px",
            }}
          >
            ⋮
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "32px",
                right: "0",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 100,
                minWidth: "150px",
              }}
            >
              <button
                onClick={() => handleDownloadOption("CSV")}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#333",
                  borderBottom: "1px solid #f0f0f0",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.target.style.background = "none")}
              >
                Download CSV
              </button>
              <button
                onClick={() => handleDownloadOption("XLS")}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#333",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.target.style.background = "none")}
              >
                Download XLS
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        {summaryData.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #f0f0f0",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {item.color !== "transparent" && (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  color: item.color !== "transparent" ? "#000" : "#666",
                  fontWeight: item.color !== "transparent" ? "600" : "400",
                }}
              >
                {item.label}
              </span>
            </div>
            <span
              style={{
                fontWeight: "600",
                color: "#000",
                fontSize: "13px",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {!loading && (
        <div style={{ height: "280px", marginTop: "16px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
              <CartesianGrid horizontal={true} vertical={false} stroke="#f0f0f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => dayjs(value).format("MMM D")}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(value) => `$${value}`}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {graph?.find((g) => g.metric === "grossRevenue") && (
                <Line
                  type="monotone"
                  dataKey="grossRevenue"
                  stroke="#6a2ac0"
                  strokeWidth={2}
                  dot={false}
                  yAxisId="left"
                />
              )}
              {graph?.find((g) => g.metric === "expenses") && (
                <Line type="monotone" dataKey="expenses" stroke="#dc3545" strokeWidth={2} dot={false} yAxisId="left" />
              )}
              {graph?.find((g) => g.metric === "netProfit") && (
                <Line type="monotone" dataKey="netProfit" stroke="#28a745" strokeWidth={2} dot={false} yAxisId="left" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default ProfitAndLoss
