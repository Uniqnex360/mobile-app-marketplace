import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { Routes, Route, Outlet } from "react-router-dom";
import ClientSidebar from "../ClinetSidebar";
import ClientDashboardpage from "./ClientDashboardpage";
import ProductTable from "../Products/ProductTable";
import OrderList from "../Orders/OrderList";
import Notificationbar from "./Notificationbar";
import ProductDetials from "../Products/ProductDetials";
import OrdersDetail from "../Orders/OrdersDetail";
import InventoryList from "../Inventory/InventoryList";
import MainSettings from "../Settings/MainSettings";
import CustomOrderList from "../Orders/CustomOrderList";
import UserList from "../UserFeild/UserList";
import UserDetail from "../UserFeild/UserDetial";
import MyProductDetial from '../Dashboard/MyProducts/ProductsLoading/MyProductDetial';
import SalesProductDetailPage from "../Sales/SalesProductDetialPage/SalesProductDetail";
import DashboardFilters from "./DashboardFilters";

const ClientDashboardHomepage = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column",
      minHeight: "100vh",
      width: "100vw",
      position: "relative",
      overflow: "hidden",
      backgroundColor: theme.palette.background.default,
    }}>
      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1,
        width: "100%",
        px: 2,
        py: 1.5,
        overflow: "auto",
        paddingBottom: "80px", // Space for bottom navigation
        paddingTop: "60px", // Space for notification bar
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        position: "relative",
      }}>
        {/* Fixed Notification Bar at Top */}
        <Box sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
          <Notificationbar />
        </Box>
        
        {/* Routes */}
        <Routes>
          <Route path="/" element={<ClientDashboardpage />} />
          <Route path="products" element={<ProductTable />} />
          <Route path="products/details/:id" element={<ProductDetials />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/userdetails/:id" element={<UserDetail/>} />
          <Route path="orders/customList/:id" element={<CustomOrderList />} />
          <Route path="orders/details/:id" element={<OrdersDetail />} />
          <Route path="contact" element={<InventoryList />} />
          <Route path="settings" element={<MainSettings />} />
          <Route path="/product-detail/:id" element={<MyProductDetial />} />
          <Route path="/sales-detail/:id" element={<SalesProductDetailPage />} />
        </Routes>
        <Outlet />
      </Box>
      
      <Box sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        <ClientSidebar />
      </Box>
    </Box>
  );
};

export default ClientDashboardHomepage;