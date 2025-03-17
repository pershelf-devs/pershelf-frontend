import React from "react";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Login from "../pages/auth/Login";
const Header = ({ toggleSidebar }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-blue-900 text-white">
      <IconButton onClick={toggleSidebar} className="text-white" color="inherit">
        <MenuIcon />
      </IconButton>

      <h1 className="text-xl font-bold">Pershelf</h1>

      <Login />
    </header>
  );
};

export default Header;
