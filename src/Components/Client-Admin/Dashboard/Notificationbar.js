import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Box,
  FormControl,
  Select,
  useMediaQuery,
} from "@mui/material";
import {
  Notifications,
  AccountCircle,
  ExitToApp,
  CreditCard,
  HelpOutline,
  Menu as MenuIcon,
  Language,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useMarketplace } from "../../../utils/MarketplaceProvider";
import { useNavigate } from "react-router-dom";
const accentColor = "#000080";
function Notificationbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const open = Boolean(anchorEl);
  const openMobileMenu = Boolean(mobileMenuAnchor);
  const { selectedCountry, setSelectedCountry } = useMarketplace();
  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);
  const handleLogout = () => {
    navigate("/");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };
  const handleMobileMenu = (event) => setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);
  return (
    <AppBar position="fixed" sx={{ backgroundColor: accentColor, zIndex: 1201 }}>
     <Toolbar
  sx={{
    display: "grid",
    gridTemplateColumns: isSmall ? "auto 1fr auto" : "1fr auto",
    alignItems: "center",
    minHeight: 64,
  }}
>
  {/* LEFT: Menu Icon (mobile only) */}
  {isSmall && (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      <IconButton color="inherit" onClick={handleMobileMenu}>
        <MenuIcon />
      </IconButton>
    </Box>
  )}

  {/* CENTER: Logo */}
  <Box
    sx={{
      display: "flex",
      justifyContent: isSmall ? "center" : "flex-start",
      alignItems: "center",
    }}
  >
    <IconButton
      color="inherit"
      disableRipple
      onClick={() => navigate("/dashboard")}
    >
      <img
        src={require("../../assets/MarketLynxe.png")}
        alt="Logo"
        style={{
          height: isSmall ? "32px" : "40px",
          width: "auto",
          backgroundColor: "#fff",
          padding: "2px",
          borderRadius: "2px",
        }}
      />
    </IconButton>
  </Box>

  {/* RIGHT: Profile (and notifications on desktop) */}
  <Box
    sx={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 1,
    }}
  >
    {!isSmall && (
      <IconButton color="inherit">
        <Notifications sx={{ fontSize: 26 }} />
      </IconButton>
    )}
    <IconButton color="inherit" onClick={handleProfileClick}>
      <Avatar sx={{ bgcolor: "white", color: accentColor }}>
        <AccountCircle />
      </Avatar>
    </IconButton>
  </Box>
</Toolbar>

      {/* Profile Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleProfileClose}>
        <MenuItem disabled>
          <ListItemText
            primary="Hello, MarketPlace User01"
            secondary="marketplace@user1gmail.com"
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileClose}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={handleProfileClose}>
          <ListItemIcon>
            <CreditCard />
          </ListItemIcon>
          <ListItemText primary="Billing" />
        </MenuItem>
        <MenuItem onClick={handleProfileClose}>
          <ListItemIcon>
            <HelpOutline />
          </ListItemIcon>
          <ListItemText primary="Get Help" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={openMobileMenu}
        onClose={handleMobileMenuClose}
      >
        <MenuItem>
          <ListItemIcon>
            <Language />
          </ListItemIcon>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              displayEmpty
            >
              <MenuItem value="US">US</MenuItem>
              <MenuItem value="UK">UK</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Notifications />
          </ListItemIcon>
          <ListItemText primary="Notifications" />
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
export default Notificationbar;
