import React from "react";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md flex items-center gap-4">
      <IconButton onClick={toggleSidebar} className="text-white" color="inherit">
        <MenuIcon />
      </IconButton>

      <h1 className="text-xl font-bold">Pershelf</h1>
    </header>
  );
};

export default Header;
