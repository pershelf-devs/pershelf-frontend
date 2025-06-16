import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/user/userSlice";
import ExpandableSearchBar from "./ExpandableSearchBar";
import NotificationService from "../utils/notificationService";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const { currentUser } = useSelector((state) => state.user);
  const { access_token } = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const menuRef = useRef(null);

  const handleChangeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const handleLogout = () => {
    dispatch(logout());
    NotificationService.auth.logoutSuccess();
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleSearch = (query) => {
    console.log("Aranan kitap:", query);
    NotificationService.info(`"${query}" için arama sonuçları yükleniyor...`);
    // Explore sayfasına query parametresiyle git
    navigate(`/explore?query=${encodeURIComponent(query)}`);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-black">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative">
        <Link
          to={currentUser ? "/dashboard" : "/"}
          className="text-xl sm:text-2xl font-bold text-white"
        >
          Pershelf
        </Link>

        {/* Desktop Navigation */}
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
            {t("social")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar - Hidden on very small screens */}
          {/*
          <div className="hidden sm:block">
            <ExpandableSearchBar onSearch={handleSearch} />
          </div>
            */}

          {/* Language Switcher */}
          <div className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => handleChangeLanguage("en")}
              className={`px-1.5 sm:px-2 py-1 text-xs rounded ${i18n.language === "en" ? "bg-white text-black" : "text-white"
                }`}
            >
              EN
            </button>
            <button
              onClick={() => handleChangeLanguage("tr")}
              className={`px-1.5 sm:px-2 py-1 text-xs rounded ${i18n.language === "tr" ? "bg-white text-black" : "text-white"
                }`}
            >
              TR
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop User Menu */}
          {currentUser ? (
            <div className="relative hidden md:block">
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
                <span>{currentUser?.username}</span>
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
              className="hidden md:block bg-white/90 text-black px-4 py-2 rounded-md hover:bg-white text-sm font-semibold transition"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search Bar */}
            {/*
            <div className="sm:hidden">
              <ExpandableSearchBar onSearch={handleSearch} />
            </div>
              */}

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link
                to={currentUser ? "/dashboard" : "/"}
                className="block py-2 text-white hover:text-gray-300 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("home")}
              </Link>
              <Link
                to="/explore"
                className="block py-2 text-white hover:text-gray-300 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("explore")}
              </Link>
              <Link
                to="/social"
                className="block py-2 text-white hover:text-gray-300 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("social")}
              </Link>
            </div>

            {/* Mobile User Section */}
            {currentUser ? (
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  {currentUser?.image_base64 ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/30">
                      <img
                        src={currentUser.image_base64}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0 border border-white/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{currentUser?.username}</p>
                    <p className="text-gray-300 text-sm">{currentUser?.email}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 py-2 text-white hover:text-gray-300 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t("Profile")}
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 py-2 text-white hover:text-gray-300 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("Settings")}
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full py-2 text-red-400 hover:text-red-300 transition cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t("Logout")}
                </button>
              </div>
            ) : (
              <div className="border-t border-white/10 pt-4">
                <Link
                  to="/login"
                  className="block w-full bg-white/90 text-black text-center px-4 py-2 rounded-md hover:bg-white text-sm font-semibold transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("signIn")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
