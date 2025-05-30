import React from "react";
import { Routes, Route } from "react-router-dom";

// Sayfalar
import Home from "../pages/mainMenu/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import Explore from "../pages/explore/Explore";
import Category from "../pages/categories/Category";
import ProfilePage from "../pages/profile/ProfilePage";
import SettingsPage from "../pages/profile/Settings";
import SocialPage from "../pages/social/SocialPage";
import BookDetail from "../pages/book/BookDetail";
// Wrapper  
import PrivateRoute from "../components/PrivateRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/category/:name" element={<Category />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/social" element={<SocialPage />} />
      <Route path="/book/:id" element={<BookDetail />} />
    </Routes>
  );
};

export default AppRoutes;
