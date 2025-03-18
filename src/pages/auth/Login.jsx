import { Checkbox, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from "@mui/material";
import React, { useState } from "react";
import Register from "./Register";

export default function Login() {
  const [open, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  const handleLoginOpen = () => setOpenLogin(true);
  const handleLoginClose = () => setOpenLogin(false);

  const handleRegisterOpen = () => {
    setOpenLogin(false); 
    setOpenRegister(true);
  };

  const handleRegisterClose = () => setOpenRegister(false);
  const handleBackToLogin = () => {
    setOpenRegister(false);
    setOpenLogin(true); 
  };

  return (
    <div className="flex justify-end p-4 text-white">
      <Button variant="contained" color="primary" onClick={handleLoginOpen}>
        Sign In
      </Button>

      <Dialog open={open} onClose={handleLoginClose}>
        <DialogTitle className="text-center p-3 gap-10">Sign In</DialogTitle>
        <DialogContent className="flex flex-col gap-4 p-3">
          <TextField placeholder="E-Mail" type= "email" variant="outlined" fullWidth autoFocus />
          <TextField placeholder="Password" type="password" variant="outlined" fullWidth />
          <div className="flex justify-between items-center">
            <FormControlLabel control={<Checkbox />} label="Remember Me" />
            <Button color="primary">Forgot Password?</Button>
          </div>
        </DialogContent>
        <DialogActions className="flex flex-col gap-2 px-6 pb-6">
          <Button variant="contained" color="primary" fullWidth>
            Login
          </Button>
          <Button variant="outlined" color="secondary" fullWidth onClick={handleRegisterOpen}>
            Sign Up
          </Button>
        </DialogActions>
      </Dialog>
      
      <Register open={openRegister} handleClose={handleRegisterClose} handleBackToLogin={handleBackToLogin} />
    </div>
  );
};