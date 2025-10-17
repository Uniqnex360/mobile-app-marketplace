import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  Tooltip,
  Grid,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton, // Import Skeleton from MUI
} from "@mui/material";
import axios from "axios";
import {
  Storefront,
  CalendarToday,
  LocalShipping,
  CreditCard,
  Person,
  Email,
  Phone,
  CheckCircle,
  AttachMoney,
  ConfirmationNumber,
  ArrowBack,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

const OrderDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [market, setMarket] = useState(null);
  const [shipping, setShipping] = useState({});
  const [fulfillment, setFulfillment] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const userData = localStorage.getItem("user");

  const [currentIndex, setCurrentIndex] = useState(0);
  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("page") || 1;

  const { searchQuery } = location.state || {};
  console.log("searchQuery-Details:", searchQuery);
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }

  const detailsPage = queryParams.get("detail");
  const productId = queryParams.get("productId");

  const handleBackClick = () => {
    const currentPage = queryParams.get("page") || 1;
    const rowsPerPageURL = queryParams.get("rowsPerPage");
    if (detailsPage !== "detail-name") {
      navigate(
        `/Home/orders?page=${currentPage}&rowsPerPage=${rowsPerPageURL}`
      );
    }
    if (detailsPage === "detail-name") {
      navigate(
        `/Home/products/details/${productId}?page=${currentPage}&rowsPerPage=${rowsPerPageURL}&name=orderTab`
      );
    }
  };

  // Fetch Order Details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_IP}fetchOrderDetails/`,
          {
            params: { order_id: id, user_id: userIds },
          }
        );

        console.log("Full Response:", response);
        console.log(
          "Response Data 1111:",
          response.data.data.order_items.ProductDetails
        );

        if (response.data?.data) {
          setMarket(response.data.data.marketplace_name);
          setOrder(response.data.data);
          setShipping(response.data.data.shipping_information);
          const orderFulfill = response.data.data.order_items;
          if (orderFulfill && orderFulfill.length > 0) {
            setFulfillment(orderFulfill[0].Fulfillment);
          }
        } else {
          setOrder({});
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const formatDate = (timestamp) => {
    if (timestamp) {
      return new Date(timestamp).toLocaleDateString();
    }
    return "";
  };

  const renderSkeletonLoader = () => (
    <Box sx={{ p: 3, backgroundColor: "#f4f6f8" }}>
      <Box sx={{ display: "flex", alignItems: "center", padding: "20px" }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={200} sx={{ ml: 2 }} />
      </Box>

      <Grid container spacing={3} style={{ padding: "20px" }}>
        {[...Array(3)].map((_, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="80%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card style={{ margin: "20px", padding: "10px" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="80%" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="80%" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card style={{ margin: "20px", padding: "10px" }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[...Array(5)].map((_, index) => (
                    <TableCell key={index}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(3)].map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {[...Array(5)].map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <>
      {loading ? (
        renderSkeletonLoader()
      ) : (
        <Box sx={{ p: 3, backgroundColor: "#f4f6f8" }}>
          <div style={{ padding: "20px", fontSize: "14px" }}>
            <Box
              sx={{ display: "flex", alignItems: "center", padding: "20px" }}
            >
              <IconButton sx={{ marginLeft: "-3%" }} onClick={handleBackClick}>
                <ArrowBack />
              </IconButton>
              <Typography
                gutterBottom
                sx={{ fontSize: "18px", marginTop: "7px" }}
              >
                Back to Orders
              </Typography>
            </Box>

            <Grid
              container
              spacing={3}
              style={{
                paddingLeft: "22px",
                paddingRight: "20px",
                marginTop: "10px",
              }}
            >
              <Grid item xs={12} md={4}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Details
                    </Typography>

                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Tooltip title="Channel" arrow>
                          <Storefront sx={{ color: "#000080" }} />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Typography>
                          {order?.marketplace_name || "Not Applicable"}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Tooltip title="Order Date" arrow>
                          <CalendarToday sx={{ color: "#000080" }} />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Typography>
                          {formatDate(order?.order_date) || "Not Applicable"}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Tooltip title="Order Status" arrow>
                          <CheckCircle sx={{ color: "#000080" }} />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Typography>
                          {order?.order_status || "Not Applicable"}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Tooltip title="Order Total" arrow>
                          <AttachMoney sx={{ color: "#000080" }} />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Typography>
                          {order?.order_total || "Not Applicable"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Details
                    </Typography>

                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Tooltip title="Customer Name" arrow>
                          <Person sx={{ color: "#000080" }} />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Typography sx={{ color: "#000080" }}>
                          {order?.customer_name || "Not Applicable"}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Tooltip title="Customer Order ID" arrow>
                          <ConfirmationNumber sx={{ color: "#000080" }} />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Typography sx={{ color: "#000080" }}>
                          {order?.customer_order_id || "Not Applicable"}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                      <Grid item>
                        <Tooltip title="Customer Email" arrow>
                          <Email sx={{ color: "#000080", fontSize: 20 }} />
                        </Tooltip>
                      </Grid>
                      <Grid item xs>
                        <Typography
                          sx={{
                            color: "#000080",
                            wordBreak: "break-all",
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "4px",
                            gap: 1,
                          }}
                        >
                          {order?.customer_email_id || "Not Applicable"}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Tooltip title="Customer Phone" arrow>
                          <Phone sx={{ color: "#000080" }} />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Typography sx={{ color: "#000080" }}>
                          {shipping?.phone || "Not Applicable"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Fulfillment Details
                    </Typography>
                    <Grid
                      container
                      spacing={1}
                      justifyContent="space-between"
                      sx={{ marginLeft: "2px", paddingTop: "6px" }}
                    >
                      <Typography>Fulfillment Status</Typography>
                      <Typography
                        sx={{ color: "#000080", paddingRight: "10px" }}
                      >
                        {fulfillment?.FulfillmentOption || "Not Applicable"}
                      </Typography>
                    </Grid>
                    <Grid
                      container
                      spacing={1}
                      justifyContent="space-between"
                      sx={{ marginLeft: "2px", paddingTop: "6px" }}
                    >
                      <Typography>Shipping Method</Typography>
                      <Typography
                        sx={{ color: "#000080", paddingRight: "10px" }}
                      >
                        {fulfillment?.ShipMethod || "Not Applicable"}
                      </Typography>
                    </Grid>
                    {fulfillment?.ShipDateTime && (
                      <Grid
                        container
                        spacing={1}
                        justifyContent="space-between"
                        sx={{ marginLeft: "2px", paddingTop: "6px" }}
                      >
                        <Typography>Ship Date</Typography>
                        <Typography
                          sx={{ color: "#000080", paddingRight: "10px" }}
                        >
                          {new Date(
                            fulfillment?.ShipDateTime
                          ).toLocaleString() || "Not Applicable"}
                        </Typography>
                      </Grid>
                    )}
                    {fulfillment?.Carrier && (
                      <Grid
                        container
                        spacing={1}
                        justifyContent="space-between"
                        sx={{ marginLeft: "2px", paddingTop: "6px" }}
                      >
                        <Typography>Carrier</Typography>
                        <Typography
                          sx={{ color: "#000080", paddingRight: "10px" }}
                        >
                          {fulfillment?.Carrier || "Not Applicable"}
                        </Typography>
                      </Grid>
                    )}
                    <Grid
                      container
                      spacing={1}
                      justifyContent="space-between"
                      sx={{ marginLeft: "2px", paddingTop: "6px" }}
                    >
                      <Typography>Fulfillment Channel</Typography>
                      <Typography
                        sx={{ color: "#000080", paddingRight: "10px" }}
                      >
                        {order?.fulfillment_channel
                          ? order?.fulfillment_channel
                          : "Not Applicable"}
                      </Typography>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card style={{ margin: "20px", padding: "10px" }}>
              <CardContent>
                <Grid container spacing={2} justifyContent="space-between">
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Shipping Address
                    </Typography>

                    <Typography variant="body2">
                      {order?.marketplace_name === "Walmart" ? (
                        <>
                          {shipping?.postalAddress?.name && (
                            <>
                              {shipping.postalAddress.name}
                              <br />
                            </>
                          )}
                          {shipping?.postalAddress?.address1 && (
                            <>
                              {shipping.postalAddress.address1}
                              <br />
                            </>
                          )}
                          {shipping?.postalAddress?.address2 && (
                            <>
                              {shipping.postalAddress.address2}
                              <br />
                            </>
                          )}
                          {shipping?.postalAddress?.city &&
                            shipping?.postalAddress?.state &&
                            shipping?.postalAddress?.postalCode && (
                              <>
                                {shipping.postalAddress.city},{" "}
                                {shipping.postalAddress.state}{" "}
                                {shipping.postalAddress.postalCode}
                                <br />
                              </>
                            )}
                          {shipping?.postalAddress?.country && (
                            <>
                              {shipping.postalAddress.country}
                              <br />
                            </>
                          )}
                          {shipping?.phone && <>{shipping.phone}</>}
                        </>
                      ) : order?.marketplace_name === "Amazon" ? (
                        <>
                          {order?.shipping_information?.City && (
                            <>
                              {order.shipping_information.City}
                              <br />
                            </>
                          )}
                          {order?.shipping_information?.StateOrRegion && (
                            <>
                              {order.shipping_information.StateOrRegion}
                              <br />
                            </>
                          )}
                          {order?.shipping_information?.PostalCode && (
                            <>
                              {order.shipping_information.PostalCode}
                              <br />
                            </>
                          )}
                          {order?.shipping_information?.CountryCode && (
                            <>
                              {order.shipping_information.CountryCode}
                              <br />
                            </>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No shipping details available.
                        </Typography>
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Grid
                      container
                      alignItems="center"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Grid item>
                        <Typography variant="body2">
                          Has Regulated Items
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Checkbox
                          checked={order?.has_regulated_items}
                          readOnly
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card style={{ margin: "20px", padding: "10px" }}>
              <CardContent>
                <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Product</strong>
                        </TableCell>
                        <TableCell>
                          <strong>SKU</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Quantity</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Unit Price</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Subtotal</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {order?.order_items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item.ProductDetails?.Title || "N/A"}
                          </TableCell>
                          <TableCell>
                            {item.ProductDetails?.SKU || "N/A"}
                          </TableCell>
                          <TableCell>
                            {item.ProductDetails?.QuantityOrdered || 0}
                          </TableCell>
                          <TableCell>
                            {item.ProductDetails?.unit_price
                              ? `$${
                                  item.ProductDetails.unit_price % 1 >= 0.5
                                    ? item.ProductDetails.unit_price.toFixed(0)
                                    : item.ProductDetails.unit_price
                                }`
                              : "N/A"}
                          </TableCell>

                          <TableCell>
                            {item?.Pricing?.ItemPrice?.Amount !== undefined &&
                            item?.Pricing?.ItemPrice?.Amount !== null
                              ? `$${Number(
                                  item.Pricing.ItemPrice.Amount
                                ).toFixed(2)}`
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}

                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <strong>Tax:</strong>
                        </TableCell>
                        <TableCell>
                          {order?.order_items
                            ? `$${order.order_items
                                .reduce(
                                  (total, item) =>
                                    total +
                                    (item.Pricing?.ItemTax?.Amount || 0),
                                  0
                                )
                                .toFixed(2)}`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <strong>Shipping:</strong>
                        </TableCell>
                        <TableCell>
                          {order?.shipping_price !== undefined &&
                          order?.shipping_price !== null
                            ? `$${Number(order.shipping_price).toFixed(2)}`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <strong>Shipping Tax:</strong>
                        </TableCell>
                        <TableCell>$0.00</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <strong>Total:</strong>
                        </TableCell>
                        <TableCell>
                          {order?.order_items
                            ? `$${(
                                order.order_items.reduce(
                                  (total, item) =>
                                    total +
                                    (item?.Pricing?.ItemPrice?.Amount || 0) +
                                    (item?.Pricing?.ItemTax?.Amount || 0),
                                  0
                                ) + (order?.shipping_price || 0)
                              ).toFixed(2)}`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <strong>Merchant Shipment Cost:</strong>
                        </TableCell>
                        <TableCell>
                          {order?.merchant_shipment_cost !== undefined &&
                          order?.merchant_shipment_cost !== null
                            ? `$${Number(order.merchant_shipment_cost).toFixed(
                                2
                              )}`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </div>
        </Box>
      )}
    </>
  );
};

export default OrderDetail;
