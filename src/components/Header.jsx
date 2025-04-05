import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="absolute top-0 left-0 w-full z-20 bg-black/10 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-wide hover:underline">
          Pershelf
        </Link>

        {/* Menü */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/explore" className="hover:underline">Explore</Link>
          <Link to="/lists" className="hover:underline">My Lists</Link>
          <Link to="/community" className="hover:underline">Community</Link>

        </nav>

        {/* Sağ tarafta Sign In */}
        <div className="flex items-center gap-4">
          {/* Opsiyonel: Arama */}
          {/* <input type="text" placeholder="Search..." className="px-3 py-1 rounded-full text-sm bg-white/10 placeholder-white/60 text-white focus:outline-none" /> */}
          
          <Link to="/login" className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
