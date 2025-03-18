import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Checkbox } from "@mui/material";
import React, { useState } from "react";

export default function Register({open, handleClose, handleBackToLogin}) {
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        ageConfirmed: false,
        privacyPolicyAccepted: false,
      });

      const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
      };

      const handleSubmit = () => {
        if (!formData.ageConfirmed || !formData.privacyPolicyAccepted) {
            alert("Please check all the check boxes.");
            return;
        }

        console.log("The registration form has been sent.", formData);
        handleClose();  
      };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle className="text-center p-3">Join Pershelf</DialogTitle>
            <DialogContent className="flex flex-col gap-4 p-3">
                <TextField placeholder="E-Mail" name="email" type="email" variant="outlined" fullWidth value={formData.email} onChange={handleChange}/>
                <TextField placeholder="Username" name="username" type="username" variant="outlined" fullWidth value={formData.username} onChange={handleChange} />
                <TextField placeholder="Password" name="password" type="password" variant="outlined" fullWidth value={formData.password} onChange={handleChange} />
                <FormControlLabel control={<Checkbox name="ageConfirmed" checked={formData.ageConfirmed} onChange={handleChange}/>}
                    label="I'm at least 16 years old and accept the Terms of Use."/>
                <FormControlLabel control={<Checkbox name="privacyPolicyAccepted" checked={formData.privacyPolicyAccepted} onChange={handleChange}/>}
                    label="I accept the Privacy Policy and consent to the processing of my personal information."/>
        
            <div className="flex justify-center p-2 bg-gray-200 rounded">
            <p>Captcha will be here.(Optional)</p>
            </div>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
                    Register
                </Button>
                <Button variant="outlined" color="secondary" fullWidth onClick={handleBackToLogin}>
                    Back to Login
                </Button>
            </DialogActions>
        </Dialog>
    );
};