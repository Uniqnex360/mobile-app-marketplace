import React, { useState } from 'react';
import './hamburger.css';
 
const HamburgerMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!open);
 
  return (
<>
      {/* Hamburger icon */}
<div className="hamburger" onClick={toggleMenu}>
<span></span>
<span></span>
<span></span>
</div>
 
      {/* Overlay */}
<div
        className={`menu-overlay ${open ? 'show' : ''}`}
        onClick={toggleMenu}
></div>
 
      {/* Drawer */}
<div className={`mobile-menu ${open ? 'open' : ''}`}>
        {children}
</div>
</>
  );
};
 
export default HamburgerMenu;