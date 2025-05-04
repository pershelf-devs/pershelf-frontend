import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();

  const handleChangeLanguage = (language) => {
    i18n.changeLanguage(language);
  };    
  return (
    <header className="absolute top-0 left-0 w-full z-20 bg-black/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-wide hover:underline">
          Pershelf
        </Link>

        {/* Menü */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:underline">{t("home")}</Link>
          <Link to="/explore" className="hover:underline">{t("explore")}</Link>
          <Link to="/community" className="hover:underline">{t("Social")}</Link>
        </nav>

        {/* Sağ tarafta Sign In */}
        <div className="flex items-center gap-4">
          {/* Opsiyonel: Arama */}
          {/* <input type="text" placeholder="Search..." className="px-3 py-1 rounded-full text-sm bg-white/10 placeholder-white/60 text-white focus:outline-none" /> */}
        
          {/* Language */}
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

          <Link to="/login" className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-semibold">
            {t("signIn")}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
