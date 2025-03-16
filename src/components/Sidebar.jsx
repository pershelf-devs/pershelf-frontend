import React from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";

const Sidebar = ({isOpen,toggleSidebar}) => {
    return (
        <>        
            <Drawer anchor= "left" open={isOpen} onClose={toggleSidebar}>
                <div className="w-64 mt-14">
                    <List style={{width:250}}>
                        <ListItem button className="cursor-pointer hove:bg-gray-200" onClick={() => console.log("Navigating to Home")}>
                            <ListItemText primary="Home" />
                        </ListItem>

                        <ListItem button className="cursor-pointer hove:bg-gray-200" onClick={() => console.log("Navigating to Profile")}>
                            <ListItemText primary="Profile" />
                        </ListItem>

                        <ListItem button className="cursor-pointer hove:bg-gray-200" onClick={() => console.log("Navigating to Settings")}>
                            <ListItemText primary="Settings" />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
            
        </>
    );
};

export default Sidebar;