import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Paper,
    IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { ArrowUpward, ArrowDownward, MoreVert, Download, Delete } from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { saveAs } from 'file-saver';

import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Import Copy Icon
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CustomizeTooltip from '../CustomTooltip/CustomTooltip';
import { formatCurrency } from '../../../utils/currencyFormatter';
const SalesDecreasing = ({ userId, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate ,products}) => {
    // const [products, setProducts] = useState([]);
    const [tooltipText, setTooltipText] = useState('Copy ASIN');
    const [copied, setCopied] = useState(false);
    const today = new Date();
    let lastParamsRef = useRef("");

    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(today.getDate() - 1);

    const dayBeforeYesterdayDate = new Date(today);
    dayBeforeYesterdayDate.setDate(today.getDate() - 2);


    const formatDate = (date) => {
        const options = { month: 'short', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const yesterday = formatDate(yesterdayDate);
    const dayBeforeYesterday = formatDate(dayBeforeYesterdayDate);
    const [showMenu, setShowMenu] = useState(null)

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    const handleDownloadCSV = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_IP}downloadProductPerformanceCSV/`, {
                user_id: userId,
                action: "least",
                marketplace_id: marketPlaceId.id,
                brand_id: brand_id,
                product_id: product_id,
                manufacturer_name: manufacturer_name,
                fulfillment_channel: fulfillment_channel,
                start_date: DateStartDate,
                end_date: DateEndDate,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
                {
                    responseType: 'blob',
                });
            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'decreasing_sales_products.csv');
        } catch (error) {
            console.error('CSV Download Error:', error);
        }
    };

    const handleDownloadXLS = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_IP}downloadProductPerformanceSummary/`, {
                user_id: userId,
                action: "least",
                marketplace_id: marketPlaceId.id,
                brand_id: brand_id,
                product_id: product_id,
                manufacturer_name: manufacturer_name,
                fulfillment_channel: fulfillment_channel,
                start_date: DateStartDate,
                end_date: DateEndDate,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
                {
                    responseType: 'blob',
                });
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, 'decreasing_sales_products.xlsx');
        } catch (error) {
            console.error('XLS Download Error:', error);
        }
    };


    // Fetch function to get product data from API
    // const fetchSalesDecreasing = async () => {
    //     try {
    //         const response = await axios.post(
    //             `${process.env.REACT_APP_IP}getProductPerformanceSummary/`,
    //             {
    //                 action: "least",
    //                 user_id: userId, // Include userId if needed
    //                 marketplace_id: marketPlaceId.id,
    //                 brand_id: brand_id,
    //                 product_id: product_id,
    //                 manufacturer_name: manufacturer_name,
    //                 fulfillment_channel: fulfillment_channel,
    //                 start_date: DateStartDate,
    //                 end_date: DateEndDate,
    //                 timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Get the user's timezone
    //             }
    //         );
    //         console.log('res', response.data.least_3_products);
    //         // Use 'top_3_products' instead of 'least_3_products' based on your request
    //         setProducts(response.data.least_3_products || []); // Safe check if least_3_products exists
    //     } catch (error) {
    //         console.error('Failed to fetch sales decreasing data:', error);
    //     }
    // };

    // useEffect(() => {

    //     const currentParams = JSON.stringify({

    //         userId, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate

    //     });

    //     if (lastParamsRef.current !== currentParams) {
    //         lastParamsRef.current = currentParams;
    //         fetchSalesDecreasing();
    //     }

    // }, [userId, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate]);



    const handleTooltipOpen = (value) => {
        const isNumberOnly = /^\d+$/.test(value);
        const label = isNumberOnly ? 'WPID' : 'ASIN';
        setTooltipText(`Copy ${label}`);
    };

    const handleCopy = async (value) => {
        if (!value) return;

        const isNumberOnly = /^\d+$/.test(value);
        const label = isNumberOnly ? 'WPID' : 'ASIN';

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(value);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = value;
                textarea.style.position = "fixed";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            setTooltipText(`${label} Copied!`);
        } catch (err) {
            console.error('Copy failed', err);
            setTooltipText('Copy Failed');
        }

        setTimeout(() => {
            setTooltipText(`Copy ${label}`);
        }, 1500);
    };

   return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid #E0E0E0",
        padding: "16px",
        marginBottom: "16px",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#1E293B",
              margin: "0 0 8px 0",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            Sales Trends: Decreasing
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#485E75",
              margin: 0,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {`${dayBeforeYesterday} - ${yesterday}`}
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
              color: "#485E75",
            }}
          >
            ⋮
          </button>

          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "32px",
                right: 0,
                background: "white",
                border: "1px solid #E0E0E0",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                zIndex: 10,
                minWidth: "160px",
              }}
            >
              <button
                onClick={() => {
                  handleDownloadCSV()
                  setShowMenu(false)
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  background: "white",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#485E75",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  borderBottom: "1px solid #E0E0E0",
                }}
              >
                📄 Download CSV
              </button>
              <button
                onClick={() => {
                  handleDownloadXLS()
                  setShowMenu(false)
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  background: "white",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#485E75",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  borderBottom: "1px solid #E0E0E0",
                }}
              >
                ⬇️ Download XLS
              </button>
              <button
                onClick={() => setShowMenu(false)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  background: "white",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#485E75",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                🗑️ Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {products.length > 0 ? (
        <div style={{ overflowX: "auto",width:"100%", "-webkit-overflow-scrolling": "touch"  }}>
          {/* Mobile: Stack columns vertically - Hidden on desktop */}
          <div className="mobile-only">
            <div style={{minWidth:'600px',width:'100%'}}>
            {products.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #F0F0F0",
                }}
              >
                {/* Product Info - Full Width */}
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                    <img
                      src={item.images || "https://via.placeholder.com/40"}
                      alt={item.product_name}
                      style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 }}
                    />
                    <a
                      href={`/Home/sales-detail/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#0A6FE8",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: 500,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.3",
                        maxHeight: "3.9em",
                        flex: 1,
                        minWidth: 0,
                      }}
                      title={item.product_name}
                    >
                      {item.product_name}
                    </a>
                  </div>
                  <div style={{ fontSize: "11px", color: "#485E75", marginBottom: "4px" }}>{item.fulfillmentChannel}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#485E75" }}>
                    <span>{item?.asin}</span>
                    <button
                      onClick={() => {
                        handleCopy(item.asin)
                        handleTooltipOpen(item.asin)
                      }}
                      title={tooltipText}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "2px 4px",
                        color: "#757575",
                      }}
                    >
                      📋
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: 'minmax(300px,1fr) 150px 150px 150px', gap: "12px", marginTop: "12px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>Gross Revenue</div>
                    <div style={{ color: "#485E75", fontSize: "13px", fontWeight: 500 }}>{formatCurrency(item.grossRevenue)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>Net Profit</div>
                    <div style={{ color: "#485E75", fontSize: "13px", fontWeight: 500 }}>{formatCurrency(item.netProfit)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>Units Sold</div>
                    <div style={{ color: "#485E75", fontSize: "13px", fontWeight: 500 }}>
                      {item.unitsSold?.toLocaleString("en-US")} <span style={{ color: "#33CC99" }}>↑</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Desktop: Original grid layout - Hidden on mobile */}
          <div className="desktop-only">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(300px, 1fr) 150px 150px 150px",
                gap: "12px",
                marginBottom: "12px",
                paddingBottom: "12px",
                borderBottom: "1px solid #E0E0E0",
                fontSize: "12px",
                fontWeight: 600,
                color: "#485E75",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              <div>Product</div>
              <div>Gross Revenue</div>
              <div>Net Profit</div>
              <div>Units Sold</div>
            </div>

            {products.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(300px, 1fr) 150px 150px 150px",
                  gap: "12px",
                  paddingBottom: "12px",
                  paddingTop: "12px",
                  borderBottom: "1px solid #F0F0F0",
                  alignItems: "center",
                  fontSize: "14px",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <img
                      src={item.images || "https://via.placeholder.com/40"}
                      alt={item.product_name}
                      style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover" }}
                    />
                    <a
                      href={`/Home/sales-detail/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#0A6FE8",
                        textDecoration: "none",
                        fontSize: "12px",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.product_name}
                    >
                      {item.product_name}
                    </a>
                  </div>
                  <div style={{ fontSize: "11px", color: "#485E75", marginBottom: "4px" }}>{item.fulfillmentChannel}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#485E75" }}>
                    <span>{item?.asin}</span>
                    <button
                      onClick={() => {
                        handleCopy(item.asin)
                        handleTooltipOpen(item.asin)
                      }}
                      title={tooltipText}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "2px 4px",
                        color: "#757575",
                      }}
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div style={{ color: "#485E75", fontSize: "13px", fontWeight: 500 }}>{formatCurrency(item.grossRevenue)}</div>
                <div style={{ color: "#485E75", fontSize: "13px", fontWeight: 500 }}>{formatCurrency(item.netProfit)}</div>
                <div style={{ color: "#485E75", fontSize: "13px", fontWeight: 500 }}>
                  {item.unitsSold?.toLocaleString("en-US")} <span style={{ color: "#33CC99" }}>↑</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px",
            color: "#485E75",
            fontSize: "14px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          No data available
        </div>
      )}

      <style jsx>{`
        .mobile-only {
          display: none;
          overflow-x:auto
          width:'100%'
          -webkit-overflow-scrolling:touch
        }
        .desktop-only {
          display: block;
        }
        @media (max-width: 768px) {
          .mobile-only {
            display: block;
          }
          .desktop-only {
            display: none;
          }
        }
      `}</style>
    </div>
  )
};

export default SalesDecreasing;