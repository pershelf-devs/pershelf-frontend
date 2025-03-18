import { Checkbox, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from "@mui/material";
import React, { useState } from "react";
import Register from "./Register";
import axios from "axios";

export default function Login() {
  const [open, setLoginModal] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [userLoginInfo, setUserLoginInfo] = useState({
    username: "",
    password: "",
    email: "",
  })

  const handleOpenRegisterModal = () => {
    setLoginModal(false);
    setOpenRegister(true);
  };

  const handleBackToLogin = () => {
    setOpenRegister(false);
    setLoginModal(true);
  };

  const handleUserInfoChange = (e) => {
    setUserLoginInfo({
      ...userLoginInfo,
      [e.target.name]: e.target.value
    })
  }

  const loginURL = "http://localhost:443/api/auth/login";

  const handleLogin = async () => {
    const res = await axios.get(loginURL, {
      params: {
        email: userLoginInfo.email,
        password: userLoginInfo.password,
      }
    })

    // Eğer okey ise user bilgileri ve access token döner.
    // Eğer değil ise hata mesajı döner, kullanıcıya gösterirsin.

    console.log(res);
  }

  return (
    <div className="flex justify-end p-4 text-white">
      <Button variant="contained" color="primary" onClick={() => setLoginModal(true)}>
        Sign In
      </Button>

      <Dialog open={open} onClose={() => setLoginModal(false)}>
        <DialogTitle className="text-center p-3 gap-10">Sign In</DialogTitle>
        <DialogContent className="flex flex-col gap-4 p-3">
          <TextField
            placeholder="E-Mail"
            type="email"
            variant="outlined"
            name="email"
            fullWidth
            autoFocus
            value={userLoginInfo.email}
            onChange={handleUserInfoChange}
          />
          <TextField
            placeholder="Password"
            type="password"
            variant="outlined"
            fullWidth
            name="password"
            value={userLoginInfo.password}
            onChange={handleUserInfoChange}
          />
          <div className="flex justify-between items-center">
            <FormControlLabel control={<Checkbox />} label="Remember Me" />
            <Button color="primary">Forgot Password?</Button>
          </div>
        </DialogContent>
        <DialogActions className="flex flex-col gap-2 px-6 pb-6">
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button variant="outlined" color="secondary" fullWidth onClick={handleOpenRegisterModal}>
            Sign Up
          </Button>
        </DialogActions>
        <pre>
          <code>
            {JSON.stringify(userLoginInfo, null, 2)}
          </code>
        </pre>
      </Dialog>

      <Register open={openRegister} handleClose={() => setOpenRegister(false)} handleBackToLogin={handleBackToLogin} />
    </div>
  );
};