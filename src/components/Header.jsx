import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Token kontrolü
useEffect(() => {
  const checkLogin = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  checkLogin(); // ilk kontrol

  window.addEventListener("storage", checkLogin); // her değişiklikte tekrar kontrol et

  return () => {
    window.removeEventListener("storage", checkLogin);
  };
}, []);

  const handleChangeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="absolute top-0 left-0 w-full z-20 bg-black/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white">
        {/* Logo */}
      <Link to={isLoggedIn ? "/dashboard" : "/"}className="text-xl font-bold tracking-wide hover:underline">
        Pershelf
      </Link>

        {/* Menü */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link to={isLoggedIn ? "/dashboard" : "/"} className="hover:underline">{t("home")}</Link>
          <Link to="/explore" className="hover:underline">{t("explore")}</Link>
          <Link to="/community" className="hover:underline">{t("Social")}</Link>
        </nav>

        {/* Sağ Menü */}
        <div className="flex items-center gap-4">
          {/* Dil */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleChangeLanguage("en")}
              className={`px-2 py-1 rounded ${i18n.language === "en" ? "bg-white/20" : ""}`}
            >
              EN
            </button>
            <button 
              onClick={() => handleChangeLanguage("tr")}
              className={`px-2 py-1 rounded ${i18n.language === "tr" ? "bg-white/20" : ""}`}
            >
              TR
            </button>
          </div>

          {/* Giriş Durumu */}
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-semibold"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-semibold"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
