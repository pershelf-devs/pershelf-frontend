import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }

    // Surname validation
    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required";
    } else if (formData.surname.trim().length < 3) {
      newErrors.surname = "Surname must be at least 3 characters long";
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 5) {
      newErrors.username = "Username must be at least 5 characters long";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const password = formData.password;
      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/(?=.*[a-z])/.test(password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/(?=.*[A-Z])/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/(?=.*\d)/.test(password)) {
        newErrors.password = "Password must contain at least one number";
      }
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    try {
      const response = await axios.post("/api/auth/register", formData);

      if (response?.data?.code === "0") {
        toast.success("Registration successful! Redirecting to login page...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorMessage = response?.data?.values?.length > 0 
          ? response.data.values.join(", ") 
          : "Registration failed";
        toast.error(`Registration failed: ${errorMessage}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/registerlogin.png')" }}>
      <div className="relative z-10 bg-white/10 backdrop-blur-md text-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("create_your_pershelf_account")}</h2>

        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          <div>
            <input 
              type="text" 
              name="name" 
              placeholder={t("name")} 
              value={formData.name}
              onChange={handleChange} 
              className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none ${errors.name ? 'border-2 border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <input 
              type="text" 
              name="surname" 
              placeholder={t("surname")} 
              value={formData.surname}
              onChange={handleChange} 
              className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none ${errors.surname ? 'border-2 border-red-500' : ''}`}
            />
            {errors.surname && <p className="text-red-300 text-xs mt-1">{errors.surname}</p>}
          </div>

          <div>
            <input 
              type="text" 
              name="username" 
              placeholder={t("username")} 
              value={formData.username}
              onChange={handleChange} 
              className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none ${errors.username ? 'border-2 border-red-500' : ''}`}
            />
            {errors.username && <p className="text-red-300 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <input 
              type="email" 
              name="email" 
              placeholder={t("email")} 
              value={formData.email}
              onChange={handleChange} 
              className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none ${errors.email ? 'border-2 border-red-500' : ''}`}
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <input 
              type="password" 
              name="password" 
              placeholder={t("password")} 
              value={formData.password}
              onChange={handleChange} 
              className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none ${errors.password ? 'border-2 border-red-500' : ''}`}
            />
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
            <p className="text-white/60 text-xs mt-1">{t("password_requirements")}</p>
          </div>

          <div>
            <input 
              type="password" 
              name="confirm_password" 
              placeholder={t("confirm_password")} 
              value={formData.confirm_password}
              onChange={handleChange} 
              className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none ${errors.confirm_password ? 'border-2 border-red-500' : ''}`}
            />
            {errors.confirm_password && <p className="text-red-300 text-xs mt-1">{errors.confirm_password}</p>}
          </div>

          <button type="submit" className="bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition">
            {t("register")}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          {t("already_have_an_account")}
          <a href="/login" className="underline text-white/90 hover:text-white">
            {t("login_here")}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;