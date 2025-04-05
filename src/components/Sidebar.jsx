import React from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={toggleSidebar}
      PaperProps={{
        sx: {
          width: 240,
          backgroundColor: "rgba(0, 0, 0, 0.7)", // Şeffaf koyu arka plan
          color: "#fff",                         // Beyaz yazı
          backdropFilter: "blur(6px)",           // Blur efekti
        },
      }}
    >
      <List>
        <ListItem button onClick={toggleSidebar} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={toggleSidebar} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem button onClick={toggleSidebar} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
