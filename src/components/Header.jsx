import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userInfo, setUserInfo] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Kullanıcı bilgilerini yükle
  const loadUserInfo = () => {
    const token = localStorage.getItem("token");
    const userInfoStr = localStorage.getItem("userInfo");
    
    if (token && userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserInfo(userInfo);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user info:", error);
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  useEffect(() => {
    // İlk yüklemede kullanıcı bilgilerini yükle
    loadUserInfo();

    // Storage değişikliklerini dinle
    const handleStorageChange = () => {
      loadUserInfo();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleChangeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setIsLoggedIn(false);
    setUserInfo(null);
    navigate("/");
  };

  // Kullanıcı adını belirle (önce name, sonra username, sonra email)
  const getUserDisplayName = () => {
    if (!userInfo) return "";
    
    if (userInfo.name && userInfo.surname) {
      return `${userInfo.name} ${userInfo.surname}`;
    } else if (userInfo.name) {
      return userInfo.name;
    } else if (userInfo.username) {
      return userInfo.username;
    } else if (userInfo.email) {
      return userInfo.email;
    }
    return "User";
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-black/20 backdrop-blur-md text-white shadow-lg z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          to={isLoggedIn ? "/dashboard" : "/"} 
          className="text-2xl font-bold text-white"
        >
          Pershelf
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link 
            to={isLoggedIn ? "/dashboard" : "/"} 
            className="hover:text-gray-300 transition"
          >
            {t("home")}
          </Link>
          <Link to="/explore" className="hover:text-gray-300 transition">
            {t("explore")}
          </Link>
          <Link to="/social" className="hover:text-gray-300 transition">
            Social
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => handleChangeLanguage("en")}
              className={`px-2 py-1 text-xs rounded ${
                i18n.language === "en" ? "bg-white text-black" : "text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleChangeLanguage("tr")}
              className={`px-2 py-1 text-xs rounded ${
                i18n.language === "tr" ? "bg-white text-black" : "text-white"
              }`}
            >
              TR
            </button>
          </div>

          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="bg-white/90 text-[#2a1a0f] px-4 py-2 rounded-md hover:bg-white text-sm font-semibold transition"
              > 
                👤 {getUserDisplayName()}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-sm text-black rounded-md shadow-lg z-50 border border-white/20">
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
              className="bg-white/90 text-black px-4 py-2 rounded-md hover:bg-white text-sm font-semibold transition"
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
