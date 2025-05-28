import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);


  // Token kontrolü
useEffect(() => {
  const token = localStorage.getItem("token");
  setIsLoggedIn(!!token);

  if (token) {
    fetch("https://your-api.com/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUserName(data.username || data.name || "User");
      })
      .catch(() => {
        setUserName("User");
      });
  }
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
    <header className="w-full bg-[#2a1a0f] text-[#f8f8f2] shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white">
        {/* Logo */}
      <Link to={isLoggedIn ? "/dashboard" : "/"}className="text-xl font-bold tracking-wide hover:underline">
        Pershelf
      </Link>

        {/* Menü */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link to={isLoggedIn ? "/dashboard" : "/"} className="hover:underline">{t("home")}</Link>
          <Link to="/explore" className="hover:underline">{t("explore")}</Link>
          <Link to="/social" className="hover:underline">{t("Social")}</Link>
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
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="bg-white text-[#2a1a0f] px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-semibold"
              >
                @{userName}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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
