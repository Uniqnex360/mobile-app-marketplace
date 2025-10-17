import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
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
import MyProductDetial from "../Dashboard/MyProducts/ProductsLoading/MyProductDetial";
import SalesProductDetailPage from "../Sales/SalesProductDetialPage/SalesProductDetail";
import HamburgerMenu from "../../../hamburger";

const ClientDashboardHomepage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isMobile ? (
        <HamburgerMenu>
          <ClientSidebar />
        </HamburgerMenu>
      ) : (
        <ClientSidebar />
      )}

      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          overflowY: "auto",
          width: "100%",
        }}
      >
        <Notificationbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<ClientDashboardpage />} />
            <Route path="products" element={<ProductTable />} />
            <Route path="products/details/:id" element={<ProductDetials />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/userdetails/:id" element={<UserDetail />} />
            <Route path="orders/customList/:id" element={<CustomOrderList />} />
            <Route path="orders/details/:id" element={<OrdersDetail />} />
            <Route path="contact" element={<InventoryList />} />
            <Route path="settings" element={<MainSettings />} />
            <Route path="/product-detail/:id" element={<MyProductDetial />} />
            <Route
              path="/sales-detail/:id"
              element={<SalesProductDetailPage />}
            />
          </Routes>
        </div>
        <Outlet />
      </Box>
    </Box>
  );
};

export default ClientDashboardHomepage;
