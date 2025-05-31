import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post("/api/auth/login", userInfo);
    const data = response.data;
    console.log("🧾 Full login response:", data);

    if (data?.code === "10") {
      // Kullanıcı bulunamadı
      toast.error(`Incorrect email address or password.`);
    } else if (data?.code === "11") {
      // Şifre yanlış
      toast.error("Incorrect email address or password.");
    } else if (data?.status?.code === "0") {
      // Başarılı giriş
      const token = data?.data?.token;
      const userInfo = data?.data?.userInfo;
      
      if (token && userInfo) {
        // Token'ı kaydet
        localStorage.setItem("token", token);
        
        // Kullanıcı bilgilerini kaydet
        localStorage.setItem("userInfo", JSON.stringify({
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          name: userInfo.name,
          surname: userInfo.surname
        }));
        
        window.dispatchEvent(new Event("storage"));
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.warn("Login succeeded but token or user info missing.");
      }
    } else {
      toast.error(`Login failed. Unexpected code: ${data?.code || data?.status?.code}`);
    }
  } catch (error) {
    console.error("❌ Login catch error:", error.response?.data || error.message);
    toast.error("An error occurred during login.");
  }
};
  

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/registerlogin.png')" }}
    >

      {/* Login kutusu */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md text-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign in to Pershelf</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none"
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none"
            onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
          />
          <button
            type="submit"
            className="bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition"
          >
            {t("login")}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Don't have an account?{" "}
          <a href="/register" className="underline text-white/90 hover:text-white">
            Register here
          </a>
        </p>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Login;
