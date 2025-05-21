import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/mainMenu/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Header from "./components/Header"; // 👈 ekledik
import Footer from "./components/Footer";
import Explore from "./pages/explore/Explore";
import Dashboard from "./pages/dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Category from "./pages/categories/Category";

function App() {
  return (
    <Router>
      <Header /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
        <Route path="/category/:name" element={<Category />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
