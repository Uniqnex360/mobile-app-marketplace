import React from "react";
import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Dashboard, ShoppingCart, Contacts, Settings ,Person} from "@mui/icons-material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Link, useLocation } from "react-router-dom";
import Inventory2Icon from '@mui/icons-material/Inventory2';

const drawerWidth = 85;

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/home" },
    { text: "Products", icon: <ShoppingCart />, path: "/home/products" },
    { text: "Orders", icon: <AssignmentIcon />, path: "/home/orders" },
     { text: "Inventory", icon: <Inventory2Icon />, path: "/home/contact" },
     { text: "Users", icon: <Person />, path: "/home/users" },
    { text: "Settings", icon: <Settings />, path: "/home/settings" },
  ];

  const isActivePath = (path) => {
    if (location.pathname === path) {
      return true;
    }
    if (path === "/home/products" && location.pathname.startsWith("/home/products")) {
      return true;
    }
    if (path === "/home/orders" && location.pathname.startsWith("/home/orders")) {
      return true;
    }
    return false;
  };


  return (
    <div className="client-sidebar">
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          color: "#000080",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          // paddingTop: "10px",
          paddingBottom: "10px",
        },
      }}
    >
      <Toolbar />

      {/* Sidebar Items */}
      <List sx={{ width: "100%", flexGrow: 1, marginTop: "5px" }}>
        {menuItems.map((item, index) => {
          const isActive = isActivePath(item.path);
          return (
            <ListItem
              button
              key={index}
              component={Link}
              to={item.path}
              sx={{
                flexDirection: "column",
                alignItems: "center",
                padding: "4px 0",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#e6ebff",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? "#fff" : "#000080",
                  minWidth: "unset",
                  fontSize: "28px",
                  padding: "10px",
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#000080" : "transparent",
                  transition: "background-color 0.3s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "14px", // Set font size to 14px
                  fontWeight: 700,  // Set font weight to 500
                  textAlign: "center",
                }}
                sx={{
                  color: "#000080", // Ensure the text color remains constant
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              />
            </ListItem>
          );
        })}

      </List>
    </Drawer>
    </div>
  );
};

export default Sidebar;
