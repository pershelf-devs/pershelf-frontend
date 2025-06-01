import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/user/userSlice";
import { toast } from "react-toastify";
import ExpandableSearchBar from "./ExpandableSearchBar";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const { currentUser } = useSelector((state) => state.user);
  const { access_token } = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const menuRef = useRef(null);

  const handleChangeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  const handleSearch = (query) => {
    console.log("Aranan kitap:", query);
    // Explore sayfasına query parametresiyle git
    navigate(`/explore?query=${encodeURIComponent(query)}`);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-black/20 backdrop-blur-md text-white shadow-lg z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
        <Link 
          to={currentUser ? "/dashboard" : "/"} 
          className="text-2xl font-bold text-white"
        >
          Pershelf
        </Link>

        <nav className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex space-x-8">
          <Link 
            to={currentUser ? "/dashboard" : "/"} 
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

        <div className="flex items-center gap-4">
          <ExpandableSearchBar onSearch={handleSearch} />
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

          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-white text-sm font-medium transition-all duration-200 cursor-pointer"
              > 
                {currentUser?.image_base64 ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/30">
                    <img 
                      src={currentUser.image_base64} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0 border border-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <span className="hidden md:block">{currentUser?.username}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md text-black rounded-xl shadow-lg z-50 border border-white/20 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {currentUser?.image_base64 ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[#2a1a0f]/20">
                          <img 
                            src={currentUser.image_base64} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2a1a0f]/10 flex items-center justify-center text-[#2a1a0f] flex-shrink-0 border border-[#2a1a0f]/20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[#2a1a0f]">{currentUser?.username}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t("Profile")}
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t("Settings")}
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t("Logout")}
                    </button>
                  </div>
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
