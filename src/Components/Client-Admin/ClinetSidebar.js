import React from "react";
import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Dashboard, ShoppingCart, Settings, Person } from "@mui/icons-material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Inventory2Icon from '@mui/icons-material/Inventory2';

const drawerWidth = 85;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard sx={{ fontSize: 36 }} />, path: "/home" },
    { text: "Products", icon: <ShoppingCart sx={{ fontSize: 36 }} />, path: "/home/products" },
    { text: "Orders", icon: <AssignmentIcon sx={{ fontSize: 36 }} />, path: "/home/orders" },
    { text: "Inventory", icon: <Inventory2Icon sx={{ fontSize: 36 }} />, path: "/home/contact" },
    { text: "Users", icon: <Person sx={{ fontSize: 36 }} />, path: "/home/users" },
    { text: "Settings", icon: <Settings sx={{ fontSize: 36 }} />, path: "/home/settings" },
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

  // Get the current active value for BottomNavigation
  const getCurrentValue = () => {
    const activeItem = menuItems.find(item => isActivePath(item.path));
    return activeItem ? activeItem.path : false;
  };

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: 1000,
        }} 
        elevation={3}
      >
        <BottomNavigation
          value={getCurrentValue()}
          onChange={(event, newValue) => {
            navigate(newValue);
          }}
          showLabels
          sx={{
            backgroundColor: "#ffffff",
            height: "80px",
            "& .MuiBottomNavigationAction-root": {
              color: "#000080",
              minWidth: "auto",
              padding: "6px 0",
            },
            "& .Mui-selected": {
              color: "#000080",
              "& .MuiBottomNavigationAction-label": {
                fontWeight: 700,
              },
            },
          }}
        >
          {menuItems.map((item, index) => (
            <BottomNavigationAction
              key={index}
              label={item.text}
              value={item.path}
              icon={React.cloneElement(item.icon, { 
                sx: { 
                  fontSize: 36,
                  color: isActivePath(item.path) ? "#000080" : "#000080",
                  backgroundColor: isActivePath(item.path) ? "#e6ebff" : "transparent",
                  padding: "8px",
                  borderRadius: "50%",
                } 
              })}
              sx={{
                fontSize: "12px",
                "& .MuiBottomNavigationAction-label": {
                  fontSize: "12px",
                  fontWeight: isActivePath(item.path) ? 700 : 500,
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    );
  }

  // Desktop Sidebar
  return (
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
                  padding: "12px",
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#000080" : "transparent",
                  transition: "background-color 0.3s ease",
                }}
              >
                {React.cloneElement(item.icon, { 
                  sx: { 
                    fontSize: 36,
                    color: 'inherit'
                  } 
                })}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "14px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
                sx={{
                  color: "#000080",
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
  );
};

export default Sidebar;